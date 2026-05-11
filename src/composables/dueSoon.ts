import type { Subscription } from '~/lib/schemas'
import { differenceInCalendarDays, startOfDay } from 'date-fns'
import { nextDueDate } from '~/lib/cadence'
import { useSettingsStore } from '~/stores/settings'
import { useSubscriptionsStore } from '~/stores/subscriptions'

export interface DueSoonItem {
  sub: Subscription
  nextDue: Date
  daysUntil: number
}

export function useDueSoon() {
  const subs = useSubscriptionsStore()
  const settings = useSettingsStore()

  const now = ref(new Date())

  if (typeof window !== 'undefined') {
    onMounted(() => {
      now.value = new Date()
    })
  }

  const items = computed<DueSoonItem[]>(() => {
    const today = startOfDay(now.value)
    return subs.active
      .map((sub) => {
        const nextDue = nextDueDate(sub.startDate, sub.cadence, today)
        const daysUntil = differenceInCalendarDays(nextDue, today)
        return { sub, nextDue, daysUntil }
      })
      .filter(item => item.daysUntil >= 0 && item.daysUntil <= settings.bannerThreshold)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  })

  const isDismissed = computed(() => {
    if (!settings.bannerDismissedUntil)
      return false
    return new Date(settings.bannerDismissedUntil) > now.value
  })

  function dismissUntilTomorrow() {
    const tomorrow4am = new Date(now.value)
    tomorrow4am.setDate(tomorrow4am.getDate() + 1)
    tomorrow4am.setHours(4, 0, 0, 0)
    settings.dismissBannerUntil(tomorrow4am.toISOString())
  }

  return { items, isDismissed, dismissUntilTomorrow }
}
