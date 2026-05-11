<script setup lang="ts">
import type { Subscription } from '~/lib/schemas'
import { useFormatCurrency, useFormatDate } from '~/composables/format'
import { paidSinceStart, upcomingDueDates } from '~/lib/cadence'
import { downloadText, safeFilename } from '~/lib/download'
import { buildSubscriptionIcs, uidForSubscription } from '~/lib/ics'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps<{
  sub: Subscription
}>()

const { t } = useI18n()
const { format: formatCurrency } = useFormatCurrency()
const { format: formatDate } = useFormatDate()
const settings = useSettingsStore()

const upcoming = computed(() => upcomingDueDates(props.sub.startDate, props.sub.cadence, 6))
const paid = computed(() => paidSinceStart(props.sub))

function exportToCalendar() {
  const ics = buildSubscriptionIcs(props.sub, { currency: settings.preferredCurrency })
  downloadText(`${safeFilename(props.sub.name)}.ics`, ics)
  settings.recordExportedUids([uidForSubscription(props.sub)])
}
</script>

<template>
  <div class="space-y-4">
    <button
      type="button"
      class="btn btn-ghost btn-sm gap-2 border border-base-300 w-full justify-center"
      @click="exportToCalendar"
    >
      <span class="icon-[carbon--calendar-add] size-4" />
      {{ t('calendar.add_this') }}
    </button>

    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
        {{ t('detail.next_due_dates') }}
      </p>
      <ul class="rounded-lg border border-base-300 divide-y divide-base-300">
        <li
          v-for="(d, i) in upcoming"
          :key="i"
          class="px-3 py-2 text-sm flex items-center justify-between"
        >
          <span>{{ formatDate(d) }}</span>
          <span class="opacity-60 text-xs">{{ i === 0 ? t('detail.next_label') : '' }}</span>
        </li>
      </ul>
    </div>

    <div v-if="paid.months > 0" class="rounded-lg bg-base-200 px-3 py-2 text-sm">
      <p class="text-xs opacity-60">
        {{ t('detail.total_paid_label') }}
      </p>
      <p class="font-medium">
        ≈ {{ formatCurrency(paid.amount) }}
        <span class="text-xs opacity-60">
          ({{ t('detail.over_n_months', { n: paid.months }, paid.months) }})
        </span>
      </p>
    </div>
  </div>
</template>
