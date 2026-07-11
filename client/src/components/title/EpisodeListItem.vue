<script setup lang="ts">
import { formatRuntime } from '@/utils/format'
import { posterGradient } from '@/utils/gradients'
import type { Episode } from '@/types/api'

const props = defineProps<{ episode: Episode; seedHue: number }>()

const emit = defineEmits<{ play: [episode: Episode] }>()

const fallback = posterGradient((props.seedHue + props.episode.number * 18) % 360)
</script>

<template>
  <button
    type="button"
    class="flex cursor-pointer items-center gap-4.5 rounded-[14px] px-3.5 py-3 text-left transition-all duration-200 hover:translate-x-1 hover:bg-white/5"
    @click="emit('play', episode)"
  >
    <span class="w-6.5 flex-none text-center font-display text-lg font-extrabold text-foreground/35">
      {{ episode.number }}
    </span>
    <div
      class="relative flex h-[70px] w-[124px] flex-none items-center justify-center overflow-hidden rounded-[9px]"
      :style="{ background: fallback }"
    >
      <img
        v-if="episode.stillUrl"
        :src="episode.stillUrl"
        :alt="episode.name"
        loading="lazy"
        class="absolute inset-0 size-full object-cover"
      >
      <span
        class="relative flex size-8.5 items-center justify-center rounded-full bg-[rgba(11,10,9,0.55)] pl-0.5 text-[11px] text-foreground backdrop-blur-sm"
      >
        ▶
      </span>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline gap-2.5">
        <span class="font-display text-[15px] font-bold">{{ episode.name }}</span>
        <span v-if="episode.runtimeMinutes" class="flex-none text-xs font-bold text-foreground/45">
          {{ formatRuntime(episode.runtimeMinutes) }}
        </span>
      </div>
      <p class="mt-1 mb-0 line-clamp-2 text-[13.5px] leading-[1.45] text-foreground/60 [text-wrap:pretty]">
        {{ episode.overview }}
      </p>
    </div>
  </button>
</template>
