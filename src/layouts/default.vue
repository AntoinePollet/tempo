<template>
  <div class="min-h-screen flex flex-col">
    <TheFooter />
    <main class="flex-1 px-4 py-6 pb-28 mx-auto w-full max-w-2xl">
      <RouterView />
    </main>
    <FloatingAddButton />
    <SubscriptionModal />
    <UpdatePrompt />
  </div>
</template>
