<script setup lang="ts">
import type { BannerThreshold, ExportEnvelope } from '~/lib/schemas'
import { useInstallPrompt } from '~/composables/install'
import { COMMON_CURRENCIES } from '~/data/currencies'
import { APP_VERSION, backupFilename, buildExportEnvelope } from '~/lib/backup'
import { downloadText } from '~/lib/download'
import { buildBulkIcs, buildCancelIcs, uidForSubscription } from '~/lib/ics'
import { migrate } from '~/lib/migrations'
import { loadLanguageAsync } from '~/modules/i18n'
import { useSettingsStore } from '~/stores/settings'
import { useSubscriptionsStore } from '~/stores/subscriptions'

defineOptions({ name: 'SettingsPage' })

const { t, locale } = useI18n()
const settings = useSettingsStore()
const subs = useSubscriptionsStore()

useHead({
  title: () => `${t('settings.title')} – ${t('app.name')}`,
})

const currencyDialog = ref<HTMLDialogElement>()
const removeCalendarDialog = ref<HTMLDialogElement>()
const restoreDialog = ref<HTMLDialogElement>()
const fileInput = ref<HTMLInputElement>()
const pendingCurrency = ref<string | null>(null)
const pendingEnvelope = ref<ExportEnvelope | null>(null)
const importError = ref('')

function onCurrencyChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === settings.preferredCurrency)
    return
  pendingCurrency.value = value
  currencyDialog.value?.showModal()
}

function confirmCurrencyChange() {
  if (pendingCurrency.value)
    settings.setPreferredCurrency(pendingCurrency.value)
  pendingCurrency.value = null
  currencyDialog.value?.close()
}

function cancelCurrencyChange() {
  pendingCurrency.value = null
  currencyDialog.value?.close()
}

const bannerOptions: BannerThreshold[] = [3, 7, 14]
const { isInstallable, promptInstall } = useInstallPrompt()

async function setLanguage(lang: 'en' | 'fr') {
  settings.setLanguage(lang)
  await loadLanguageAsync(lang)
  locale.value = lang
}

const exportableSubs = computed(() => subs.items.filter(s => s.status !== 'cancelled'))
const hasExportable = computed(() => exportableSubs.value.length > 0)

const removableUids = computed(() => {
  const set = new Set<string>(settings.calendarUidsExported)
  for (const s of subs.items) set.add(uidForSubscription(s))
  return [...set]
})
const hasRemovable = computed(() => removableUids.value.length > 0)

function exportAllToCalendar() {
  if (!hasExportable.value)
    return
  const ics = buildBulkIcs(exportableSubs.value, { currency: settings.preferredCurrency })
  downloadText('recur-subscriptions.ics', ics)
  settings.recordExportedUids(exportableSubs.value.map(uidForSubscription))
}

function openRemoveDialog() {
  if (!hasRemovable.value)
    return
  removeCalendarDialog.value?.showModal()
}

function executeRemoveAll() {
  const uids = removableUids.value
  if (uids.length === 0) {
    removeCalendarDialog.value?.close()
    return
  }
  const ics = buildCancelIcs(uids, { currency: settings.preferredCurrency })
  downloadText('recur-remove-from-calendar.ics', ics)
  settings.clearExportedUids()
  removeCalendarDialog.value?.close()
}

function cancelRemove() {
  removeCalendarDialog.value?.close()
}

function exportBackup() {
  const envelope = buildExportEnvelope(subs.items, settings.snapshot())
  downloadText(
    backupFilename('recur-backup'),
    JSON.stringify(envelope, null, 2),
    'application/json',
  )
}

function triggerImport() {
  importError.value = ''
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }
  try {
    const text = await file.text()
    const raw = JSON.parse(text)
    const envelope = migrate(raw)
    pendingEnvelope.value = envelope
    restoreDialog.value?.showModal()
  }
  catch (err) {
    importError.value = err instanceof Error ? err.message : String(err)
    pendingEnvelope.value = null
  }
  finally {
    target.value = ''
  }
}

function cancelRestore() {
  pendingEnvelope.value = null
  restoreDialog.value?.close()
}

function confirmRestore() {
  const env = pendingEnvelope.value
  if (!env) {
    restoreDialog.value?.close()
    return
  }
  const safety = buildExportEnvelope(subs.items, settings.snapshot())
  downloadText(
    backupFilename('recur-safety'),
    JSON.stringify(safety, null, 2),
    'application/json',
  )
  subs.replaceAll(env.data.subscriptions)
  settings.applySnapshot(env.data.settings)
  pendingEnvelope.value = null
  restoreDialog.value?.close()
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">
      {{ t('settings.title') }}
    </h1>

    <section class="card bg-base-100 border border-base-300">
      <div class="card-body gap-4">
        <h2 class="card-title text-base">
          {{ t('settings.appearance') }}
        </h2>

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium">{{ t('action.toggle_dark') }}</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            :checked="isDark"
            @change="toggleDark()"
          >
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="lang" class="text-sm font-medium">{{ t('settings.language') }}</label>
          <select
            id="lang"
            class="select select-bordered w-full"
            :value="settings.language"
            @change="setLanguage(($event.target as HTMLSelectElement).value as 'en' | 'fr')"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div v-if="isInstallable" class="space-y-1">
          <button
            class="btn btn-primary gap-2 w-full justify-start"
            @click="promptInstall"
          >
            <span class="icon-[carbon--download] size-5" />
            <span class="flex-1 text-left">{{ t('install.prompt') }}</span>
          </button>
          <p class="text-xs opacity-70">
            {{ t('install.hint') }}
          </p>
        </div>
      </div>
    </section>

    <section class="card bg-base-100 border border-base-300">
      <div class="card-body gap-4">
        <h2 class="card-title text-base">
          {{ t('settings.preferred_currency') }}
        </h2>

        <div class="flex flex-col gap-1.5">
          <select
            class="select select-bordered w-full"
            :value="settings.preferredCurrency"
            @change="onCurrencyChange"
          >
            <option v-for="cur in COMMON_CURRENCIES" :key="cur" :value="cur">
              {{ cur }}
            </option>
          </select>
          <p class="text-xs opacity-70">
            {{ t('settings.preferred_currency_hint') }}
          </p>
        </div>
      </div>
    </section>

    <section class="card bg-base-100 border border-base-300">
      <div class="card-body gap-4">
        <h2 class="card-title text-base">
          {{ t('settings.banner_threshold') }}
        </h2>

        <div class="join w-full">
          <button
            v-for="opt in bannerOptions"
            :key="opt"
            class="btn join-item flex-1"
            :class="settings.bannerThreshold === opt ? 'btn-primary' : 'btn-ghost'"
            @click="settings.setBannerThreshold(opt)"
          >
            {{ t('settings.banner_threshold_days', { n: opt }) }}
          </button>
        </div>

        <p class="text-xs opacity-70">
          {{ t('settings.banner_threshold_hint') }}
        </p>

        <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium">{{ t('settings.show_cancelled') }}</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            :checked="settings.showCancelled"
            @change="settings.showCancelled = !settings.showCancelled"
          >
        </div>
      </div>
    </section>

    <section class="card bg-base-100 border border-base-300">
      <div class="card-body gap-3">
        <h2 class="card-title text-base">
          {{ t('settings.calendar_section') }}
        </h2>

        <div class="space-y-1">
          <button
            class="btn btn-ghost gap-2 justify-start w-full border border-base-300"
            :disabled="!hasExportable"
            @click="exportAllToCalendar"
          >
            <span class="icon-[carbon--calendar-add] size-5" />
            <span class="flex-1 text-left">{{ t('calendar.export_all') }}</span>
          </button>
          <p class="text-xs opacity-70">
            {{ t('calendar.export_all_hint') }}
          </p>
        </div>

        <div class="space-y-1">
          <button
            class="btn btn-ghost gap-2 justify-start w-full border border-base-300"
            :disabled="!hasRemovable"
            @click="openRemoveDialog"
          >
            <span class="icon-[carbon--calendar] size-5" />
            <span class="flex-1 text-left">{{ t('calendar.remove_all') }}</span>
          </button>
          <p class="text-xs opacity-70">
            {{ t('calendar.remove_all_hint') }}
          </p>
        </div>
      </div>
    </section>

    <section class="card bg-base-100 border border-base-300">
      <div class="card-body gap-3">
        <h2 class="card-title text-base">
          {{ t('settings.data_section') }}
        </h2>

        <div class="space-y-1">
          <button
            class="btn btn-ghost gap-2 justify-start w-full border border-base-300"
            @click="exportBackup"
          >
            <span class="icon-[carbon--download] size-5" />
            <span class="flex-1 text-left">{{ t('backup.export') }}</span>
          </button>
          <p class="text-xs opacity-70">
            {{ t('backup.export_hint') }}
          </p>
        </div>

        <div class="space-y-1">
          <button
            class="btn btn-ghost gap-2 justify-start w-full border border-base-300"
            @click="triggerImport"
          >
            <span class="icon-[carbon--upload] size-5" />
            <span class="flex-1 text-left">{{ t('backup.import') }}</span>
          </button>
          <p class="text-xs opacity-70">
            {{ t('backup.import_hint') }}
          </p>
          <p v-if="importError" class="text-xs text-error">
            {{ t('backup.import_error') }}: {{ importError }}
          </p>
          <input
            ref="fileInput"
            type="file"
            accept="application/json,.json"
            class="hidden"
            @change="onFileSelected"
          >
        </div>
      </div>
    </section>

    <section class="card bg-base-100 border border-base-300">
      <div class="card-body">
        <p class="text-xs opacity-60">
          {{ t('settings.app_version', { version: APP_VERSION }) }}
        </p>
      </div>
    </section>

    <dialog ref="currencyDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-semibold">
          {{ t('settings.currency_change_title') }}
        </h3>
        <p class="py-4 text-sm">
          {{ t('settings.currency_change_body') }}
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="cancelCurrencyChange">
            {{ t('action.cancel') }}
          </button>
          <button class="btn btn-primary" @click="confirmCurrencyChange">
            {{ t('action.confirm') }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="cancelCurrencyChange">close</button>
      </form>
    </dialog>

    <dialog ref="restoreDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-semibold">
          {{ t('backup.confirm_title') }}
        </h3>
        <p class="py-4 text-sm">
          {{ t('backup.confirm_body') }}
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="cancelRestore">
            {{ t('action.cancel') }}
          </button>
          <button class="btn btn-primary" @click="confirmRestore">
            {{ t('action.confirm') }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="cancelRestore">close</button>
      </form>
    </dialog>

    <dialog ref="removeCalendarDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-semibold">
          {{ t('calendar.confirm_remove_title') }}
        </h3>
        <p class="py-4 text-sm">
          {{ t('calendar.confirm_remove_body') }}
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="cancelRemove">
            {{ t('action.cancel') }}
          </button>
          <button class="btn btn-primary" @click="executeRemoveAll">
            {{ t('action.confirm') }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="cancelRemove">close</button>
      </form>
    </dialog>
  </div>
</template>
