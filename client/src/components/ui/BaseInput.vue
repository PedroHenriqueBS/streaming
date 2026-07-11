<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string
    placeholder?: string
    label?: string
    error?: string
    autocomplete?: string
  }>(),
  { type: 'text', placeholder: '', label: '', error: '', autocomplete: 'off' },
)

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[12.5px] font-bold text-foreground/55">{{ label }}</label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      class="rounded-[10px] border bg-white/5 px-4 py-3.5 text-[15px] text-foreground transition-colors duration-200 focus:border-primary"
      :class="error ? 'border-danger' : 'border-white/15'"
    >
    <span class="min-h-0.5 text-[12.5px] text-danger">{{ error }}</span>
  </div>
</template>
