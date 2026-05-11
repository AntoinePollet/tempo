import type { UserModule } from '~/types'

export const needsRefresh = ref(false)
export const offlineReady = ref(false)

let updateSW: ((reload?: boolean) => Promise<void>) | undefined

export const install: UserModule = ({ isClient, router }) => {
  if (!isClient)
    return

  router.isReady()
    .then(async () => {
      const { registerSW } = await import('virtual:pwa-register')
      updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          needsRefresh.value = true
        },
        onOfflineReady() {
          offlineReady.value = true
        },
      })
    })
    .catch(() => {})
}

export function usePwaUpdate() {
  async function reload() {
    if (updateSW)
      await updateSW(true)
    needsRefresh.value = false
  }

  function dismissUpdate() {
    needsRefresh.value = false
  }

  function dismissOfflineReady() {
    offlineReady.value = false
  }

  return { needsRefresh, offlineReady, reload, dismissUpdate, dismissOfflineReady }
}
