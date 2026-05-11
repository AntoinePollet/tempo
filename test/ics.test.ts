import { buildBulkIcs, buildCancelIcs, buildSubscriptionIcs, uidForSubscription } from '~/lib/ics'
import { describe, expect, it } from 'vitest'
import { biweeklyCleaner, domainYearly, netflixMonthly } from './fixtures/subscriptions'

const FIXED_NOW = new Date('2026-05-10T12:00:00Z')

describe('buildSubscriptionIcs', () => {
  it('wraps a single VEVENT in a VCALENDAR with METHOD:PUBLISH', () => {
    const ics = buildSubscriptionIcs(netflixMonthly, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('METHOD:PUBLISH')
    expect(ics).toContain('CALSCALE:GREGORIAN')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('uses the subscription id for UID and includes domain', () => {
    const ics = buildSubscriptionIcs(netflixMonthly, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain(`UID:${uidForSubscription(netflixMonthly)}`)
    expect(ics).toContain('@recur.app')
  })

  it('emits DTSTART as a date-only with VALUE=DATE', () => {
    const ics = buildSubscriptionIcs(netflixMonthly, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('DTSTART;VALUE=DATE:20240315')
  })

  it('emits the correct RRULE for the cadence', () => {
    const monthly = buildSubscriptionIcs(netflixMonthly, { currency: 'EUR', now: FIXED_NOW })
    expect(monthly).toContain('RRULE:FREQ=MONTHLY;INTERVAL=1')

    const yearly = buildSubscriptionIcs(domainYearly, { currency: 'EUR', now: FIXED_NOW })
    expect(yearly).toContain('RRULE:FREQ=YEARLY;INTERVAL=1')

    const biweekly = buildSubscriptionIcs(biweeklyCleaner, { currency: 'EUR', now: FIXED_NOW })
    expect(biweekly).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2')
  })

  it('embeds a 24-hour VALARM with DISPLAY action', () => {
    const ics = buildSubscriptionIcs(netflixMonthly, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('ACTION:DISPLAY')
    expect(ics).toContain('TRIGGER:-PT24H')
    expect(ics).toContain('END:VALARM')
  })

  it('includes the amount + currency in DESCRIPTION', () => {
    const ics = buildSubscriptionIcs(netflixMonthly, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('DESCRIPTION:Recurring charge: 15.99 EUR')
  })

  it('escapes commas, semicolons, backslashes, and newlines in summary', () => {
    const sub = { ...netflixMonthly, name: 'Foo; bar, baz\\qux\nline' }
    const ics = buildSubscriptionIcs(sub, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('SUMMARY:Foo\\; bar\\, baz\\\\qux\\nline')
  })

  it('uses CRLF line endings (RFC 5545)', () => {
    const ics = buildSubscriptionIcs(netflixMonthly, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('\r\n')
    expect(ics.split('\r\n').length).toBeGreaterThan(5)
  })
})

describe('buildBulkIcs', () => {
  it('wraps multiple VEVENTs in a single VCALENDAR', () => {
    const ics = buildBulkIcs([netflixMonthly, domainYearly], { currency: 'EUR', now: FIXED_NOW })
    const beginCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length
    const endCount = (ics.match(/END:VEVENT/g) ?? []).length
    expect(beginCount).toBe(2)
    expect(endCount).toBe(2)
    expect((ics.match(/BEGIN:VCALENDAR/g) ?? []).length).toBe(1)
  })

  it('produces the same output for an empty list as an empty calendar', () => {
    const ics = buildBulkIcs([], { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })
})

describe('buildCancelIcs', () => {
  it('emits METHOD:CANCEL and STATUS:CANCELLED for each UID', () => {
    const uids = [
      uidForSubscription(netflixMonthly),
      uidForSubscription(domainYearly),
    ]
    const ics = buildCancelIcs(uids, { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('METHOD:CANCEL')
    expect((ics.match(/STATUS:CANCELLED/g) ?? []).length).toBe(2)
    for (const uid of uids)
      expect(ics).toContain(`UID:${uid}`)
  })

  it('includes SEQUENCE so calendars accept the cancellation', () => {
    const ics = buildCancelIcs([uidForSubscription(netflixMonthly)], { currency: 'EUR', now: FIXED_NOW })
    expect(ics).toContain('SEQUENCE:1')
  })
})
