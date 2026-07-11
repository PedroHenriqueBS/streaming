<script setup lang="ts">
import TrailerPlayer from '@/components/player/TrailerPlayer.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
</script>

<template>
  <RouterView />
  <TrailerPlayer />
  <ToastNotification />
</template>
