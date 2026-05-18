<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <header class="safe-top sticky top-0 z-10 border-b border-base-300 bg-base-100/80 backdrop-blur">
    <div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
      <RouterLink to="/" class="text-lg font-semibold">
        {{ t('app.name') }}
      </RouterLink>

      <RouterLink to="/settings" class="btn btn-ghost btn-sm btn-square" :title="t('action.settings')">
        <span class="icon-[carbon--settings] size-5" />
      </RouterLink>
    </div>
  </header>
</template>
