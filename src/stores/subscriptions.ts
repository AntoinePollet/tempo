import type { Subscription, SubscriptionInput } from '~/lib/schemas'
import { acceptHMRUpdate, defineStore } from 'pinia'

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    return crypto.randomUUID()
  return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const items = ref<Subscription[]>([])

  const active = computed(() => items.value.filter(s => s.status === 'active'))
  const visible = computed(() => items.value.filter(s => s.status !== 'cancelled'))

  function add(input: SubscriptionInput): Subscription {
    const now = new Date().toISOString()
    const sub: Subscription = {
      ...input,
      id: makeId(),
      createdAt: now,
      updatedAt: now,
    }
    items.value.push(sub)
    return sub
  }

  function update(id: string, patch: Partial<SubscriptionInput>): Subscription | undefined {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx === -1)
      return undefined
    const updated = {
      ...items.value[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    items.value[idx] = updated
    return updated
  }

  function remove(id: string): boolean {
    const idx = items.value.findIndex(s => s.id === id)
    if (idx === -1)
      return false
    items.value.splice(idx, 1)
    return true
  }

  function getById(id: string): Subscription | undefined {
    return items.value.find(s => s.id === id)
  }

  function replaceAll(next: Subscription[]) {
    items.value = next
  }

  return { items, active, visible, add, update, remove, getById, replaceAll }
}, {
  persist: {
    key: 'tempo:subscriptions',
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSubscriptionsStore as any, import.meta.hot))
