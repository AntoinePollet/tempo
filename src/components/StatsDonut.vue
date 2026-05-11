<script setup lang="ts">
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import type { Subscription } from '~/lib/schemas'
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { useFormatCurrency } from '~/composables/format'
import { CATEGORIES } from '~/data/categories'
import { monthlyByCategory } from '~/lib/rollup'

ChartJS.register(ArcElement, Tooltip)

const props = defineProps<{
  subs: Subscription[]
}>()

const { format } = useFormatCurrency()
const { t } = useI18n()

interface Slice {
  id: string
  name: string
  color: string
  value: number
}

const slices = computed<Slice[]>(() => {
  const map = monthlyByCategory(props.subs)
  return CATEGORIES
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      value: map.get(c.id) ?? 0,
    }))
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value)
})

const total = computed(() => slices.value.reduce((sum, s) => sum + s.value, 0))

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: slices.value.map(s => s.name),
  datasets: [{
    data: slices.value.map(s => s.value),
    backgroundColor: slices.value.map(s => s.color),
    borderColor: 'transparent',
    borderWidth: 0,
    hoverOffset: 8,
  }],
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    tooltip: {
      callbacks: {
        label(ctx: TooltipItem<'doughnut'>) {
          const value = ctx.parsed
          const pct = total.value > 0 ? Math.round((value / total.value) * 100) : 0
          return `${ctx.label}: ${format(value)} (${pct}%)`
        },
      },
    },
  },
}))

function pct(value: number): number {
  return total.value > 0 ? Math.round((value / total.value) * 100) : 0
}
</script>

<template>
  <div v-if="slices.length === 0" class="text-center text-sm opacity-60 py-6">
    {{ t('stats.empty') }}
  </div>
  <div v-else class="grid gap-4 sm:grid-cols-2 sm:items-center">
    <div class="relative mx-auto aspect-square w-48">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p class="text-xs uppercase tracking-wide opacity-60">
          {{ t('home.rollup_per_month') }}
        </p>
        <p class="text-xl font-semibold">
          {{ format(total) }}
        </p>
      </div>
    </div>

    <ul class="space-y-1.5 text-sm">
      <li
        v-for="s in slices"
        :key="s.id"
        class="flex items-center gap-2"
      >
        <span class="size-3 rounded-full shrink-0" :style="{ background: s.color }" />
        <span class="flex-1 truncate">{{ s.name }}</span>
        <span class="opacity-60 text-xs">{{ pct(s.value) }}%</span>
        <span class="font-medium tabular-nums">{{ format(s.value) }}</span>
      </li>
    </ul>
  </div>
</template>
