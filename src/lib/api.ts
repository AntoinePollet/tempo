import type { TempoIdentity } from '~/composables/tempoIdentity'

const API_BASE = (import.meta.env.VITE_TEMPO_API_URL as string | undefined)
  ?? 'https://tempo-api.pollet-antoine-alexis.workers.dev'

export interface RegisterPayload {
  user_id: string
  device_id: string
  fcm_token: string
  platform: 'ios' | 'android'
  app_version?: string
  timezone?: string
}

export interface RegisterResponse {
  ok: true
  user_secret?: string
}

export interface SyncDuesPayload {
  user_id: string
  dues: Array<{
    id: string
    subscription_name: string
    amount_cents?: number
    currency?: string
    next_due_date: string
    notify_days_before?: number
  }>
}

export interface SyncDuesResponse {
  ok: true
  synced: number
}

export class ApiError extends Error {
  constructor(public status: number, public body: { error?: string } | null) {
    super(`[${status}] ${body?.error ?? 'request failed'}`)
  }

  get isUnauthorized(): boolean { return this.status === 401 }
  get isRateLimited(): boolean { return this.status === 429 }
}

async function request<T>(path: string, init: RequestInit, identity?: TempoIdentity): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (identity?.userSecret)
    headers.set('Authorization', `Bearer ${identity.userSecret}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null
    throw new ApiError(res.status, body)
  }
  return await res.json() as T
}

export async function postRegister(
  payload: RegisterPayload,
  identity: TempoIdentity,
): Promise<RegisterResponse> {
  return request<RegisterResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, identity)
}

export async function postSyncDues(
  payload: SyncDuesPayload,
  identity: TempoIdentity,
): Promise<SyncDuesResponse> {
  return request<SyncDuesResponse>('/sync-dues', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, identity)
}

export async function deleteDevice(deviceId: string, identity: TempoIdentity): Promise<void> {
  await request<{ ok: true, deleted: number }>(`/device/${deviceId}`, {
    method: 'DELETE',
  }, identity)
}
