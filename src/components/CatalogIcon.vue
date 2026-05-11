<script setup lang="ts">
import type { CatalogEntry } from '~/data/catalog'
import { letterAvatar } from '~/lib/avatar'

const props = defineProps<{
  entry?: CatalogEntry | null
  name: string
}>()

const fallback = computed(() => letterAvatar(props.name))
</script>

<template>
  <div class="flex size-10 shrink-0 items-center justify-center rounded-full">
    <span
      v-if="entry?.iconClass"
      :class="[entry.iconClass, 'size-7']"
      :style="{ color: entry.tintColor }"
      :aria-label="entry.name"
    />
    <div
      v-else
      class="flex size-10 items-center justify-center rounded-full font-semibold text-white"
      :style="{ background: fallback.color }"
      :aria-hidden="true"
    >
      {{ fallback.letter }}
    </div>
  </div>
</template>
