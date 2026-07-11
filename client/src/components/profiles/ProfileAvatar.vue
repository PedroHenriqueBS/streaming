<script setup lang="ts">
import { computed } from 'vue'
import { avatarGradient, initialOf } from '@/utils/avatar'

const props = withDefaults(
  defineProps<{
    name: string
    hue: number
    size?: 'sm' | 'md' | 'lg'
    showEditOverlay?: boolean
  }>(),
  { size: 'lg', showEditOverlay: false },
)

const sizeClasses = {
  sm: 'size-10 rounded-xl text-base',
  md: 'size-24 rounded-[22px] text-4xl',
  lg: 'size-30 rounded-[26px] text-[44px]',
}

const background = computed(() => avatarGradient(props.hue))
const initial = computed(() => initialOf(props.name))
</script>

<template>
  <div
    class="relative flex flex-none items-center justify-center overflow-hidden border-2 border-white/10 font-display font-extrabold text-white/90 transition-all duration-200"
    :class="sizeClasses[size]"
    :style="{ background }"
  >
    {{ initial }}
    <div
      v-if="showEditOverlay"
      class="absolute inset-0 flex items-center justify-center bg-[rgba(11,10,9,0.6)] text-[11px] font-extrabold tracking-[2px] backdrop-blur-[2px]"
    >
      EDITAR
    </div>
  </div>
</template>
