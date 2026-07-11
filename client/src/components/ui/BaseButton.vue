<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', loading: false, disabled: false, type: 'button' },
)

const variantClasses = {
  primary:
    'bg-primary text-on-primary font-display font-bold hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(255,106,0,0.35)] active:translate-y-0',
  ghost:
    'border border-white/20 bg-white/5 text-foreground font-display font-semibold hover:border-primary',
  danger:
    'border border-danger/40 bg-danger/10 text-danger-soft font-display font-semibold hover:border-danger hover:bg-danger/15',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="flex cursor-pointer items-center justify-center gap-2.5 rounded-[10px] px-6 py-3.5 text-[15px] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
    :class="variantClasses[variant]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spinner rounded-full border-2 border-black/30 border-t-current"
    />
    <slot />
  </button>
</template>
