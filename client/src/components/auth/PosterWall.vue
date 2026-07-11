<script setup lang="ts">
import { posterGradient, WALL_HUES } from '@/utils/gradients'
</script>

<template>
  <div class="pointer-events-none absolute -inset-[15%] grid animate-wall-float grid-cols-6 gap-3.5 opacity-50">
    <div
      v-for="hue in WALL_HUES"
      :key="hue"
      class="aspect-[2/3] rounded-[10px]"
      :style="{ background: posterGradient(hue) }"
    />
  </div>
  <div
    class="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_40%,rgba(11,10,9,0.55)_0%,rgba(11,10,9,0.92)_70%,#0b0a09_100%)]"
  />
</template>
