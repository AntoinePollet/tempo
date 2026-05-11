import { addCadence, cadenceToRrule, monthlyEquivalent, nextDueDate, paidSinceStart, upcomingDueDates, yearlyEquivalent } from '~/lib/cadence'
import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { makeSub } from './fixtures/subscriptions'

const ymd = (d: Date) => format(d, 'yyyy-MM-dd')

describe('monthlyEquivalent', () => {
  it('returns the amount unchanged for a monthly sub', () => {
    expect(monthlyEquivalent(15.99, { interval: 1, unit: 'month' })).toBeCloseTo(15.99, 2)
  })

  it('divides yearly amount by 12', () => {
    expect(monthlyEquivalent(120, { interval: 1, unit: 'year' })).toBeCloseTo(10, 2)
  })

  it('multiplies weekly amount by ~4.348 (365.25 / 7 / 12)', () => {
    expect(monthlyEquivalent(25, { interval: 1, unit: 'week' })).toBeCloseTo(108.71, 1)
  })

  it('halves a biweekly amount relative to weekly', () => {
    const weekly = monthlyEquivalent(80, { interval: 1, unit: 'week' })
    const biweekly = monthlyEquivalent(80, { interval: 2, unit: 'week' })
    expect(biweekly).toBeCloseTo(weekly / 2, 2)
  })

  it('handles every-N-days cadence', () => {
    expect(monthlyEquivalent(1, { interval: 1, unit: 'day' })).toBeCloseTo(30.4375, 2)
    expect(monthlyEquivalent(1, { interval: 30, unit: 'day' })).toBeCloseTo(30.4375 / 30, 3)
  })

  it('every-12-months matches yearly', () => {
    const a = monthlyEquivalent(120, { interval: 12, unit: 'month' })
    const b = monthlyEquivalent(120, { interval: 1, unit: 'year' })
    expect(a).toBeCloseTo(b, 1)
  })

  it('yearlyEquivalent is monthly × 12', () => {
    const m = monthlyEquivalent(15.99, { interval: 1, unit: 'month' })
    expect(yearlyEquivalent(15.99, { interval: 1, unit: 'month' })).toBeCloseTo(m * 12, 2)
  })
})

describe('addCadence', () => {
  it('adds days', () => {
    const d = addCadence(new Date(2024, 2, 15), { interval: 5, unit: 'day' })
    expect(ymd(d)).toBe('2024-03-20')
  })

  it('adds months and handles end-of-month rollover', () => {
    const d = addCadence(new Date(2024, 0, 31), { interval: 1, unit: 'month' })
    expect(d.getMonth()).toBe(1) // February
    expect(d.getDate()).toBeGreaterThanOrEqual(28)
    expect(d.getDate()).toBeLessThanOrEqual(29)
  })
})

describe('nextDueDate', () => {
  it('returns startDate when sub starts in the future', () => {
    const today = new Date(2024, 5, 1)
    const next = nextDueDate('2099-01-01', { interval: 1, unit: 'month' }, today)
    expect(ymd(next)).toBe('2099-01-01')
  })

  it('finds the next monthly occurrence after today', () => {
    const today = new Date(2024, 5, 20)
    const next = nextDueDate('2024-03-15', { interval: 1, unit: 'month' }, today)
    expect(ymd(next)).toBe('2024-07-15')
  })

  it('finds the next yearly occurrence', () => {
    const today = new Date(2025, 3, 1)
    const next = nextDueDate('2024-01-01', { interval: 1, unit: 'year' }, today)
    expect(ymd(next)).toBe('2026-01-01')
  })

  it('finds the next biweekly occurrence', () => {
    const today = new Date(2024, 4, 1)
    const next = nextDueDate('2024-04-01', { interval: 2, unit: 'week' }, today)
    expect(ymd(next)).toBe('2024-05-13')
  })

  it('handles end-of-month rollover (Jan 31 monthly)', () => {
    const today = new Date(2024, 1, 15)
    const next = nextDueDate('2024-01-31', { interval: 1, unit: 'month' }, today)
    // date-fns rolls Jan 31 + 1 month → Feb 29 (leap) — so next due is Feb 29 (today is Feb 15)
    expect(ymd(next)).toBe('2024-02-29')
  })
})

describe('upcomingDueDates', () => {
  it('returns N consecutive future occurrences', () => {
    const today = new Date(2024, 5, 20)
    const list = upcomingDueDates('2024-03-15', { interval: 1, unit: 'month' }, 3, today)
    expect(list.map(ymd)).toEqual([
      '2024-07-15',
      '2024-08-15',
      '2024-09-15',
    ])
  })
})

describe('paidSinceStart', () => {
  it('returns 0 when the sub starts in the future', () => {
    const sub = makeSub({ startDate: '2099-01-01', amount: 15.99, cadence: { interval: 1, unit: 'month' } })
    const result = paidSinceStart(sub, new Date(2024, 5, 1))
    expect(result).toEqual({ months: 0, amount: 0 })
  })

  it('multiplies monthly equivalent by months elapsed', () => {
    const sub = makeSub({ startDate: '2024-01-15', amount: 10, cadence: { interval: 1, unit: 'month' } })
    const result = paidSinceStart(sub, new Date(2024, 6, 15))
    expect(result.months).toBe(6)
    expect(result.amount).toBeCloseTo(60, 2)
  })

  it('rounds down (excludes partial months)', () => {
    const sub = makeSub({ startDate: '2024-01-15', amount: 10, cadence: { interval: 1, unit: 'month' } })
    const result = paidSinceStart(sub, new Date(2024, 6, 14))
    expect(result.months).toBe(5)
  })

  it('handles yearly cadence (each year ≈ 12 monthly equivalents)', () => {
    const sub = makeSub({ startDate: '2024-01-01', amount: 120, cadence: { interval: 1, unit: 'year' } })
    const result = paidSinceStart(sub, new Date(2026, 0, 1))
    expect(result.months).toBe(24)
    // monthly equivalent of 120/year = 10/month → 24 months × 10 = 240
    expect(result.amount).toBeCloseTo(240, 0)
  })
})

describe('cadenceToRrule', () => {
  it('maps every cadence unit to RRULE freq', () => {
    expect(cadenceToRrule({ interval: 1, unit: 'day' })).toBe('FREQ=DAILY;INTERVAL=1')
    expect(cadenceToRrule({ interval: 2, unit: 'week' })).toBe('FREQ=WEEKLY;INTERVAL=2')
    expect(cadenceToRrule({ interval: 1, unit: 'month' })).toBe('FREQ=MONTHLY;INTERVAL=1')
    expect(cadenceToRrule({ interval: 1, unit: 'year' })).toBe('FREQ=YEARLY;INTERVAL=1')
  })
})
