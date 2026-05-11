<script setup lang="ts">
import type { Cadence, CadenceUnit } from '~/lib/schemas'

const props = defineProps<{
  modelValue: Cadence
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Cadence]
}>()

type Preset = 'monthly' | 'yearly' | 'weekly' | 'quarterly' | 'custom'

const PRESETS: Record<Exclude<Preset, 'custom'>, Cadence> = {
  monthly: { interval: 1, unit: 'month' },
  yearly: { interval: 1, unit: 'year' },
  weekly: { interval: 1, unit: 'week' },
  quarterly: { interval: 3, unit: 'month' },
}

const PRESET_ORDER: Preset[] = ['monthly', 'yearly', 'weekly', 'quarterly', 'custom']

function detectPreset(c: Cadence): Preset {
  for (const [key, val] of Object.entries(PRESETS)) {
    if (val.interval === c.interval && val.unit === c.unit)
      return key as Preset
  }
  return 'custom'
}

const activePreset = computed(() => detectPreset(props.modelValue))
const showCustom = computed(() => activePreset.value === 'custom')

function selectPreset(p: Preset) {
  if (p === 'custom') {
    if (activePreset.value !== 'custom')
      emit('update:modelValue', { interval: 2, unit: 'week' })
    return
  }
  emit('update:modelValue', PRESETS[p])
}

function updateInterval(value: number) {
  emit('update:modelValue', { ...props.modelValue, interval: Math.max(1, Math.floor(value || 1)) })
}

function updateUnit(value: CadenceUnit) {
  emit('update:modelValue', { ...props.modelValue, unit: value })
}

const { t } = useI18n()
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="p in PRESET_ORDER"
        :key="p"
        type="button"
        class="btn btn-sm"
        :class="activePreset === p ? 'btn-primary' : 'btn-ghost border border-base-300'"
        @click="selectPreset(p)"
      >
        {{ t(`cadence.${p}`) }}
      </button>
    </div>

    <div v-if="showCustom" class="flex items-center gap-2">
      <span class="text-sm opacity-70">{{ t('form.every') }}</span>
      <input
        type="number"
        min="1"
        max="365"
        class="input input-bordered input-sm w-20"
        :value="modelValue.interval"
        @input="updateInterval(Number(($event.target as HTMLInputElement).value))"
      >
      <select
        class="select select-bordered select-sm flex-1"
        :value="modelValue.unit"
        @change="updateUnit(($event.target as HTMLSelectElement).value as CadenceUnit)"
      >
        <option value="day">{{ t('form.unit.day') }}</option>
        <option value="week">{{ t('form.unit.week') }}</option>
        <option value="month">{{ t('form.unit.month') }}</option>
        <option value="year">{{ t('form.unit.year') }}</option>
      </select>
    </div>
  </div>
</template>
