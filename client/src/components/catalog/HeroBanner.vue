<script setup lang="ts">
import { computed } from 'vue'
import { formatMeta, formatRating } from '@/utils/format'
import { heroGradient } from '@/utils/gradients'
import type { TitleSummary } from '@/types/api'

const props = defineProps<{
  item: TitleSummary
  visible: boolean
}>()

const emit = defineEmits<{
  play: [item: TitleSummary]
  details: [item: TitleSummary]
}>()

const tagLabel = computed(() => {
  if (props.item.isAnimation) {
    return 'Animação em destaque'
  }
  return props.item.mediaType === 'movie' ? 'Filme em destaque' : 'Série em destaque'
})

const fallbackBackground = computed(() => heroGradient((props.item.tmdbId * 53) % 360))
</script>

<template>
  <div class="relative -mt-[73px] flex h-[66vh] min-h-[440px] items-end overflow-hidden">
    <div
      class="absolute inset-0 transition-opacity duration-[450ms]"
      :class="visible ? 'opacity-100' : 'opacity-0'"
      :style="{ background: fallbackBackground }"
    >
      <img
        v-if="item.backdropUrl"
        :src="item.backdropUrl"
        :alt="item.title"
        class="size-full object-cover"
      >
    </div>
    <div
      class="absolute inset-0 animate-hero-glow bg-[radial-gradient(70%_90%_at_78%_12%,rgba(255,106,0,0.14)_0%,transparent_55%)]"
    />
    <div
      class="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,9,0.35)_0%,rgba(11,10,9,0.05)_40%,rgba(11,10,9,0.92)_88%,#0b0a09_100%)]"
    />

    <div
      class="relative max-w-[720px] px-5 pb-16 transition-opacity duration-[450ms] sm:px-14"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    >
      <span
        class="mb-3.5 inline-flex items-center gap-2 text-[12.5px] font-extrabold tracking-[2.5px] text-primary uppercase"
      >
        <span class="inline-block h-0.5 w-5.5 bg-primary" />
        {{ tagLabel }}
      </span>
      <h1
        class="m-0 mb-4 font-display text-[clamp(38px,5.4vw,68px)] leading-[0.98] font-extrabold tracking-[-1.5px] [text-shadow:0_8px_40px_rgba(0,0,0,0.5)]"
      >
        {{ item.title }}
      </h1>
      <div class="mb-4 flex items-center gap-3.5 text-[14.5px] font-semibold text-foreground/75">
        <span v-if="item.rating > 0" class="font-extrabold text-star">
          ★ {{ formatRating(item.rating) }}
        </span>
        <span>{{ formatMeta(item) }}</span>
      </div>
      <p
        class="m-0 mb-7 line-clamp-3 max-w-[560px] text-[16.5px] leading-[1.55] text-foreground/80 [text-wrap:pretty]"
      >
        {{ item.overview }}
      </p>
      <div class="flex gap-3.5">
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 font-display text-[15.5px] font-bold text-on-primary transition-all duration-200 hover:-translate-y-[3px] hover:bg-primary-hover hover:shadow-[0_14px_36px_rgba(255,106,0,0.4)] active:-translate-y-px"
          @click="emit('play', item)"
        >
          <span class="text-[13px]">▶</span> Assistir
        </button>
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 font-display text-[15.5px] font-semibold text-foreground backdrop-blur-lg transition-all duration-200 hover:-translate-y-[3px] hover:border-white/40 hover:bg-white/15"
          @click="emit('details', item)"
        >
          Mais informações
        </button>
      </div>
    </div>
  </div>
</template>
