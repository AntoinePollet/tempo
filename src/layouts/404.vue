<script setup lang="ts">
const router = useRouter()
const { t } = useI18n()
useHead({
  title: () => t('not-found'),
})
</script>

<template>
  <main class="px-4 py-10 text-center">
    <div class="text-4xl">
      <span class="icon-[carbon--warning] inline-block size-10" />
    </div>
    <RouterView />
    <div>
      <button class="btn btn-primary btn-sm mt-8" @click="router.back()">
        {{ t('action.back') }}
      </button>
    </div>
  </main>
</template>
