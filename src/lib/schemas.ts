import { z } from 'zod'

export const cadenceUnitSchema = z.enum(['day', 'week', 'month', 'year'])

export const cadenceSchema = z.object({
  interval: z.number().int().min(1).max(365),
  unit: cadenceUnitSchema,
})

export const subscriptionStatusSchema = z.enum(['active', 'paused', 'cancelled'])

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
  amount: z.number().positive().max(99_999.99),
  cadence: cadenceSchema,
  startDate: isoDateSchema,
  categoryId: z.string(),
  catalogId: z.string().optional(),
  notes: z.string().max(500).optional(),
  status: subscriptionStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const subscriptionInputSchema = subscriptionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const bannerThresholdSchema = z.union([z.literal(3), z.literal(7), z.literal(14)])

export const userSettingsSchema = z.object({
  preferredCurrency: z.string().length(3),
  language: z.enum(['en', 'fr']),
  banner: z.object({
    thresholdDays: bannerThresholdSchema,
    dismissedUntil: z.string().nullable(),
  }),
  calendarUidsExported: z.array(z.string()),
  showCancelled: z.boolean(),
})

export const CURRENT_SCHEMA_VERSION = 1 as const

export const exportEnvelopeSchema = z.object({
  schema: z.literal(CURRENT_SCHEMA_VERSION),
  exportedAt: z.string(),
  appVersion: z.string(),
  data: z.object({
    subscriptions: z.array(subscriptionSchema),
    settings: userSettingsSchema,
  }),
})

export type Cadence = z.infer<typeof cadenceSchema>
export type CadenceUnit = z.infer<typeof cadenceUnitSchema>
export type Subscription = z.infer<typeof subscriptionSchema>
export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>
export type BannerThreshold = z.infer<typeof bannerThresholdSchema>
export type UserSettings = z.infer<typeof userSettingsSchema>
export type ExportEnvelope = z.infer<typeof exportEnvelopeSchema>
