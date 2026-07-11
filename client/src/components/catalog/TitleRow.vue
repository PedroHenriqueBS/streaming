<script setup lang="ts">
import TitleCard from './TitleCard.vue'
import type { TitleSummary } from '@/types/api'

defineProps<{
  label: string
  items: TitleSummary[]
}>()

const emit = defineEmits<{ open: [item: TitleSummary] }>()
</script>

<template>
  <section class="mb-3.5">
    <div class="mb-3.5 flex items-baseline gap-3 px-5 sm:px-14">
      <h2 class="m-0 font-display text-xl font-bold">{{ label }}</h2>
      <span class="text-xs font-bold tracking-[0.5px] text-primary">{{ items.length }} títulos</span>
    </div>
    <div class="-my-5 flex snap-x snap-proximity gap-3.5 overflow-x-auto px-5 py-7 pb-10 sm:px-14">
      <TitleCard
        v-for="item in items"
        :key="`${item.mediaType}-${item.tmdbId}`"
        :item="item"
        @open="emit('open', $event)"
      />
    </div>
  </section>
</template>
