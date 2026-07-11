<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import HeroBanner from '@/components/catalog/HeroBanner.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import TitleCard from '@/components/catalog/TitleCard.vue'
import TitleDetailModal from '@/components/title/TitleDetailModal.vue'
import TitleRow from '@/components/catalog/TitleRow.vue'
import { historyApi } from '@/api/history.api'
import type { CatalogSectionKey } from '@/api/catalog.api'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { useHeroRotation } from '@/composables/useHeroRotation'
import { usePlayTitle } from '@/composables/usePlayTitle'
import { useCatalogStore } from '@/stores/catalog.store'
import { useProfilesStore } from '@/stores/profiles.store'
import { useWatchlistStore } from '@/stores/watchlist.store'
import type { MediaType, TitleSummary } from '@/types/api'

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const profilesStore = useProfilesStore()
const watchlistStore = useWatchlistStore()
const { playTitle } = usePlayTitle()

const searchQuery = ref('')
const debouncedQuery = useDebouncedRef(searchQuery, 350)
const recentTitles = ref<TitleSummary[]>([])

const sectionKey = computed<CatalogSectionKey | 'my-list'>(() => {
  const section = route.params.section as string | undefined
  if (section === 'movies' || section === 'series' || section === 'animation') {
    return section
  }
  return section === 'my-list' ? 'my-list' : 'home'
})

const isMyList = computed(() => sectionKey.value === 'my-list')
const searching = computed(() => debouncedQuery.value.trim().length > 0)

const section = computed(() =>
  isMyList.value ? undefined : catalogStore.sections[sectionKey.value as CatalogSectionKey],
)

const rows = computed(() => {
  if (isMyList.value) {
    return watchlistStore.items.length
      ? [{ id: 'my-list', label: 'Minha lista', items: watchlistStore.items }]
      : []
  }
  const baseRows = section.value?.rows ?? []
  if (sectionKey.value !== 'home') {
    return baseRows
  }
  const extraRows = []
  if (recentTitles.value.length) {
    extraRows.push({ id: 'recent', label: 'Assistidos recentemente', items: recentTitles.value })
  }
  if (watchlistStore.items.length) {
    extraRows.push({ id: 'my-list', label: 'Minha lista', items: watchlistStore.items })
  }
  return [...baseRows, ...extraRows]
})

const featured = computed(() => section.value?.featured ?? [])
const detailQuery = computed(() => parseTitleKey(route.query.title))
const heroPaused = computed(() => searching.value || detailQuery.value !== null)
const { hero, heroVisible } = useHeroRotation(featured, heroPaused)

function parseTitleKey(raw: unknown): { mediaType: MediaType; tmdbId: number } | null {
  if (typeof raw !== 'string') {
    return null
  }
  const [mediaType, idPart] = raw.split('-')
  const tmdbId = Number.parseInt(idPart ?? '', 10)
  if ((mediaType !== 'movie' && mediaType !== 'tv') || Number.isNaN(tmdbId)) {
    return null
  }
  return { mediaType, tmdbId }
}

function openTitle(item: TitleSummary): void {
  void router.push({ query: { ...route.query, title: `${item.mediaType}-${item.tmdbId}` } })
}

function closeDetail(): void {
  const { title: _title, ...rest } = route.query
  void router.push({ query: rest })
}

async function loadSection(): Promise<void> {
  if (!isMyList.value) {
    await catalogStore.fetchSection(sectionKey.value as CatalogSectionKey)
  }
}

async function loadProfileData(): Promise<void> {
  const profileId = profilesStore.activeProfileId
  if (!profileId) {
    return
  }
  await watchlistStore.fetch(profileId).catch(() => undefined)
  try {
    const entries = await historyApi.list(profileId)
    const seen = new Set<string>()
    recentTitles.value = entries
      .map((entry) => entry.title)
      .filter((title) => {
        const key = `${title.mediaType}-${title.tmdbId}`
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })
  } catch {
    recentTitles.value = []
  }
}

watch(sectionKey, () => {
  searchQuery.value = ''
  void loadSection()
})

watch(debouncedQuery, (query) => {
  void catalogStore.search(query)
})

onMounted(() => {
  void loadSection()
  void loadProfileData()
})
</script>

<template>
  <div class="min-h-screen animate-fade-in bg-background">
    <AppHeader v-model:search="searchQuery" />

    <!-- Busca -->
    <div v-if="searching" class="min-h-[60vh] animate-fade-in px-5 pt-10 pb-15 sm:px-14">
      <h2 class="mb-6 font-display text-[22px] font-bold text-foreground/85">
        Resultados para "{{ debouncedQuery.trim() }}"
      </h2>
      <LoadingSpinner v-if="catalogStore.searching" />
      <template v-else>
        <div class="flex flex-wrap gap-4">
          <TitleCard
            v-for="item in catalogStore.searchResults"
            :key="`${item.mediaType}-${item.tmdbId}`"
            :item="item"
            @open="openTitle"
          />
        </div>
        <p v-if="!catalogStore.searchResults.length" class="text-[15px] text-foreground/45">
          Nenhum título encontrado. Tente outra busca.
        </p>
      </template>
    </div>

    <template v-else>
      <!-- HERO -->
      <HeroBanner
        v-if="!isMyList && hero"
        :item="hero"
        :visible="heroVisible"
        @play="playTitle($event)"
        @details="openTitle"
      />

      <!-- Catálogo indisponível -->
      <div
        v-if="catalogStore.error && !isMyList"
        class="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <div class="size-4 rotate-45 rounded-[4px] bg-primary shadow-[0_0_24px_rgba(255,106,0,0.8)]" />
        <h2 class="m-0 font-display text-2xl font-bold">Catálogo indisponível</h2>
        <p class="m-0 max-w-[480px] text-[15px] leading-relaxed text-foreground/60">
          {{ catalogStore.error }}
        </p>
      </div>

      <LoadingSpinner v-else-if="catalogStore.loading && !section && !isMyList" />

      <!-- LINHAS -->
      <div v-else class="relative z-2 pt-2 pb-20">
        <TitleRow
          v-for="row in rows"
          :key="row.id"
          :label="row.label"
          :items="row.items"
          @open="openTitle"
        />
        <div v-if="isMyList && !rows.length" class="px-5 py-5 text-[14.5px] text-foreground/45 sm:px-14">
          Sua lista está vazia — toque em um título e use
          <span class="font-bold text-primary">+ Minha lista</span> para salvar.
        </div>
      </div>

      <AppFooter />
    </template>

    <TitleDetailModal
      v-if="detailQuery"
      :media-type="detailQuery.mediaType"
      :tmdb-id="detailQuery.tmdbId"
      @close="closeDetail"
      @open="openTitle"
    />
  </div>
</template>
