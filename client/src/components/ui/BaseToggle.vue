<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    class="relative h-[27px] w-12 flex-none cursor-pointer rounded-full transition-colors duration-250"
    :class="model ? 'bg-primary' : 'bg-white/15'"
    @click="model = !model"
  >
    <span
      class="absolute top-[3px] size-[21px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-all duration-250"
      :class="model ? 'left-6' : 'left-[3px]'"
    />
  </button>
</template>
