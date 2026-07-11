<script setup lang="ts">
defineProps<{ maxWidth?: string }>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-100 animate-fade-in overflow-y-auto bg-[rgba(6,5,4,0.78)] p-5 py-12 backdrop-blur-[10px]"
      @click.self="emit('close')"
    >
      <div
        class="mx-auto animate-fade-up overflow-hidden rounded-[22px] border border-white/10 bg-surface shadow-[0_50px_120px_rgba(0,0,0,0.7)]"
        :style="{ maxWidth: maxWidth ?? '940px' }"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
