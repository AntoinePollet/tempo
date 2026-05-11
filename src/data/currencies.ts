export const COMMON_CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'CAD',
  'AUD',
  'CHF',
  'JPY',
  'CNY',
  'KRW',
  'BRL',
  'MXN',
  'INR',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'NZD',
] as const

export type CommonCurrency = typeof COMMON_CURRENCIES[number]
