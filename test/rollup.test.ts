import { monthlyByCategory, monthlyTotal, topMostExpensive, yearlyTotal } from '~/lib/rollup'
import { describe, expect, it } from 'vitest'
import {
  allFixtures,
  biweeklyCleaner,
  cancelledOldSub,
  domainYearly,
  futureQuarterly,
  mealKitWeekly,
  netflixMonthly,
  pausedGym,
} from './fixtures/subscriptions'

describe('monthlyTotal', () => {
  it('sums monthly equivalents of active subs only', () => {
    const total = monthlyTotal([netflixMonthly, domainYearly])
    // Netflix 15.99 + domain 12/12 = 1.00 → 16.99
    expect(total).toBeCloseTo(16.99, 2)
  })

  it('excludes paused subs', () => {
    const withPaused = monthlyTotal([netflixMonthly, pausedGym])
    expect(withPaused).toBeCloseTo(15.99, 2)
  })

  it('excludes cancelled subs', () => {
    const withCancelled = monthlyTotal([netflixMonthly, cancelledOldSub])
    expect(withCancelled).toBeCloseTo(15.99, 2)
  })

  it('counts future-dated subs', () => {
    // futureQuarterly = 60 every 3 months → 20/month equivalent
    const total = monthlyTotal([futureQuarterly])
    expect(total).toBeCloseTo(20, 0)
  })

  it('sums weekly + biweekly correctly', () => {
    const total = monthlyTotal([mealKitWeekly, biweeklyCleaner])
    // 25 weekly = 25 * 365.25/7 / 12 ≈ 108.66
    // 80 biweekly = 80 * 365.25/14 / 12 ≈ 173.86
    expect(total).toBeCloseTo(108.66 + 173.86, 0)
  })

  it('returns 0 for an empty list', () => {
    expect(monthlyTotal([])).toBe(0)
  })
})

describe('yearlyTotal', () => {
  it('is exactly monthlyTotal × 12', () => {
    const m = monthlyTotal(allFixtures)
    expect(yearlyTotal(allFixtures)).toBeCloseTo(m * 12, 6)
  })
})

describe('monthlyByCategory', () => {
  it('groups active subs by categoryId', () => {
    const map = monthlyByCategory([netflixMonthly, domainYearly, pausedGym])
    expect(map.get('streaming')).toBeCloseTo(15.99, 2)
    expect(map.get('cloud')).toBeCloseTo(1.0, 2)
    // paused excluded
    expect(map.get('fitness')).toBeUndefined()
  })

  it('sums multiple subs in the same category', () => {
    const a = { ...netflixMonthly, id: 'a', amount: 10 }
    const b = { ...netflixMonthly, id: 'b', amount: 20 }
    const map = monthlyByCategory([a, b])
    expect(map.get('streaming')).toBeCloseTo(30, 2)
  })
})

describe('topMostExpensive', () => {
  it('sorts active subs by monthly cost descending and slices N', () => {
    const top = topMostExpensive(allFixtures, 3)
    expect(top).toHaveLength(3)
    expect(top[0].monthly).toBeGreaterThanOrEqual(top[1].monthly)
    expect(top[1].monthly).toBeGreaterThanOrEqual(top[2].monthly)
  })

  it('returns fewer when N exceeds active count', () => {
    const top = topMostExpensive([netflixMonthly], 5)
    expect(top).toHaveLength(1)
  })

  it('excludes paused and cancelled', () => {
    const top = topMostExpensive([pausedGym, cancelledOldSub], 5)
    expect(top).toHaveLength(0)
  })
})
