<script setup lang="ts">
import type { Subscription } from '~/lib/schemas'
import { useFormatCurrency } from '~/composables/format'
import { findInCatalog } from '~/data/catalog'
import { topMostExpensive } from '~/lib/rollup'

const props = defineProps<{
  subs: Subscription[]
  limit?: number
}>()

const { format } = useFormatCurrency()
const { t } = useI18n()

const items = computed(() => topMostExpensive(props.subs, props.limit ?? 5))
const max = computed(() => items.value[0]?.monthly ?? 0)

function widthPct(monthly: number): number {
  return max.value > 0 ? Math.max(4, Math.round((monthly / max.value) * 100)) : 0
}

function catalogFor(id: string | undefined) {
  return id ? findInCatalog(id) : undefined
}
</script>

<template>
  <div v-if="items.length === 0" class="text-center text-sm opacity-60 py-6">
    {{ t('stats.empty') }}
  </div>
  <ul v-else class="space-y-3">
    <li v-for="item in items" :key="item.sub.id" class="space-y-1">
      <div class="flex items-center gap-3">
        <CatalogIcon :entry="catalogFor(item.sub.catalogId)" :name="item.sub.name" />
        <span class="flex-1 truncate text-sm font-medium">{{ item.sub.name }}</span>
        <span class="text-sm tabular-nums">{{ format(item.monthly) }}{{ t('home.per_month_short') }}</span>
      </div>
      <div class="ml-13 h-1.5 rounded-full bg-base-300 overflow-hidden">
        <div
          class="h-full rounded-full bg-primary transition-all"
          :style="{ width: `${widthPct(item.monthly)}%` }"
        />
      </div>
    </li>
  </ul>
</template>
