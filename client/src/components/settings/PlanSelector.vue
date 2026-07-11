<script setup lang="ts">
import type { Plan } from '@/types/api'

defineProps<{ currentPlan: Plan }>()

const emit = defineEmits<{ select: [plan: Plan] }>()

const PLANS: { id: Plan; name: string; price: string; description: string }[] = [
  { id: 'BASIC', name: 'Básico', price: 'R$ 18,90/mês', description: '1 tela · HD' },
  { id: 'STANDARD', name: 'Padrão', price: 'R$ 32,90/mês', description: '2 telas · Full HD' },
  { id: 'PREMIUM', name: 'Premium', price: 'R$ 49,90/mês', description: '4 telas · 4K + HDR' },
]
</script>

<template>
  <div class="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
    <button
      v-for="plan in PLANS"
      :key="plan.id"
      type="button"
      class="relative cursor-pointer rounded-[14px] border-2 p-5 text-left transition-all duration-200 hover:-translate-y-[3px] hover:border-primary"
      :class="currentPlan === plan.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/3'"
      @click="emit('select', plan.id)"
    >
      <span
        v-if="currentPlan === plan.id"
        class="absolute -top-[11px] right-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold tracking-[1.5px] text-on-primary uppercase"
      >
        Seu plano
      </span>
      <div class="font-display text-base font-extrabold">{{ plan.name }}</div>
      <div class="my-2 mb-1 font-display text-[21px] font-extrabold text-primary-soft">
        {{ plan.price }}
      </div>
      <div class="text-[12.5px] font-semibold text-foreground/55">{{ plan.description }}</div>
    </button>
  </div>
</template>
