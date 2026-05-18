import type { UserModule } from '~/types'

/**
 * Native push backend bootstrap.
 * - On SSR / web: no-op (modules with native deps are dynamic-imported)
 * - On iOS/Android Capacitor: wires Firebase Messaging listeners, auto-
 *   re-registers if the user has already granted permission, and starts
 *   the reactive sync to the Cloudflare Worker.
 */
export const install: UserModule = ({ isClient, router }) => {
  if (!isClient)
    return

  router.isReady().then(async () => {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform())
      return

    const { bootstrapPush } = await import('~/composables/tempoPush')
    const { startSyncDuesAutoPush } = await import('~/composables/tempoSync')
    await bootstrapPush()
    startSyncDuesAutoPush()
  }).catch((e) => {
    console.error('[tempoBackend] init failed', e)
  })
}
