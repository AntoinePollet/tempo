<script setup lang="ts">
import type { DueSoonItem } from '~/composables/dueSoon'
import { useDueSoon } from '~/composables/dueSoon'
import { findInCatalog } from '~/data/catalog'

const { t } = useI18n()
const { items, isDismissed, dismissUntilTomorrow } = useDueSoon()

const expanded = ref(false)

const visible = computed(() => items.value.length > 0 && !isDismissed.value)

function whenLabel(item: DueSoonItem): string {
  if (item.daysUntil === 0)
    return t('home.due_today')
  if (item.daysUntil === 1)
    return t('home.due_tomorrow')
  return t('home.due_in_days', { n: item.daysUntil }, item.daysUntil)
}

function catalogFor(catalogId: string | undefined) {
  return catalogId ? findInCatalog(catalogId) : undefined
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <section
      v-if="visible"
      class="rounded-2xl border border-warning/30 bg-warning/10"
    >
      <div class="flex items-center gap-2 px-4 py-3">
        <span class="icon-[carbon--calendar-heat-map] size-5 shrink-0 text-warning" />
        <button
          type="button"
          class="flex-1 text-left text-sm font-medium"
          @click="expanded = !expanded"
        >
          {{ t('home.due_soon_count', { count: items.length }, items.length) }}
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :title="expanded ? t('home.hide_details') : t('home.show_details')"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          <span
            :class="expanded ? 'icon-[carbon--chevron-up]' : 'icon-[carbon--chevron-down]'"
            class="size-4"
          />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :title="t('home.banner_dismiss')"
          @click="dismissUntilTomorrow"
        >
          <span class="icon-[carbon--close] size-4" />
        </button>
      </div>

      <ul
        v-if="expanded"
        class="divide-y divide-warning/20 border-t border-warning/20"
      >
        <li
          v-for="item in items"
          :key="item.sub.id"
          class="flex items-center gap-3 px-4 py-2 text-sm"
        >
          <CatalogIcon :entry="catalogFor(item.sub.catalogId)" :name="item.sub.name" />
          <span class="flex-1 truncate font-medium">{{ item.sub.name }}</span>
          <span class="opacity-80">{{ whenLabel(item) }}</span>
        </li>
      </ul>
    </section>
  </Transition>
</template>
