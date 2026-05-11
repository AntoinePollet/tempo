import type { Subscription } from '~/lib/schemas'

export function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Netflix',
    amount: 15.99,
    cadence: { interval: 1, unit: 'month' },
    startDate: '2024-03-15',
    categoryId: 'streaming',
    catalogId: 'netflix',
    notes: undefined,
    status: 'active',
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: '2024-03-15T00:00:00.000Z',
    ...overrides,
  }
}

export const netflixMonthly = makeSub({
  id: '00000000-0000-4000-8000-000000000010',
  name: 'Netflix',
  amount: 15.99,
  cadence: { interval: 1, unit: 'month' },
  startDate: '2024-03-15',
  categoryId: 'streaming',
})

export const domainYearly = makeSub({
  id: '00000000-0000-4000-8000-000000000011',
  name: 'Domain renewal',
  amount: 12,
  cadence: { interval: 1, unit: 'year' },
  startDate: '2024-01-01',
  categoryId: 'cloud',
})

export const mealKitWeekly = makeSub({
  id: '00000000-0000-4000-8000-000000000012',
  name: 'Meal kit',
  amount: 25,
  cadence: { interval: 1, unit: 'week' },
  startDate: '2024-06-03',
  categoryId: 'food',
})

export const biweeklyCleaner = makeSub({
  id: '00000000-0000-4000-8000-000000000013',
  name: 'Cleaner',
  amount: 80,
  cadence: { interval: 2, unit: 'week' },
  startDate: '2024-04-01',
  categoryId: 'utilities',
})

export const pausedGym = makeSub({
  id: '00000000-0000-4000-8000-000000000014',
  name: 'Gym',
  amount: 30,
  cadence: { interval: 1, unit: 'month' },
  startDate: '2023-09-01',
  categoryId: 'fitness',
  status: 'paused',
})

export const cancelledOldSub = makeSub({
  id: '00000000-0000-4000-8000-000000000015',
  name: 'Old SaaS',
  amount: 9.99,
  cadence: { interval: 1, unit: 'month' },
  startDate: '2022-01-01',
  categoryId: 'software',
  status: 'cancelled',
})

export const futureQuarterly = makeSub({
  id: '00000000-0000-4000-8000-000000000016',
  name: 'Future sub',
  amount: 60,
  cadence: { interval: 3, unit: 'month' },
  startDate: '2099-01-01',
  categoryId: 'other',
})

export const allFixtures = [
  netflixMonthly,
  domainYearly,
  mealKitWeekly,
  biweeklyCleaner,
  pausedGym,
  cancelledOldSub,
  futureQuarterly,
]
