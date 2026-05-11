import type { CategoryId } from '~/data/categories'
import type { Subscription } from './schemas'
import { monthlyEquivalent } from './cadence'

export function activeSubs(subs: Subscription[]): Subscription[] {
  return subs.filter(s => s.status === 'active')
}

export function monthlyTotal(subs: Subscription[]): number {
  return activeSubs(subs).reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.cadence), 0)
}

export function yearlyTotal(subs: Subscription[]): number {
  return monthlyTotal(subs) * 12
}

export function monthlyByCategory(subs: Subscription[]): Map<CategoryId, number> {
  const out = new Map<CategoryId, number>()
  for (const s of activeSubs(subs)) {
    const m = monthlyEquivalent(s.amount, s.cadence)
    out.set(s.categoryId as CategoryId, (out.get(s.categoryId as CategoryId) ?? 0) + m)
  }
  return out
}

export interface TopSub {
  sub: Subscription
  monthly: number
}

export function topMostExpensive(subs: Subscription[], n: number): TopSub[] {
  return activeSubs(subs)
    .map(sub => ({ sub, monthly: monthlyEquivalent(sub.amount, sub.cadence) }))
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, n)
}
