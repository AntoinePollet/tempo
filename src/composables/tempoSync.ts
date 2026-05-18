import { watchDebounced } from '@vueuse/core'
import { format } from 'date-fns'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { ApiError, postSyncDues } from '~/lib/api'
import { nextDueDate } from '~/lib/cadence'
import { useSettingsStore } from '~/stores/settings'
import { useSubscriptionsStore } from '~/stores/subscriptions'
import { getIdentity, isNativePlatform } from './tempoIdentity'
import { pushState } from './tempoPush'

let started = false

/**
 * Wires reactive syncing of active subscriptions to the Tempo Worker.
 * - Initial sync when /register succeeds (pushState.registered → true)
 * - Debounced sync when any active subscription, the notify threshold,
 *   or the preferred currency changes
 *
 * Safe to call multiple times — only the first call sets up the watchers.
 */
export function startSyncDuesAutoPush(): void {
  if (started || !isNativePlatform())
    return
  started = true

  const subs = useSubscriptionsStore()
  const settings = useSettingsStore()
  const { active } = storeToRefs(subs)

  async function flush() {
    if (!pushState.value.registered)
      return

    const identity = await getIdentity()
    if (!identity.userSecret)
      return

    const today = new Date()
    const dues = active.value.map(sub => ({
      id: sub.id,
      subscription_name: sub.name,
      amount_cents: Math.round(sub.amount * 100),
      currency: settings.preferredCurrency,
      next_due_date: format(nextDueDate(sub.startDate, sub.cadence, today), 'yyyy-MM-dd'),
      notify_days_before: settings.bannerThreshold,
    }))

    try {
      await postSyncDues({ user_id: identity.userId, dues }, identity)
    }
    catch (e) {
      if (e instanceof ApiError && e.isUnauthorized) {
        console.error('[tempoSync] 401 from /sync-dues — user_secret out of sync with server')
        pushState.value.error = 'auth_invalid'
        return
      }
      if (e instanceof ApiError && e.isRateLimited) {
        console.warn('[tempoSync] 429 — backing off (next change will retry)')
        return
      }
      console.error('[tempoSync] flush failed', e)
    }
  }

  // Initial sync the moment registration completes
  watch(() => pushState.value.registered, (ready) => {
    if (ready)
      flush()
  })

  // Subsequent syncs — debounced to coalesce rapid edits
  watchDebounced(
    [
      () => active.value,
      () => settings.bannerThreshold,
      () => settings.preferredCurrency,
    ],
    flush,
    { debounce: 1500, deep: true },
  )
}
