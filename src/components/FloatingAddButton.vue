<script setup lang="ts">
import { useSubscriptionModalStore } from '~/stores/subscriptionModal'

const { t } = useI18n()
const modal = useSubscriptionModalStore()
</script>

<template>
  <button
    class="btn btn-primary btn-circle btn-lg fixed bottom-6 right-6 z-20 shadow-lg"
    :title="t('action.add')"
    :aria-label="t('action.add')"
    @click="modal.openAdd()"
  >
    <span class="icon-[carbon--add] size-7" />
  </button>
</template>
