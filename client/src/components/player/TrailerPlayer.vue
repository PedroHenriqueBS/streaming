<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player.store'

const playerStore = usePlayerStore()
const { playback } = storeToRefs(playerStore)

const embedUrl = computed(() => {
  if (!playback.value) {
    return ''
  }
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    hl: 'pt-BR',
  })
  return `https://www.youtube-nocookie.com/embed/${playback.value.trailerKey}?${params}`
})

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    playerStore.close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="playback" class="fixed inset-0 z-200 flex animate-fade-in flex-col bg-black">
      <div class="flex items-center gap-4 px-5 py-4 sm:px-10">
        <div
          class="size-3.5 flex-none rotate-45 animate-pulse-strong rounded-[4px] bg-primary shadow-[0_0_30px_rgba(255,106,0,0.9)]"
        />
        <div class="min-w-0 flex-1">
          <div class="truncate font-display text-base font-extrabold uppercase sm:text-lg">
            {{ playback.title }}
          </div>
          <div
            v-if="playback.subtitle"
            class="truncate text-xs font-bold tracking-[1px] text-foreground/50 uppercase"
          >
            {{ playback.subtitle }}
          </div>
        </div>
        <button
          type="button"
          class="cursor-pointer rounded-[9px] border border-white/25 bg-white/10 px-5.5 py-2.5 font-display text-[13.5px] font-semibold text-foreground transition-colors duration-200 hover:bg-primary hover:text-on-primary"
          @click="playerStore.close()"
        >
          Sair do player
        </button>
      </div>
      <div class="flex-1 px-0 pb-0 sm:px-10 sm:pb-8">
        <iframe
          :src="embedUrl"
          class="size-full rounded-none border-0 sm:rounded-2xl"
          title="Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </div>
  </Teleport>
</template>
