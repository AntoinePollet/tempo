import type { ExportEnvelope } from './schemas'
import { CURRENT_SCHEMA_VERSION, exportEnvelopeSchema } from './schemas'

type AnyEnvelope = { schema: number, [k: string]: unknown }

const migrations: Record<number, (e: AnyEnvelope) => AnyEnvelope> = {
  // future: 1: (v1) => ({ ...v1, schema: 2, data: { ...v1.data, newField: defaultValue } })
}

export function migrate(raw: unknown): ExportEnvelope {
  if (!raw || typeof raw !== 'object' || !('schema' in raw))
    throw new Error('Invalid backup file: missing schema version')

  let envelope = raw as AnyEnvelope
  while (envelope.schema < CURRENT_SCHEMA_VERSION) {
    const step = migrations[envelope.schema]
    if (!step)
      throw new Error(`No migration defined for schema ${envelope.schema}`)
    envelope = step(envelope)
  }

  if (envelope.schema > CURRENT_SCHEMA_VERSION)
    throw new Error(`Backup is newer (schema ${envelope.schema}) than this app (schema ${CURRENT_SCHEMA_VERSION})`)

  return exportEnvelopeSchema.parse(envelope)
}
