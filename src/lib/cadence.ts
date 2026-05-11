import type { Cadence, Subscription } from './schemas'
import { addDays, addMonths, addWeeks, addYears, differenceInMonths, parseISO, startOfDay } from 'date-fns'

const DAYS_PER_YEAR = 365.25
const DAYS_PER_MONTH = DAYS_PER_YEAR / 12

export function addCadence(date: Date, cadence: Cadence, count = 1): Date {
  const n = cadence.interval * count
  switch (cadence.unit) {
    case 'day': return addDays(date, n)
    case 'week': return addWeeks(date, n)
    case 'month': return addMonths(date, n)
    case 'year': return addYears(date, n)
  }
}

export function nextDueDate(startDate: string, cadence: Cadence, today: Date = new Date()): Date {
  const start = parseISO(startDate)
  const todayStart = startOfDay(today)
  if (start > todayStart)
    return start

  let next = start
  while (next <= todayStart)
    next = addCadence(next, cadence)
  return next
}

export function upcomingDueDates(startDate: string, cadence: Cadence, count: number, today: Date = new Date()): Date[] {
  const dates: Date[] = []
  let next = nextDueDate(startDate, cadence, today)
  for (let i = 0; i < count; i++) {
    dates.push(next)
    next = addCadence(next, cadence)
  }
  return dates
}

export function daysPerInterval(cadence: Cadence): number {
  switch (cadence.unit) {
    case 'day': return cadence.interval
    case 'week': return cadence.interval * 7
    case 'month': return cadence.interval * DAYS_PER_MONTH
    case 'year': return cadence.interval * DAYS_PER_YEAR
  }
}

export function monthlyEquivalent(amount: number, cadence: Cadence): number {
  const occurrencesPerYear = DAYS_PER_YEAR / daysPerInterval(cadence)
  return amount * occurrencesPerYear / 12
}

export function yearlyEquivalent(amount: number, cadence: Cadence): number {
  return monthlyEquivalent(amount, cadence) * 12
}

const RRULE_FREQ: Record<Cadence['unit'], string> = {
  day: 'DAILY',
  week: 'WEEKLY',
  month: 'MONTHLY',
  year: 'YEARLY',
}

export function cadenceToRrule(cadence: Cadence): string {
  return `FREQ=${RRULE_FREQ[cadence.unit]};INTERVAL=${cadence.interval}`
}

export interface PaidSinceStart {
  months: number
  amount: number
}

export function paidSinceStart(sub: Subscription, today: Date = new Date()): PaidSinceStart {
  const start = parseISO(sub.startDate)
  if (start > today)
    return { months: 0, amount: 0 }
  const months = Math.max(0, differenceInMonths(startOfDay(today), startOfDay(start)))
  return {
    months,
    amount: monthlyEquivalent(sub.amount, sub.cadence) * months,
  }
}
