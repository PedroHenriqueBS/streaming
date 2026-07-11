<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLogo from '@/components/ui/AppLogo.vue'
import ProfileAvatar from '@/components/profiles/ProfileAvatar.vue'
import ProfileEditorModal from '@/components/profiles/ProfileEditorModal.vue'
import { useToast } from '@/composables/useToast'
import { extractErrorMessage } from '@/api/http'
import { useProfilesStore } from '@/stores/profiles.store'
import type { Profile } from '@/types/api'

const router = useRouter()
const route = useRoute()
const profilesStore = useProfilesStore()
const { showToast } = useToast()

const managing = ref(route.query.manage === '1')
const editorOpen = ref(false)
const editingProfile = ref<Profile | null>(null)

const hint = computed(() =>
  managing.value
    ? 'Toque em um perfil para editar o nome e a cor do avatar'
    : 'Cada perfil tem recomendações personalizadas',
)

onMounted(() => {
  if (!profilesStore.loaded) {
    void profilesStore.fetchProfiles()
  }
})

function selectProfile(profile: Profile): void {
  if (managing.value) {
    editingProfile.value = profile
    editorOpen.value = true
    return
  }
  profilesStore.setActiveProfile(profile.id)
  void router.push({ name: 'browse' })
}

function openNewProfile(): void {
  editingProfile.value = null
  editorOpen.value = true
}

async function saveProfile(payload: { name: string; avatarHue: number }): Promise<void> {
  const isNew = editingProfile.value === null
  try {
    if (isNew) {
      await profilesStore.createProfile(payload)
    } else {
      await profilesStore.updateProfile(editingProfile.value!.id, payload)
    }
    editorOpen.value = false
    showToast(isNew ? 'Perfil criado' : 'Perfil atualizado')
  } catch (error) {
    showToast(extractErrorMessage(error, 'Não foi possível salvar o perfil.'))
  }
}

async function removeProfile(): Promise<void> {
  if (!editingProfile.value) {
    return
  }
  try {
    await profilesStore.removeProfile(editingProfile.value.id)
    editorOpen.value = false
    showToast('Perfil excluído')
  } catch (error) {
    showToast(extractErrorMessage(error, 'Não foi possível excluir o perfil.'))
  }
}
</script>

<template>
  <div
    class="fixed inset-0 flex animate-fade-in flex-col items-center justify-center gap-11 overflow-y-auto bg-[radial-gradient(80%_70%_at_50%_0%,rgba(255,106,0,0.09)_0%,transparent_60%),#0b0a09]"
  >
    <AppLogo />

    <h1 class="m-0 animate-fade-up font-display text-[clamp(28px,4vw,40px)] font-bold">
      Quem está assistindo?
    </h1>

    <div class="flex animate-fade-up flex-wrap items-start justify-center gap-7">
      <button
        v-for="profile in profilesStore.profiles"
        :key="profile.id"
        type="button"
        class="group flex cursor-pointer flex-col items-center gap-3.5 transition-transform duration-250 hover:-translate-y-2 hover:scale-105"
        @click="selectProfile(profile)"
      >
        <ProfileAvatar
          :name="profile.name"
          :hue="profile.avatarHue"
          :show-edit-overlay="managing"
          class="group-hover:border-primary group-hover:shadow-[0_16px_44px_rgba(255,106,0,0.25)]"
        />
        <span class="text-[15px] font-semibold text-foreground/75">{{ profile.name }}</span>
      </button>

      <button
        v-if="profilesStore.canAddProfile"
        type="button"
        class="group flex cursor-pointer flex-col items-center gap-3.5 transition-transform duration-250 hover:-translate-y-2 hover:scale-105"
        @click="openNewProfile"
      >
        <div
          class="flex size-30 items-center justify-center rounded-[26px] border-2 border-dashed border-white/25 font-display text-[44px] text-foreground/50 transition-colors group-hover:border-primary group-hover:text-primary-soft"
        >
          +
        </div>
        <span class="text-[15px] font-semibold text-foreground/55">Adicionar</span>
      </button>
    </div>

    <button
      type="button"
      class="animate-fade-up cursor-pointer rounded-full border px-7 py-3 font-display text-sm font-semibold transition-all duration-200 hover:border-primary"
      :class="
        managing
          ? 'border-primary bg-primary/15 text-primary-soft'
          : 'border-white/20 bg-transparent text-foreground/70'
      "
      @click="managing = !managing"
    >
      {{ managing ? 'Concluído' : 'Gerenciar perfis' }}
    </button>

    <p class="animate-fade-up text-[13px] text-foreground/40">{{ hint }}</p>

    <ProfileEditorModal
      v-if="editorOpen"
      :key="editingProfile?.id ?? 'new'"
      :profile="editingProfile"
      :can-delete="profilesStore.profiles.length > 1"
      @save="saveProfile"
      @remove="removeProfile"
      @close="editorOpen = false"
    />
  </div>
</template>
