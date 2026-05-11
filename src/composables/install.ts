interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
  prompt: () => Promise<void>
}

const installEvent = ref<BeforeInstallPromptEvent | null>(null)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    installEvent.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    installEvent.value = null
  })
}

export function useInstallPrompt() {
  const isInstallable = computed(() => installEvent.value !== null)

  async function promptInstall() {
    const event = installEvent.value
    if (!event)
      return
    await event.prompt()
    await event.userChoice
    installEvent.value = null
  }

  return { isInstallable, promptInstall }
}
