import type { ExportEnvelope, Subscription, UserSettings } from './schemas'
import { CURRENT_SCHEMA_VERSION } from './schemas'

export const APP_VERSION = '0.1.0'

export function buildExportEnvelope(
  subscriptions: Subscription[],
  settings: UserSettings,
  now: Date = new Date(),
): ExportEnvelope {
  return {
    schema: CURRENT_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    appVersion: APP_VERSION,
    data: {
      subscriptions,
      settings,
    },
  }
}

export function backupFilename(prefix: string, now: Date = new Date()): string {
  const ymd = now.toISOString().slice(0, 10)
  const hms = now.toTimeString().slice(0, 8).replaceAll(':', '')
  return `${prefix}-${ymd}-${hms}.json`
}
