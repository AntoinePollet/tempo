<script setup lang="ts">
import type { CatalogEntry } from '~/data/catalog'
import type { CategoryId } from '~/data/categories'
import Fuse from 'fuse.js'
import { CATALOG } from '~/data/catalog'
import { CATEGORIES, getCategory } from '~/data/categories'

const emit = defineEmits<{
  pick: [entry: CatalogEntry]
  custom: []
}>()

const { t } = useI18n()
const query = ref('')
const categoryFilter = ref<CategoryId | 'all'>('all')

const fuse = new Fuse([...CATALOG], {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'aliases', weight: 0.3 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
})

const sorted = [...CATALOG].sort((a, b) => a.name.localeCompare(b.name))

const filtered = computed<CatalogEntry[]>(() => {
  const q = query.value.trim()
  const base = q ? fuse.search(q).map(r => r.item) : sorted
  if (categoryFilter.value === 'all')
    return base
  return base.filter(e => e.defaultCategoryId === categoryFilter.value)
})

const populatedCategories = computed(() => {
  const ids = new Set(CATALOG.map(c => c.defaultCategoryId))
  return CATEGORIES.filter(c => ids.has(c.id))
})
</script>

<template>
  <div>
    <label class="input input-bordered flex items-center gap-2 shrink-0">
      <span class="icon-[carbon--search] size-4 opacity-60" />
      <input
        v-model="query"
        type="text"
        class="grow"
        :placeholder="t('picker.search_placeholder')"
        autofocus
      >
    </label>

    <div class="flex gap-1.5 overflow-x-auto shrink-0 py-1 -mx-2 px-2 scrollbar-thin">
      <button
        type="button"
        class="btn btn-xs shrink-0 whitespace-nowrap"
        :class="categoryFilter === 'all' ? 'btn-primary' : 'btn-ghost border border-base-300'"
        @click="categoryFilter = 'all'"
      >
        {{ t('picker.all_categories') }}
      </button>
      <button
        v-for="c in populatedCategories"
        :key="c.id"
        type="button"
        class="btn btn-xs shrink-0 whitespace-nowrap"
        :class="categoryFilter === c.id ? 'btn-primary' : 'btn-ghost border border-base-300'"
        @click="categoryFilter = c.id"
      >
        {{ c.name }}
      </button>
    </div>

    <ul class="overflow-y-auto flex-1 min-h-0 -mx-2 px-2">
      <li
        v-for="entry in filtered"
        :key="entry.id"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-base-200"
          @click="emit('pick', entry)"
        >
          <CatalogIcon :entry="entry" :name="entry.name" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">
              {{ entry.name }}
            </p>
            <p class="truncate text-xs opacity-70">
              {{ getCategory(entry.defaultCategoryId)?.name }}
            </p>
          </div>
        </button>
      </li>
      <li v-if="filtered.length === 0" class="px-2 py-4 text-center text-sm opacity-60">
        {{ t('picker.no_results') }}
      </li>
    </ul>

    <button
      type="button"
      class="btn btn-ghost border border-dashed border-base-300 shrink-0"
      @click="emit('custom')"
    >
      <span class="icon-[carbon--add] size-4" />
      {{ t('picker.add_custom') }}
    </button>
  </div>
</template>
