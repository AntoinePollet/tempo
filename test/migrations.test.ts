import type { ExportEnvelope } from '~/lib/schemas'
import { migrate } from '~/lib/migrations'
import { CURRENT_SCHEMA_VERSION } from '~/lib/schemas'
import { describe, expect, it } from 'vitest'
import { netflixMonthly } from './fixtures/subscriptions'

function validEnvelope(): ExportEnvelope {
  return {
    schema: CURRENT_SCHEMA_VERSION,
    exportedAt: '2026-05-10T12:00:00.000Z',
    appVersion: '0.1.0',
    data: {
      subscriptions: [netflixMonthly],
      settings: {
        preferredCurrency: 'EUR',
        language: 'en',
        banner: { thresholdDays: 7, dismissedUntil: null },
        calendarUidsExported: [],
        showCancelled: false,
      },
    },
  }
}

describe('migrate', () => {
  it('round-trips a current-version envelope unchanged', () => {
    const env = validEnvelope()
    const out = migrate(env)
    expect(out).toEqual(env)
  })

  it('throws on a missing schema field', () => {
    expect(() => migrate({ data: {} })).toThrow(/schema/i)
  })

  it('throws on a future schema version', () => {
    const env = { ...validEnvelope(), schema: 999 }
    expect(() => migrate(env)).toThrow(/newer/i)
  })

  it('throws on null/undefined input', () => {
    expect(() => migrate(null)).toThrow()
    expect(() => migrate(undefined)).toThrow()
  })

  it('rejects an envelope with a malformed subscription', () => {
    const env = validEnvelope()
    // negative amount fails Zod
    ;(env.data.subscriptions[0] as any).amount = -5
    expect(() => migrate(env)).toThrow()
  })
})
