<script setup lang="ts">
import BaseToggle from '@/components/ui/BaseToggle.vue'
import type { UserPreferences, VideoQuality } from '@/types/api'

defineProps<{ preferences: UserPreferences }>()

const emit = defineEmits<{ update: [payload: Partial<UserPreferences>] }>()

const TOGGLES: { key: keyof Omit<UserPreferences, 'videoQuality'>; title: string; description: string }[] = [
  {
    key: 'autoplay',
    title: 'Reprodução automática',
    description: 'Iniciar o próximo episódio automaticamente',
  },
  {
    key: 'previews',
    title: 'Prévias ao navegar',
    description: 'Reproduzir prévias enquanto você explora o catálogo',
  },
  {
    key: 'subtitles',
    title: 'Legendas sempre ativas',
    description: 'Exibir legendas em todos os títulos',
  },
  {
    key: 'releaseNotifications',
    title: 'Notificações de lançamentos',
    description: 'Avisar quando novos títulos chegarem',
  },
]

const QUALITIES: { id: VideoQuality; label: string }[] = [
  { id: 'HD', label: 'HD' },
  { id: 'FULL_HD', label: 'Full HD' },
  { id: 'UHD_4K', label: '4K' },
]
</script>

<template>
  <div>
    <div
      v-for="toggle in TOGGLES"
      :key="toggle.key"
      class="flex items-center justify-between gap-5 border-b border-white/5 py-4"
    >
      <div>
        <div class="text-[15px] font-bold">{{ toggle.title }}</div>
        <div class="mt-1 text-[13px] text-foreground/55">{{ toggle.description }}</div>
      </div>
      <BaseToggle
        :model-value="preferences[toggle.key]"
        @update:model-value="emit('update', { [toggle.key]: $event })"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-5 pt-4.5 pb-1">
      <div>
        <div class="text-[15px] font-bold">Qualidade de vídeo</div>
        <div class="mt-1 text-[13px] text-foreground/55">Qualidade máxima de streaming</div>
      </div>
      <div class="flex gap-2">
        <button
          v-for="quality in QUALITIES"
          :key="quality.id"
          type="button"
          class="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-200 hover:border-primary"
          :class="
            preferences.videoQuality === quality.id
              ? 'border-primary bg-primary/15 text-primary-soft'
              : 'border-white/15 bg-transparent text-foreground/60'
          "
          @click="emit('update', { videoQuality: quality.id })"
        >
          {{ quality.label }}
        </button>
      </div>
    </div>
  </div>
</template>
