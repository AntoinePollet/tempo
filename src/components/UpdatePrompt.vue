<script setup lang="ts">
import { usePwaUpdate } from '~/modules/pwa'

const { needsRefresh, offlineReady, reload, dismissUpdate, dismissOfflineReady } = usePwaUpdate()
const { t } = useI18n()

let offlineTimer: ReturnType<typeof setTimeout> | undefined

watch(offlineReady, (ready) => {
  if (offlineTimer)
    clearTimeout(offlineTimer)
  if (ready)
    offlineTimer = setTimeout(dismissOfflineReady, 4000)
})
</script>

<template>
  <div class="toast toast-top toast-end z-30 max-w-sm">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="needsRefresh" class="alert alert-info shadow-lg">
        <span class="icon-[carbon--renew] size-5 shrink-0" />
        <div class="flex-1">
          <p class="font-medium">
            {{ t('pwa.update_available') }}
          </p>
          <p class="text-xs opacity-80">
            {{ t('pwa.update_hint') }}
          </p>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" @click="dismissUpdate">
            {{ t('pwa.later') }}
          </button>
          <button class="btn btn-primary btn-sm" @click="reload">
            {{ t('pwa.reload') }}
          </button>
        </div>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="offlineReady" class="alert alert-success shadow-lg">
        <span class="icon-[carbon--cloud-offline] size-5 shrink-0" />
        <span class="flex-1 text-sm">{{ t('pwa.offline_ready') }}</span>
        <button class="btn btn-ghost btn-sm btn-square" :title="t('action.cancel')" @click="dismissOfflineReady">
          <span class="icon-[carbon--close] size-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>
