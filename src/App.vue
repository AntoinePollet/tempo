<script setup lang="ts">
useHead({
  title: 'Tempo',
  meta: [
    {
      name: 'description',
      content: 'Track your recurring spending — local-first PWA',
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#1d232a' : '#5E81AC',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg',
    },
  ],
})
</script>

<template>
  <RouterView />
</template>
