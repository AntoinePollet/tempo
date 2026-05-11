<script setup lang="ts">
import type { Subscription } from '~/lib/schemas'
import { differenceInCalendarDays, startOfDay } from 'date-fns'
import { useFormatCurrency, useFormatDate } from '~/composables/format'
import { findInCatalog } from '~/data/catalog'
import { getCategory } from '~/data/categories'
import { monthlyEquivalent, nextDueDate } from '~/lib/cadence'
import { useSubscriptionModalStore } from '~/stores/subscriptionModal'

const props = defineProps<{
  sub: Subscription
}>()

const { format } = useFormatCurrency()
const { format: formatDate } = useFormatDate()
const { t } = useI18n()
const modal = useSubscriptionModalStore()

const catalog = computed(() => props.sub.catalogId ? findInCatalog(props.sub.catalogId) : undefined)
const monthly = computed(() => monthlyEquivalent(props.sub.amount, props.sub.cadence))
const category = computed(() => getCategory(props.sub.categoryId))

const dueLabel = computed(() => {
  if (props.sub.status !== 'active')
    return null
  const next = nextDueDate(props.sub.startDate, props.sub.cadence)
  const days = differenceInCalendarDays(next, startOfDay(new Date()))
  if (days === 0)
    return t('row.due_today')
  if (days === 1)
    return t('row.due_tomorrow')
  if (days > 1 && days <= 7)
    return t('row.due_in_days', { n: days }, days)
  return formatDate(next, { month: 'short', day: 'numeric' })
})

const isUrgent = computed(() => {
  if (props.sub.status !== 'active')
    return false
  const next = nextDueDate(props.sub.startDate, props.sub.cadence)
  const days = differenceInCalendarDays(next, startOfDay(new Date()))
  return days >= 0 && days <= 3
})
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-base-200"
    @click="modal.openEdit(sub)"
  >
    <CatalogIcon :entry="catalog" :name="sub.name" />

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="truncate font-medium">
          {{ sub.name }}
        </p>
        <span
          v-if="sub.status === 'paused'"
          class="badge badge-sm badge-warning"
        >
          {{ t('status.paused') }}
        </span>
        <span
          v-else-if="sub.status === 'cancelled'"
          class="badge badge-sm"
        >
          {{ t('status.cancelled') }}
        </span>
      </div>
      <p class="truncate text-xs">
        <span v-if="dueLabel" :class="isUrgent ? 'font-medium text-warning' : 'opacity-70'">
          {{ dueLabel }}
        </span>
        <span v-if="dueLabel && category" class="opacity-40"> · </span>
        <span v-if="category" class="opacity-70">{{ category.name }}</span>
      </p>
    </div>

    <div class="text-right">
      <p class="font-medium">
        {{ format(sub.amount) }}
      </p>
      <p class="text-xs opacity-70">
        ≈ {{ format(monthly) }}{{ t('home.per_month_short') }}
      </p>
    </div>
  </button>
</template>
