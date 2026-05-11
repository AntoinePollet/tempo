import { useSettingsStore } from '~/stores/settings'

export function useFormatCurrency() {
  const settings = useSettingsStore()

  function format(amount: number, currency?: string): string {
    const cur = currency ?? settings.preferredCurrency
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur,
    }).format(amount)
  }

  return { format }
}

export function useFormatDate() {
  function format(date: Date | string, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
    return new Intl.DateTimeFormat(locale, opts).format(d)
  }

  return { format }
}
