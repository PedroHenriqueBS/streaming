<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLogo from '@/components/ui/AppLogo.vue'
import ProfileAvatar from '@/components/profiles/ProfileAvatar.vue'
import { useProfilesStore } from '@/stores/profiles.store'

const searchQuery = defineModel<string>('search', { default: '' })

const route = useRoute()
const router = useRouter()
const profilesStore = useProfilesStore()

const NAV_ITEMS = [
  { section: undefined, label: 'Início' },
  { section: 'movies', label: 'Filmes' },
  { section: 'series', label: 'Séries' },
  { section: 'animation', label: 'Desenhos' },
  { section: 'my-list', label: 'Minha lista' },
] as const

const activeSection = computed(() =>
  route.name === 'browse' ? ((route.params.section as string | undefined) ?? undefined) : null,
)

const isSettings = computed(() => route.name === 'settings')

function navigate(section: string | undefined): void {
  searchQuery.value = ''
  void router.push({ name: 'browse', params: { section: section ?? '' } })
}
</script>

<template>
  <header
    class="sticky top-0 z-60 flex items-center gap-4 border-b border-white/5 bg-[linear-gradient(180deg,rgba(11,10,9,0.92)_0%,rgba(11,10,9,0.72)_100%)] px-5 py-4 backdrop-blur-2xl sm:gap-8 sm:px-14"
  >
    <AppLogo size="sm" class="flex-none" />

    <nav class="hidden flex-1 gap-6.5 md:flex">
      <button
        v-for="item in NAV_ITEMS"
        :key="item.label"
        type="button"
        class="cursor-pointer border-b-2 px-0.5 py-1.5 text-[14.5px] transition-colors hover:text-white"
        :class="
          activeSection === item.section
            ? 'border-primary font-extrabold text-white'
            : 'border-transparent font-medium text-foreground/55'
        "
        @click="navigate(item.section)"
      >
        {{ item.label }}
      </button>
    </nav>

    <input
      v-model="searchQuery"
      type="text"
      placeholder="Buscar títulos…"
      class="ml-auto w-full max-w-[200px] rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:max-w-[300px] focus:border-primary"
    >

    <button
      type="button"
      title="Configurações da conta"
      class="flex size-10 flex-none cursor-pointer items-center justify-center rounded-xl border bg-white/5 transition-all duration-200 hover:scale-108 hover:border-primary"
      :class="isSettings ? 'border-primary' : 'border-white/10'"
      @click="router.push({ name: 'settings' })"
    >
      <span class="flex w-4 flex-col gap-1">
        <span class="relative h-0.5 rounded-full bg-foreground/55">
          <span class="absolute -top-0.5 left-0.5 size-1.5 rounded-full bg-foreground" />
        </span>
        <span class="relative h-0.5 rounded-full bg-foreground/55">
          <span class="absolute -top-0.5 left-[9px] size-1.5 rounded-full bg-foreground" />
        </span>
        <span class="relative h-0.5 rounded-full bg-foreground/55">
          <span class="absolute -top-0.5 left-[5px] size-1.5 rounded-full bg-foreground" />
        </span>
      </span>
    </button>

    <button
      v-if="profilesStore.activeProfile"
      type="button"
      title="Trocar perfil"
      class="flex-none cursor-pointer transition-transform duration-200 hover:scale-108"
      @click="router.push({ name: 'profiles' })"
    >
      <ProfileAvatar
        :name="profilesStore.activeProfile.name"
        :hue="profilesStore.activeProfile.avatarHue"
        size="sm"
        class="hover:border-primary"
      />
    </button>
  </header>
</template>
