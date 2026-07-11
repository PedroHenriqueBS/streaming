<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast.store'

const { message, visible } = storeToRefs(useToastStore())
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed bottom-7 left-1/2 z-300 -translate-x-1/2 animate-fade-up rounded-full bg-primary px-6.5 py-3.5 font-display text-sm font-bold text-on-primary shadow-[0_14px_40px_rgba(255,106,0,0.4)]"
    >
      {{ message }}
    </div>
  </Teleport>
</template>
