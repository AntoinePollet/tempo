<script setup lang="ts">
import type { SubscriptionInput } from '~/lib/schemas'
import { useSubscriptionModalStore } from '~/stores/subscriptionModal'
import { useSubscriptionsStore } from '~/stores/subscriptions'

const modal = useSubscriptionModalStore()
const subs = useSubscriptionsStore()
const { t } = useI18n()

const dialog = ref<HTMLDialogElement>()
const deleteDialog = ref<HTMLDialogElement>()

watch(() => modal.isOpen, (open) => {
  if (open && dialog.value && !dialog.value.open)
    dialog.value.showModal()
  else if (!open && dialog.value && dialog.value.open)
    dialog.value.close()
})

function handleNativeClose() {
  if (modal.isOpen)
    modal.close()
}

function onSubmit(input: SubscriptionInput) {
  if (modal.mode === 'edit' && modal.editTarget)
    subs.update(modal.editTarget.id, input)
  else
    subs.add(input)
  modal.close()
}

function onTogglePause() {
  const target = modal.editTarget
  if (!target)
    return
  const next = target.status === 'paused' ? 'active' : 'paused'
  const updated = subs.update(target.id, { status: next })
  if (updated)
    modal.editTarget = updated
}

function onCancelSubscription() {
  const target = modal.editTarget
  if (!target)
    return
  subs.update(target.id, { status: 'cancelled' })
  modal.close()
}

function onDeleteRequest() {
  if (!modal.editTarget)
    return
  deleteDialog.value?.showModal()
}

function confirmDelete() {
  const target = modal.editTarget
  deleteDialog.value?.close()
  if (target)
    subs.remove(target.id)
  modal.close()
}

function cancelDelete() {
  deleteDialog.value?.close()
}

const headerTitle = computed(() => {
  if (modal.mode === 'edit')
    return modal.editTarget?.name ?? t('form.title_edit')
  if (modal.step === 'pick')
    return t('picker.title')
  return modal.selectedCatalog?.name ?? t('form.title_custom')
})

const showBackButton = computed(() => modal.mode === 'add' && modal.step === 'form')
const showForm = computed(() => modal.step === 'form' || modal.mode === 'edit')
const showPicker = computed(() => modal.mode === 'add' && modal.step === 'pick')

const formInstanceKey = computed(() =>
  modal.mode === 'edit'
    ? `edit-${modal.editTarget?.id ?? 'none'}`
    : `add-${modal.selectedCatalog?.id ?? 'custom'}`,
)
</script>

<template>
  <dialog ref="dialog" class="modal" @close="handleNativeClose">
    <div class="modal-box w-11/12 max-w-md max-h-[80dvh] flex flex-col overflow-hidden">
      <div v-if="showPicker" class="flex flex-col gap-3 min-h-0 flex-1">
        <h3 class="text-lg font-semibold shrink-0">
          {{ headerTitle }}
        </h3>
        <CatalogPicker
          class="flex flex-col gap-3 min-h-0 flex-1"
          @pick="modal.pickCatalog($event)"
          @custom="modal.pickCustom()"
        />
      </div>

      <template v-else-if="showForm && modal.isOpen">
        <div class="flex items-center gap-2 shrink-0 pb-3">
          <button
            v-if="showBackButton"
            type="button"
            class="btn btn-ghost btn-sm btn-square"
            :title="t('action.back')"
            @click="modal.back()"
          >
            <span class="icon-[carbon--arrow-left] size-5" />
          </button>
          <h3 class="text-lg font-semibold">
            {{ headerTitle }}
          </h3>
        </div>
        <div :key="formInstanceKey" class="flex flex-col gap-4 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <SubscriptionForm
            :catalog-entry="modal.selectedCatalog"
            :initial="modal.editTarget"
            :submit-label="modal.mode === 'edit' ? t('action.save') : t('action.add')"
            @submit="onSubmit"
            @cancel="modal.close()"
            @toggle-pause="onTogglePause"
            @cancel-subscription="onCancelSubscription"
            @delete="onDeleteRequest"
          />
          <SubscriptionDetails
            v-if="modal.mode === 'edit' && modal.editTarget"
            :sub="modal.editTarget"
          />
        </div>
      </template>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <dialog ref="deleteDialog" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-semibold">
        {{ t('confirm.delete_title') }}
      </h3>
      <p class="py-4 text-sm">
        {{ t('confirm.delete_body', { name: modal.editTarget?.name ?? '' }) }}
      </p>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="cancelDelete">
          {{ t('action.cancel') }}
        </button>
        <button class="btn btn-error" @click="confirmDelete">
          {{ t('action.delete') }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="cancelDelete">
        close
      </button>
    </form>
  </dialog>
</template>
