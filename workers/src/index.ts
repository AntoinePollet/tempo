import type { ServiceAccount } from './fcm'
import { FcmSendError, getFcmAccessToken, sendFcmMessage } from './fcm'

export interface Env {
  DB: D1Database
  RL_REGISTER: RateLimit
  RL_API: RateLimit
  FCM_PROJECT_ID: string
  FCM_SERVICE_ACCOUNT: string
}

interface RateLimit {
  limit: (opts: { key: string }) => Promise<{ success: boolean }>
}

// ─── Types & validation ──────────────────────────────────────────────────────

interface RegisterBody {
  user_id: string
  device_id: string
  fcm_token: string
  platform: 'ios' | 'android'
  app_version?: string
  timezone?: string
}

interface SyncDuesBody {
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isUuid(s: unknown): s is string {
  return typeof s === 'string' && UUID_RE.test(s)
}

function isIsoDate(s: unknown): s is string {
  return typeof s === 'string' && DATE_RE.test(s)
}

function validateRegister(body: any): RegisterBody | string {
  if (!body || typeof body !== 'object')
    return 'body must be an object'
  if (!isUuid(body.user_id))
    return 'user_id must be a UUID v4'
  if (!isUuid(body.device_id))
    return 'device_id must be a UUID v4'
  if (typeof body.fcm_token !== 'string' || body.fcm_token.length === 0)
    return 'fcm_token must be a non-empty string'
  if (body.platform !== 'ios' && body.platform !== 'android')
    return 'platform must be "ios" or "android"'
  if (body.app_version !== undefined && typeof body.app_version !== 'string')
    return 'app_version must be a string'
  if (body.timezone !== undefined && typeof body.timezone !== 'string')
    return 'timezone must be a string'
  return body as RegisterBody
}

function validateSyncDues(body: any): SyncDuesBody | string {
  if (!body || typeof body !== 'object')
    return 'body must be an object'
  if (!isUuid(body.user_id))
    return 'user_id must be a UUID v4'
  if (!Array.isArray(body.dues))
    return 'dues must be an array'
  for (const d of body.dues) {
    if (typeof d.id !== 'string' || d.id.length === 0)
      return 'each due requires a non-empty id'
    if (typeof d.subscription_name !== 'string' || d.subscription_name.length === 0)
      return 'each due requires a subscription_name'
    if (!isIsoDate(d.next_due_date))
      return `next_due_date must be YYYY-MM-DD (got ${d.next_due_date})`
    if (d.amount_cents !== undefined && (!Number.isInteger(d.amount_cents) || d.amount_cents < 0))
      return 'amount_cents must be a non-negative integer'
    if (d.notify_days_before !== undefined && (!Number.isInteger(d.notify_days_before) || d.notify_days_before < 0))
      return 'notify_days_before must be a non-negative integer'
  }
  return body as SyncDuesBody
}

// ─── CORS — strict whitelist (Capacitor + dev only) ──────────────────────────

const ALLOWED_ORIGINS = new Set([
  'capacitor://localhost', // Capacitor iOS default origin
  'https://localhost', // Capacitor Android default origin
  'http://localhost:3333', // Vite dev server (Tempo)
  'http://localhost:5173', // Vite default port fallback
])

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin')
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    }
  }
  return { Vary: 'Origin' }
}

function jsonResponse(data: unknown, status: number, req: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
  })
}

// ─── Auth (Bearer token, SHA-256 hashed in D1) ───────────────────────────────

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateUserSecret(): string {
  // 256 bits of crypto random as a 64-char hex string
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '')
}

function getBearer(req: Request): string | null {
  const auth = req.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer '))
    return null
  return auth.slice('Bearer '.length).trim() || null
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length)
    return false
  let result = 0
  for (let i = 0; i < a.length; i++)
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}

async function verifyAuth(req: Request, env: Env, userId: string): Promise<boolean> {
  const token = getBearer(req)
  if (!token)
    return false
  const tokenHash = await sha256Hex(token)
  const row = await env.DB
    .prepare('SELECT secret_hash FROM users WHERE user_id = ?')
    .bind(userId)
    .first<{ secret_hash: string | null }>()
  if (!row || !row.secret_hash)
    return false
  return constantTimeEqual(row.secret_hash, tokenHash)
}

// ─── Endpoint handlers ───────────────────────────────────────────────────────

async function handleRegister(req: Request, env: Env): Promise<Response> {
  const body = await req.json().catch(() => null)
  const v = validateRegister(body)
  if (typeof v === 'string')
    return jsonResponse({ error: v }, 400, req)

  const existingUser = await env.DB
    .prepare('SELECT secret_hash FROM users WHERE user_id = ?')
    .bind(v.user_id)
    .first<{ secret_hash: string | null }>()

  let returnedSecret: string | null = null
  let secretHash: string

  if (existingUser?.secret_hash) {
    // Existing user — Bearer required
    if (!(await verifyAuth(req, env, v.user_id)))
      return jsonResponse({ error: 'unauthorized' }, 401, req)
    secretHash = existingUser.secret_hash
  }
  else {
    // First registration for this user_id — mint the secret
    const secret = generateUserSecret()
    returnedSecret = secret
    secretHash = await sha256Hex(secret)
  }

  const now = Date.now()
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO users (user_id, timezone, secret_hash, created_at, last_seen_at)
      VALUES (?, COALESCE(?, 'Europe/Paris'), ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        last_seen_at = excluded.last_seen_at,
        timezone = COALESCE(excluded.timezone, users.timezone),
        secret_hash = COALESCE(users.secret_hash, excluded.secret_hash)
    `).bind(v.user_id, v.timezone ?? null, secretHash, now, now),

    // Handle the rare case where the same fcm_token migrated to a new device_id
    // (e.g., reinstall + Firebase token reuse). Orphan the old device row.
    env.DB.prepare('DELETE FROM devices WHERE fcm_token = ? AND device_id != ?')
      .bind(v.fcm_token, v.device_id),

    env.DB.prepare(`
      INSERT INTO devices (device_id, user_id, fcm_token, platform, app_version, created_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(device_id) DO UPDATE SET
        fcm_token = excluded.fcm_token,
        platform = excluded.platform,
        app_version = excluded.app_version,
        last_seen_at = excluded.last_seen_at,
        user_id = excluded.user_id
    `).bind(v.device_id, v.user_id, v.fcm_token, v.platform, v.app_version ?? null, now, now),
  ])

  return jsonResponse(
    returnedSecret ? { ok: true, user_secret: returnedSecret } : { ok: true },
    200,
    req,
  )
}

async function handleSyncDues(req: Request, env: Env): Promise<Response> {
  const body = await req.json().catch(() => null)
  const v = validateSyncDues(body)
  if (typeof v === 'string')
    return jsonResponse({ error: v }, 400, req)

  if (!(await verifyAuth(req, env, v.user_id)))
    return jsonResponse({ error: 'unauthorized' }, 401, req)

  const now = Date.now()
  const statements: D1PreparedStatement[] = [
    env.DB.prepare('DELETE FROM due_dates WHERE user_id = ?').bind(v.user_id),
  ]
  for (const d of v.dues) {
    statements.push(env.DB.prepare(`
      INSERT INTO due_dates (id, user_id, subscription_name, amount_cents, currency, next_due_date, notify_days_before, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      d.id,
      v.user_id,
      d.subscription_name,
      d.amount_cents ?? null,
      d.currency ?? null,
      d.next_due_date,
      d.notify_days_before ?? 3,
      now,
    ))
  }
  await env.DB.batch(statements)

  return jsonResponse({ ok: true, synced: v.dues.length }, 200, req)
}

async function handleDeleteDevice(deviceId: string, req: Request, env: Env): Promise<Response> {
  if (!isUuid(deviceId))
    return jsonResponse({ error: 'device_id must be a UUID' }, 400, req)

  const deviceRow = await env.DB
    .prepare('SELECT user_id FROM devices WHERE device_id = ?')
    .bind(deviceId)
    .first<{ user_id: string }>()

  if (!deviceRow)
    return jsonResponse({ ok: true, deleted: 0 }, 200, req)

  if (!(await verifyAuth(req, env, deviceRow.user_id)))
    return jsonResponse({ error: 'unauthorized' }, 401, req)

  const res = await env.DB
    .prepare('DELETE FROM devices WHERE device_id = ?')
    .bind(deviceId)
    .run()

  return jsonResponse({ ok: true, deleted: res.meta?.changes ?? 0 }, 200, req)
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: corsHeaders(req) })

    const url = new URL(req.url)
    const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown'

    try {
      if (req.method === 'GET' && url.pathname === '/health')
        return jsonResponse({ status: 'ok', timestamp: Date.now() }, 200, req)

      if (req.method === 'POST' && url.pathname === '/register') {
        const { success } = await env.RL_REGISTER.limit({ key: ip })
        if (!success)
          return jsonResponse({ error: 'rate_limited' }, 429, req)
        return await handleRegister(req, env)
      }

      if (req.method === 'POST' && url.pathname === '/sync-dues') {
        const { success } = await env.RL_API.limit({ key: ip })
        if (!success)
          return jsonResponse({ error: 'rate_limited' }, 429, req)
        return await handleSyncDues(req, env)
      }

      const deviceMatch = url.pathname.match(/^\/device\/([^/]+)$/)
      if (req.method === 'DELETE' && deviceMatch) {
        const { success } = await env.RL_API.limit({ key: ip })
        if (!success)
          return jsonResponse({ error: 'rate_limited' }, 429, req)
        return await handleDeleteDevice(deviceMatch[1], req, env)
      }

      return jsonResponse({ error: 'not_found' }, 404, req)
    }
    catch (e) {
      console.error('Worker error:', e)
      return jsonResponse({ error: 'internal_error' }, 500, req)
    }
  },

  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    console.warn(`Cron tick at ${new Date(event.scheduledTime).toISOString()}`)

    let serviceAccount: ServiceAccount
    try {
      serviceAccount = JSON.parse(env.FCM_SERVICE_ACCOUNT) as ServiceAccount
    }
    catch {
      console.error('FCM_SERVICE_ACCOUNT secret missing or not valid JSON.')
      return
    }
    if (!env.FCM_PROJECT_ID) {
      console.error('FCM_PROJECT_ID env var missing.')
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    const due = await env.DB.prepare(`
      SELECT id, user_id, subscription_name, amount_cents, currency,
             next_due_date, notify_days_before
      FROM due_dates
      WHERE date(next_due_date, '-' || notify_days_before || ' days') = date(?)
        AND (last_notified_for IS NULL OR last_notified_for != next_due_date)
    `).bind(today).all<{
      id: string
      user_id: string
      subscription_name: string
      amount_cents: number | null
      currency: string | null
      next_due_date: string
      notify_days_before: number
    }>()

    if (due.results.length === 0) {
      console.warn('No notifications due.')
      return
    }
    console.warn(`Sending ${due.results.length} notifications.`)

    let accessToken: string
    try {
      accessToken = await getFcmAccessToken(serviceAccount)
    }
    catch (e) {
      console.error('Failed to obtain FCM access token:', e)
      return
    }

    for (const d of due.results) {
      const devices = await env.DB
        .prepare('SELECT device_id, fcm_token FROM devices WHERE user_id = ?')
        .bind(d.user_id)
        .all<{ device_id: string, fcm_token: string }>()

      if (devices.results.length === 0)
        continue

      const daysWord = d.notify_days_before === 1
        ? 'demain'
        : `dans ${d.notify_days_before} jours`
      const amount = d.amount_cents !== null && d.currency
        ? ` (${(d.amount_cents / 100).toFixed(2)} ${d.currency})`
        : ''
      const title = 'Prélèvement à venir'
      const body = `${d.subscription_name}${amount} ${daysWord}`

      for (const dev of devices.results) {
        try {
          await sendFcmMessage(accessToken, env.FCM_PROJECT_ID, {
            token: dev.fcm_token,
            title,
            body,
            data: { due_date_id: d.id, subscription_name: d.subscription_name },
          })
        }
        catch (e) {
          if (e instanceof FcmSendError && e.isUnregistered()) {
            await env.DB
              .prepare('DELETE FROM devices WHERE device_id = ?')
              .bind(dev.device_id)
              .run()
            console.warn(`Cleaned up unregistered device ${dev.device_id}`)
          }
          else {
            console.error(`FCM send failed for device ${dev.device_id}:`, e)
          }
        }
      }

      await env.DB
        .prepare('UPDATE due_dates SET last_notified_for = ? WHERE id = ?')
        .bind(d.next_due_date, d.id)
        .run()
    }
  },
} satisfies ExportedHandler<Env>
