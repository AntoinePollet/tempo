import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const KEY_USER_ID = 'tempo:user_id'
const KEY_DEVICE_ID = 'tempo:device_id'
const KEY_USER_SECRET = 'tempo:user_secret'

export interface TempoIdentity {
  userId: string
  deviceId: string
  userSecret: string | null
}

let cached: TempoIdentity | null = null

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    return crypto.randomUUID()
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-fallback`
}

/**
 * Loads or bootstraps the device identity (user_id + device_id generated once,
 * persisted forever via Capacitor Preferences). user_secret is null until
 * /register has returned one.
 */
export async function getIdentity(): Promise<TempoIdentity> {
  if (cached)
    return cached

  const [u, d, s] = await Promise.all([
    Preferences.get({ key: KEY_USER_ID }),
    Preferences.get({ key: KEY_DEVICE_ID }),
    Preferences.get({ key: KEY_USER_SECRET }),
  ])

  let userId = u.value
  let deviceId = d.value

  if (!userId) {
    userId = uuid()
    await Preferences.set({ key: KEY_USER_ID, value: userId })
  }
  if (!deviceId) {
    deviceId = uuid()
    await Preferences.set({ key: KEY_DEVICE_ID, value: deviceId })
  }

  cached = { userId, deviceId, userSecret: s.value }
  return cached
}

export async function setUserSecret(secret: string): Promise<void> {
  await Preferences.set({ key: KEY_USER_SECRET, value: secret })
  if (cached)
    cached.userSecret = secret
}

/**
 * Wipes all identity Preferences. Use as last resort when the server says
 * "unauthorized" and the user wants to start fresh.
 */
export async function resetIdentity(): Promise<void> {
  await Promise.all([
    Preferences.remove({ key: KEY_USER_ID }),
    Preferences.remove({ key: KEY_DEVICE_ID }),
    Preferences.remove({ key: KEY_USER_SECRET }),
  ])
  cached = null
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

export function currentPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
}
