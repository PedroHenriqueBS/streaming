<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
const diamondSizes = { sm: 'size-3', md: 'size-3', lg: 'size-3.5' }
</script>

<template>
  <div class="flex items-center gap-2.5">
    <div
      class="rotate-45 rounded-[3px] bg-primary shadow-[0_0_16px_rgba(255,106,0,0.8)]"
      :class="diamondSizes[size]"
    />
    <span class="font-display font-extrabold tracking-wide" :class="textSizes[size]">
      <span class="text-foreground">DEV</span><span class="text-primary">FLIX</span>
    </span>
  </div>
</template>
