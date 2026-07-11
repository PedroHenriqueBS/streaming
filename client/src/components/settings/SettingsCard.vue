<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="rounded-[18px] border border-white/10 bg-white/3 px-7.5 py-7">
    <h2 class="m-0 mb-4.5 font-display text-[17px] font-bold">{{ title }}</h2>
    <slot />
  </section>
</template>
