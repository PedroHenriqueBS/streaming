<script setup lang="ts">
import { computed, reactive } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProfileAvatar from './ProfileAvatar.vue'
import { AVATAR_HUES, avatarGradient } from '@/utils/avatar'
import type { Profile } from '@/types/api'

const props = defineProps<{
  profile: Profile | null
  canDelete: boolean
}>()

const emit = defineEmits<{
  save: [payload: { name: string; avatarHue: number }]
  remove: []
  close: []
}>()

const isNew = computed(() => props.profile === null)

const form = reactive({
  name: props.profile?.name ?? '',
  hue: props.profile?.avatarHue ?? AVATAR_HUES[4],
  error: '',
})

function save(): void {
  const name = form.name.trim()
  if (name.length < 2) {
    form.error = 'Digite um nome com pelo menos 2 letras.'
    return
  }
  emit('save', { name, avatarHue: form.hue })
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-250 flex animate-fade-in items-center justify-center bg-[rgba(6,5,4,0.8)] p-6 backdrop-blur-[10px]"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-[440px] animate-fade-up rounded-[20px] border border-white/10 bg-surface-raised p-9 pb-8 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
      >
        <h2 class="mb-6.5 font-display text-[22px] font-bold">
          {{ isNew ? 'Novo perfil' : 'Editar perfil' }}
        </h2>

        <div class="mb-6 flex items-center gap-5.5">
          <ProfileAvatar :name="form.name" :hue="form.hue" size="md" />
          <div class="flex flex-1 flex-col gap-1.5">
            <label class="text-[12.5px] font-bold text-foreground/55">Nome do perfil</label>
            <input
              v-model="form.name"
              placeholder="Nome"
              class="rounded-[10px] border bg-white/5 px-4 py-3 text-[15px] text-foreground transition-colors focus:border-primary"
              :class="form.error ? 'border-danger' : 'border-white/15'"
              @input="form.error = ''"
            >
            <span class="min-h-0.5 text-[12.5px] text-danger">{{ form.error }}</span>
          </div>
        </div>

        <label class="mb-2.5 block text-[12.5px] font-bold text-foreground/55">Cor do avatar</label>
        <div class="mb-7 flex flex-wrap gap-2.5">
          <button
            v-for="hue in AVATAR_HUES"
            :key="hue"
            type="button"
            class="size-9.5 cursor-pointer rounded-xl border-2 transition-all duration-200 hover:scale-112"
            :class="form.hue === hue ? 'border-primary' : 'border-transparent'"
            :style="{ background: avatarGradient(hue) }"
            @click="form.hue = hue"
          />
        </div>

        <div class="flex gap-2.5">
          <BaseButton class="flex-1" @click="save">Salvar</BaseButton>
          <BaseButton v-if="!isNew && canDelete" variant="danger" @click="emit('remove')">
            Excluir
          </BaseButton>
          <BaseButton variant="ghost" @click="emit('close')">Cancelar</BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
