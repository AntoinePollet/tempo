const LOCALE_TO_CURRENCY: Record<string, string> = {
  'en-US': 'USD',
  'en-CA': 'CAD',
  'en-GB': 'GBP',
  'en-AU': 'AUD',
  'en-NZ': 'NZD',
  'fr-FR': 'EUR',
  'fr-CA': 'CAD',
  'fr-BE': 'EUR',
  'fr-CH': 'CHF',
  'de-DE': 'EUR',
  'de-AT': 'EUR',
  'de-CH': 'CHF',
  'es-ES': 'EUR',
  'es-MX': 'MXN',
  'it-IT': 'EUR',
  'nl-NL': 'EUR',
  'pt-BR': 'BRL',
  'pt-PT': 'EUR',
  'ja-JP': 'JPY',
  'ko-KR': 'KRW',
  'zh-CN': 'CNY',
  'zh-TW': 'TWD',
}

const FALLBACK_BY_LANG: Record<string, string> = {
  en: 'USD',
  fr: 'EUR',
  de: 'EUR',
  es: 'EUR',
  it: 'EUR',
  nl: 'EUR',
  pt: 'EUR',
  ja: 'JPY',
  ko: 'KRW',
  zh: 'CNY',
}

export function detectCurrency(locale: string | undefined = typeof navigator !== 'undefined' ? navigator.language : undefined): string {
  if (!locale)
    return 'EUR'
  if (LOCALE_TO_CURRENCY[locale])
    return LOCALE_TO_CURRENCY[locale]
  const lang = locale.split('-')[0]
  return FALLBACK_BY_LANG[lang] ?? 'EUR'
}

export function detectLanguage(locale: string | undefined = typeof navigator !== 'undefined' ? navigator.language : undefined): 'en' | 'fr' {
  if (!locale)
    return 'en'
  return locale.startsWith('fr') ? 'fr' : 'en'
}
