import type { CatalogEntry } from '~/data/catalog'
import type { Subscription } from '~/lib/schemas'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { findInCatalog } from '~/data/catalog'

export type ModalMode = 'add' | 'edit'
export type AddStep = 'pick' | 'form'

export const useSubscriptionModalStore = defineStore('subscriptionModal', () => {
  const isOpen = ref(false)
  const mode = ref<ModalMode>('add')
  const step = ref<AddStep>('pick')
  const selectedCatalog = ref<CatalogEntry | null>(null)
  const editTarget = ref<Subscription | null>(null)

  function openAdd() {
    mode.value = 'add'
    step.value = 'pick'
    selectedCatalog.value = null
    editTarget.value = null
    isOpen.value = true
  }

  function openEdit(sub: Subscription) {
    mode.value = 'edit'
    step.value = 'form'
    selectedCatalog.value = sub.catalogId ? findInCatalog(sub.catalogId) ?? null : null
    editTarget.value = sub
    isOpen.value = true
  }

  function pickCatalog(entry: CatalogEntry) {
    selectedCatalog.value = entry
    step.value = 'form'
  }

  function pickCustom() {
    selectedCatalog.value = null
    step.value = 'form'
  }

  function back() {
    if (mode.value === 'add')
      step.value = 'pick'
  }

  function close() {
    isOpen.value = false
    editTarget.value = null
    selectedCatalog.value = null
  }

  return {
    isOpen,
    mode,
    step,
    selectedCatalog,
    editTarget,
    openAdd,
    openEdit,
    pickCatalog,
    pickCustom,
    back,
    close,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSubscriptionModalStore as any, import.meta.hot))
