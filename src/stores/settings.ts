import type { BannerThreshold, UserSettings } from '~/lib/schemas'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { detectCurrency, detectLanguage } from '~/lib/locale'

export const useSettingsStore = defineStore('settings', () => {
  const preferredCurrency = ref<string>(detectCurrency())
  const language = ref<'en' | 'fr'>(detectLanguage())
  const bannerThreshold = ref<BannerThreshold>(7)
  const bannerDismissedUntil = ref<string | null>(null)
  const calendarUidsExported = ref<string[]>([])
  const showCancelled = ref<boolean>(false)

  function setPreferredCurrency(currency: string) {
    preferredCurrency.value = currency
  }

  function setLanguage(lang: 'en' | 'fr') {
    language.value = lang
  }

  function setBannerThreshold(days: BannerThreshold) {
    bannerThreshold.value = days
  }

  function dismissBannerUntil(when: string | null) {
    bannerDismissedUntil.value = when
  }

  function recordExportedUids(uids: string[]) {
    const set = new Set(calendarUidsExported.value)
    for (const uid of uids) set.add(uid)
    calendarUidsExported.value = [...set]
  }

  function clearExportedUids() {
    calendarUidsExported.value = []
  }

  function applySnapshot(snapshot: UserSettings) {
    preferredCurrency.value = snapshot.preferredCurrency
    language.value = snapshot.language
    bannerThreshold.value = snapshot.banner.thresholdDays
    bannerDismissedUntil.value = snapshot.banner.dismissedUntil
    calendarUidsExported.value = [...snapshot.calendarUidsExported]
    showCancelled.value = snapshot.showCancelled
  }

  function snapshot(): UserSettings {
    return {
      preferredCurrency: preferredCurrency.value,
      language: language.value,
      banner: {
        thresholdDays: bannerThreshold.value,
        dismissedUntil: bannerDismissedUntil.value,
      },
      calendarUidsExported: [...calendarUidsExported.value],
      showCancelled: showCancelled.value,
    }
  }

  return {
    preferredCurrency,
    language,
    bannerThreshold,
    bannerDismissedUntil,
    calendarUidsExported,
    showCancelled,
    setPreferredCurrency,
    setLanguage,
    setBannerThreshold,
    dismissBannerUntil,
    recordExportedUids,
    clearExportedUids,
    applySnapshot,
    snapshot,
  }
}, {
  persist: {
    key: 'tempo:settings',
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore as any, import.meta.hot))
