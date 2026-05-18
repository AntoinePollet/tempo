import type { TempoIdentity } from './tempoIdentity'
import { ApiError, postRegister } from '~/lib/api'
import { currentPlatform, getIdentity, isNativePlatform, setUserSecret } from './tempoIdentity'

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'unknown'

export interface PushState {
  permission: PermissionState
  registered: boolean
  fcmToken: string | null
  error: string | null
}

export const pushState = ref<PushState>({
  permission: 'unknown',
  registered: false,
  fcmToken: null,
  error: null,
})

// Lazy-load the FCM plugin: keeps it out of the SSG bundle and out of the web
// build path (it's a native-only plugin that would otherwise error on web).
async function loadMessaging() {
  const mod = await import('@capacitor-firebase/messaging')
  return mod.FirebaseMessaging
}

async function registerOnServer(fcmToken: string, identity: TempoIdentity): Promise<void> {
  const platform = currentPlatform()
  if (platform === 'web')
    return

  const res = await postRegister({
    user_id: identity.userId,
    device_id: identity.deviceId,
    fcm_token: fcmToken,
    platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }, identity)

  if (res.user_secret)
    await setUserSecret(res.user_secret)

  pushState.value = {
    ...pushState.value,
    registered: true,
    fcmToken,
    error: null,
  }
}

/**
 * Asks the OS for push permission, retrieves the FCM token, and registers
 * the device with the Tempo Worker. Idempotent — safe to call multiple times.
 */
export async function enableNotifications(): Promise<void> {
  if (!isNativePlatform()) {
    pushState.value.error = 'Push notifications are only available in the native app.'
    return
  }

  pushState.value.error = null
  try {
    const FirebaseMessaging = await loadMessaging()
    const perm = await FirebaseMessaging.requestPermissions()
    pushState.value.permission = perm.receive as PermissionState

    if (perm.receive !== 'granted')
      return

    const { token } = await FirebaseMessaging.getToken()
    const identity = await getIdentity()
    await registerOnServer(token, identity)
  }
  catch (e) {
    if (e instanceof ApiError) {
      pushState.value.error = e.message
      // 401 here would be unusual (we send no Auth on first register), but
      // we surface it explicitly so the UI can offer "reset and try again".
    }
    else {
      pushState.value.error = e instanceof Error ? e.message : String(e)
    }
    console.error('[tempoPush] enableNotifications failed', e)
  }
}

/**
 * Boot-time setup: wires token-refresh + tap listeners, and auto-registers if
 * the user has previously granted push permission. Called from the module.
 */
export async function bootstrapPush(): Promise<void> {
  if (!isNativePlatform())
    return

  try {
    const FirebaseMessaging = await loadMessaging()
    const perm = await FirebaseMessaging.checkPermissions()
    pushState.value.permission = perm.receive as PermissionState

    await FirebaseMessaging.addListener('tokenReceived', async (event) => {
      try {
        const identity = await getIdentity()
        await registerOnServer(event.token, identity)
      }
      catch (e) {
        console.error('[tempoPush] tokenReceived re-register failed', e)
      }
    })

    await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      // Deep-link from a push tap. The payload carries due_date_id +
      // subscription_name (set by the Worker cron handler).
      const data = event.notification?.data
      console.warn('[tempoPush] notification tap', data)
      // TODO: integrate with router.push() when a per-subscription page exists
    })

    if (perm.receive === 'granted') {
      const { token } = await FirebaseMessaging.getToken()
      const identity = await getIdentity()
      await registerOnServer(token, identity)
    }
  }
  catch (e) {
    console.error('[tempoPush] bootstrapPush failed', e)
  }
}
