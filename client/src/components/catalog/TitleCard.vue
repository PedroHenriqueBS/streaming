<script setup lang="ts">
import { computed } from 'vue'
import { badgeOf, formatMeta, formatRating } from '@/utils/format'
import { posterGradient } from '@/utils/gradients'
import type { TitleSummary } from '@/types/api'

const props = defineProps<{ item: TitleSummary }>()

const emit = defineEmits<{ open: [item: TitleSummary] }>()

const badge = computed(() => badgeOf(props.item))
const fallbackBackground = computed(() => posterGradient((props.item.tmdbId * 37) % 360))
</script>

<template>
  <button
    type="button"
    class="w-[164px] flex-none cursor-pointer snap-start rounded-xl text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_20px_48px_rgba(0,0,0,0.6),0_0_0_2px_#FF6A00] sm:w-[214px]"
    @click="emit('open', item)"
  >
    <div
      class="relative flex h-[246px] items-end overflow-hidden rounded-xl sm:h-[320px]"
      :style="{ background: fallbackBackground }"
    >
      <img
        v-if="item.posterUrl"
        :src="item.posterUrl"
        :alt="item.title"
        loading="lazy"
        class="absolute inset-0 size-full object-cover"
      >

      <span
        class="absolute top-2.5 left-2.5 rounded-md bg-[rgba(11,10,9,0.55)] px-2.5 py-1 text-[10.5px] font-extrabold tracking-[1.5px] uppercase backdrop-blur-md"
        :class="badge.highlighted ? 'text-primary-soft' : 'text-foreground/75'"
      >
        {{ badge.label }}
      </span>
      <span
        v-if="item.rating > 0"
        class="absolute top-2.5 right-2.5 rounded-md bg-[rgba(11,10,9,0.55)] px-2 py-1 text-[11.5px] font-extrabold text-star backdrop-blur-md"
      >
        ★ {{ formatRating(item.rating) }}
      </span>

      <div
        class="relative w-full bg-gradient-to-b from-transparent to-[rgba(8,6,4,0.92)] to-75% px-3.5 pt-11 pb-3.5"
      >
        <div
          class="font-display text-lg leading-none font-extrabold tracking-[-0.4px] uppercase [text-wrap:balance] sm:text-2xl"
        >
          {{ item.title }}
        </div>
        <div class="mt-1.5 text-[11.5px] font-semibold text-foreground/60">
          {{ formatMeta(item) }}
        </div>
      </div>
    </div>
  </button>
</template>
