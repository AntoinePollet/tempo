<script setup lang="ts">
import { useFormatCurrency } from '~/composables/format'
import { findInCatalog } from '~/data/catalog'
import { monthlyTotal, yearlyTotal } from '~/lib/rollup'
import { useSettingsStore } from '~/stores/settings'
import { useSubscriptionModalStore } from '~/stores/subscriptionModal'
import { useSubscriptionsStore } from '~/stores/subscriptions'

defineOptions({ name: 'IndexPage' })

const { t } = useI18n()
const subs = useSubscriptionsStore()
const settings = useSettingsStore()
const modal = useSubscriptionModalStore()
const { format } = useFormatCurrency()

useHead({
  title: () => t('app.name'),
})

const visibleSubs = computed(() =>
  settings.showCancelled ? subs.items : subs.visible,
)

const monthly = computed(() => monthlyTotal(subs.items))
const yearly = computed(() => yearlyTotal(subs.items))
const isEmpty = computed(() => visibleSubs.value.length === 0)

const QUICK_ADD_IDS = ['netflix', 'spotify', 'openai'] as const
const quickAddEntries = QUICK_ADD_IDS
  .map(id => findInCatalog(id))
  .filter((e): e is NonNullable<typeof e> => e !== undefined)

function quickAdd(entryId: string) {
  const entry = findInCatalog(entryId)
  if (!entry)
    return
  modal.openAdd()
  modal.pickCatalog(entry)
}
</script>

<template>
  <div class="space-y-6">
    <DueSoonBanner />

    <section class="card bg-base-100 border border-base-300">
      <div class="card-body items-center text-center">
        <p class="text-sm uppercase tracking-wide opacity-70">
          {{ t('home.rollup_per_month') }}
        </p>
        <p class="text-4xl font-semibold">
          {{ format(monthly) }}
        </p>
        <p class="text-sm opacity-70">
          {{ format(yearly) }} {{ t('home.rollup_per_year') }}
        </p>
      </div>
    </section>

    <section v-if="isEmpty" class="card bg-base-100 border border-base-300">
      <div class="card-body items-center text-center gap-4 py-10">
        <span class="icon-[carbon--cube] size-12 opacity-40" />
        <div>
          <h2 class="text-lg font-semibold">
            {{ t('home.empty_title') }}
          </h2>
          <p class="text-sm opacity-70">
            {{ t('home.empty_subtitle') }}
          </p>
        </div>
        <div class="w-full">
          <p class="mb-2 text-xs uppercase tracking-wide opacity-60">
            {{ t('home.quick_add') }}
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="entry in quickAddEntries"
              :key="entry.id"
              class="btn btn-ghost border border-base-300 gap-2"
              @click="quickAdd(entry.id)"
            >
              <CatalogIcon :entry="entry" :name="entry.name" />
              {{ entry.name }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <template v-else>
      <section class="card bg-base-100 border border-base-300">
        <div class="card-body p-2">
          <ul class="divide-y divide-base-300">
            <li v-for="sub in visibleSubs" :key="sub.id">
              <SubscriptionRow :sub="sub" />
            </li>
          </ul>
        </div>
      </section>

      <section class="card bg-base-100 border border-base-300">
        <div class="card-body">
          <h2 class="card-title text-base">
            {{ t('stats.by_category') }}
          </h2>
          <StatsDonut :subs="subs.items" />
        </div>
      </section>

      <section class="card bg-base-100 border border-base-300">
        <div class="card-body">
          <h2 class="card-title text-base">
            {{ t('stats.top_expensive') }}
          </h2>
          <StatsTop :subs="subs.items" :limit="5" />
        </div>
      </section>
    </template>
  </div>
</template>
