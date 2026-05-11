<script setup lang="ts">
import type { CatalogEntry } from '~/data/catalog'
import type { Cadence, Subscription, SubscriptionInput, SubscriptionStatus } from '~/lib/schemas'
import { z } from 'zod'
import { CATEGORIES } from '~/data/categories'
import { subscriptionInputSchema } from '~/lib/schemas'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps<{
  catalogEntry?: CatalogEntry | null
  initial?: Subscription | null
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [value: SubscriptionInput]
  cancel: []
  togglePause: []
  cancelSubscription: []
  delete: []
}>()

const { t } = useI18n()
const settings = useSettingsStore()

const today = new Date().toISOString().slice(0, 10)
const defaultCadence: Cadence = { interval: 1, unit: 'month' }

const isEdit = computed(() => !!props.initial)

const name = ref(props.initial?.name ?? props.catalogEntry?.name ?? '')
const amountText = ref<string>(props.initial ? props.initial.amount.toString() : '')
const cadence = ref<Cadence>({ ...(props.initial?.cadence ?? props.catalogEntry?.defaultCadence ?? defaultCadence) })
const startDate = ref(props.initial?.startDate ?? today)
const categoryId = ref<string>(props.initial?.categoryId ?? props.catalogEntry?.defaultCategoryId ?? 'other')
const status = ref<SubscriptionStatus>(props.initial?.status ?? 'active')
const notes = ref(props.initial?.notes ?? '')

watch(() => props.initial, (next) => {
  if (!next)
    return
  status.value = next.status
}, { deep: false })

const errors = ref<Record<string, string>>({})

function formatErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!out[path])
      out[path] = issue.message
  }
  return out
}

function onSubmit(event: Event) {
  event.preventDefault()
  const candidate: SubscriptionInput = {
    name: name.value.trim(),
    amount: Number.parseFloat(String(amountText.value).replace(',', '.')),
    cadence: cadence.value,
    startDate: startDate.value,
    categoryId: categoryId.value,
    catalogId: props.catalogEntry?.id ?? props.initial?.catalogId,
    notes: notes.value.trim() || undefined,
    status: status.value,
  }

  const result = subscriptionInputSchema.safeParse(candidate)
  if (!result.success) {
    errors.value = formatErrors(result.error)
    return
  }
  errors.value = {}
  emit('submit', result.data)
}
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <div v-if="isEdit" class="flex justify-end">
      <button
        type="button"
        class="btn btn-sm gap-2"
        :class="status === 'paused' ? 'btn-warning' : 'btn-ghost border border-base-300'"
        @click="emit('togglePause')"
      >
        <span
          :class="status === 'paused' ? 'icon-[carbon--play]' : 'icon-[carbon--pause]'"
          class="size-4"
        />
        {{ status === 'paused' ? t('action.resume') : t('action.pause') }}
      </button>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="sub-name" class="text-sm font-medium">{{ t('form.name') }}</label>
      <input
        id="sub-name"
        v-model="name"
        type="text"
        maxlength="60"
        class="input input-bordered w-full"
        :class="{ 'input-error': errors.name }"
        :placeholder="t('form.name_placeholder')"
        autocomplete="off"
      >
      <p v-if="errors.name" class="text-xs text-error">
        {{ errors.name }}
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="sub-amount" class="text-sm font-medium">
        {{ t('form.amount') }} <span class="opacity-60">({{ settings.preferredCurrency }})</span>
      </label>
      <input
        id="sub-amount"
        v-model="amountText"
        type="number"
        step="0.01"
        min="0.01"
        max="99999.99"
        inputmode="decimal"
        class="input input-bordered w-full"
        :class="{ 'input-error': errors.amount }"
        placeholder="0.00"
      >
      <p v-if="errors.amount" class="text-xs text-error">
        {{ errors.amount }}
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium">{{ t('form.cadence') }}</span>
      <CadencePicker v-model="cadence" />
      <p v-if="errors['cadence.interval']" class="text-xs text-error">
        {{ errors['cadence.interval'] }}
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="sub-start" class="text-sm font-medium">{{ t('form.start_date') }}</label>
      <input
        id="sub-start"
        v-model="startDate"
        type="date"
        class="input input-bordered w-full"
        :class="{ 'input-error': errors.startDate }"
      >
      <p v-if="errors.startDate" class="text-xs text-error">
        {{ errors.startDate }}
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="sub-category" class="text-sm font-medium">{{ t('form.category') }}</label>
      <select id="sub-category" v-model="categoryId" class="select select-bordered w-full">
        <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="sub-status" class="text-sm font-medium">{{ t('form.status') }}</label>
      <select id="sub-status" v-model="status" class="select select-bordered w-full">
        <option value="active">{{ t('status.active') }}</option>
        <option value="paused">{{ t('status.paused') }}</option>
        <option value="cancelled">{{ t('status.cancelled') }}</option>
      </select>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="sub-notes" class="text-sm font-medium">{{ t('form.notes') }}</label>
      <textarea
        id="sub-notes"
        v-model="notes"
        rows="2"
        maxlength="500"
        class="textarea textarea-bordered w-full"
        :placeholder="t('form.notes_placeholder')"
      />
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class="btn btn-ghost" @click="emit('cancel')">
        {{ t('action.cancel') }}
      </button>
      <button type="submit" class="btn btn-primary">
        {{ submitLabel ?? t('action.save') }}
      </button>
    </div>

    <div v-if="isEdit" class="flex items-center justify-between gap-2 border-t border-base-300 pt-3 text-sm">
      <button
        type="button"
        class="link link-error"
        @click="emit('cancelSubscription')"
      >
        {{ t('action.cancel_subscription') }}
      </button>
      <button
        type="button"
        class="btn btn-ghost btn-sm btn-square text-error"
        :title="t('action.delete')"
        @click="emit('delete')"
      >
        <span class="icon-[carbon--trash-can] size-4" />
      </button>
    </div>
  </form>
</template>
