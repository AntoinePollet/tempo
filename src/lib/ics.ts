import type { Subscription } from './schemas'
import { cadenceToRrule } from './cadence'

const APP_DOMAIN = 'recur.app'
const PRODID = '-//Recur//Recurring Spending Tracker//EN'

function toIcsDate(isoYmd: string): string {
  return isoYmd.replaceAll('-', '')
}

function toIcsDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    'Z',
  ].join('')
}

function escapeIcsText(text: string): string {
  return text
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll('\n', '\\n')
}

function uidFor(sub: Subscription): string {
  return `${sub.id}@${APP_DOMAIN}`
}

export interface IcsBuildOptions {
  currency: string
  now?: Date
}

function buildVevent(sub: Subscription, opts: IcsBuildOptions): string {
  const dtstamp = toIcsDateTime(opts.now ?? new Date())
  const summary = escapeIcsText(sub.name)
  const description = escapeIcsText(`Recurring charge: ${sub.amount.toFixed(2)} ${opts.currency}`)
  return [
    'BEGIN:VEVENT',
    `UID:${uidFor(sub)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(sub.startDate)}`,
    `RRULE:${cadenceToRrule(sub.cadence)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'TRIGGER:-PT24H',
    'END:VALARM',
    'END:VEVENT',
  ].join('\r\n')
}

function buildCancelVevent(uid: string, opts: IcsBuildOptions): string {
  const dtstamp = toIcsDateTime(opts.now ?? new Date())
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    'STATUS:CANCELLED',
    'SEQUENCE:1',
    'END:VEVENT',
  ].join('\r\n')
}

function wrapCalendar(method: 'PUBLISH' | 'CANCEL', body: string): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    `METHOD:${method}`,
    'CALSCALE:GREGORIAN',
    body,
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export function buildSubscriptionIcs(sub: Subscription, opts: IcsBuildOptions): string {
  return wrapCalendar('PUBLISH', buildVevent(sub, opts))
}

export function buildBulkIcs(subs: Subscription[], opts: IcsBuildOptions): string {
  const body = subs.map(s => buildVevent(s, opts)).join('\r\n')
  return wrapCalendar('PUBLISH', body)
}

export function buildCancelIcs(uids: string[], opts: IcsBuildOptions): string {
  const body = uids.map(uid => buildCancelVevent(uid, opts)).join('\r\n')
  return wrapCalendar('CANCEL', body)
}

export function uidForSubscription(sub: Subscription): string {
  return uidFor(sub)
}
