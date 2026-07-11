import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import type { TitleSummary } from '@/types/api'

const ROTATION_INTERVAL_MS = 8000
const FADE_MS = 450

/**
 * Rotates the hero highlight through `featured` every 8s with a fade,
 * exactly like the DevFlix prototype. Rotation pauses while `paused` is true
 * (searching, modal open, etc.).
 */
export function useHeroRotation(featured: Ref<TitleSummary[]>, paused: Ref<boolean>) {
  const heroIndex = ref(0)
  const heroVisible = ref(true)
  let intervalId: ReturnType<typeof setInterval> | null = null
  let fadeTimeoutId: ReturnType<typeof setTimeout> | null = null

  const hero = computed<TitleSummary | null>(() => {
    const pool = featured.value
    return pool[heroIndex.value % pool.length] ?? null
  })

  function rotate(): void {
    if (paused.value || featured.value.length < 2) {
      return
    }
    heroVisible.value = false
    fadeTimeoutId = setTimeout(() => {
      heroIndex.value = (heroIndex.value + 1) % featured.value.length
      heroVisible.value = true
    }, FADE_MS)
  }

  onMounted(() => {
    intervalId = setInterval(rotate, ROTATION_INTERVAL_MS)
  })

  onBeforeUnmount(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    if (fadeTimeoutId) {
      clearTimeout(fadeTimeoutId)
    }
  })

  return { hero, heroVisible }
}
