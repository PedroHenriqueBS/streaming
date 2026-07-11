<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EpisodeListItem from './EpisodeListItem.vue'
import TitleCard from '@/components/catalog/TitleCard.vue'
import { catalogApi } from '@/api/catalog.api'
import { extractErrorMessage } from '@/api/http'
import { usePlayTitle } from '@/composables/usePlayTitle'
import { useToast } from '@/composables/useToast'
import { useProfilesStore } from '@/stores/profiles.store'
import { useWatchlistStore } from '@/stores/watchlist.store'
import { formatDuration, formatRating } from '@/utils/format'
import { heroGradient } from '@/utils/gradients'
import type { Episode, MediaType, TitleDetail, TitleSummary } from '@/types/api'

const props = defineProps<{
  mediaType: MediaType
  tmdbId: number
}>()

const emit = defineEmits<{
  close: []
  open: [item: TitleSummary]
}>()

const profilesStore = useProfilesStore()
const watchlistStore = useWatchlistStore()
const { playTitle } = usePlayTitle()
const { showToast } = useToast()

const detail = ref<TitleDetail | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const selectedSeason = ref(1)
const episodes = ref<Episode[]>([])
const episodesLoading = ref(false)

const inWatchlist = computed(
  () => detail.value !== null && watchlistStore.has(detail.value.mediaType, detail.value.tmdbId),
)

const typeTag = computed(() => {
  if (!detail.value) {
    return ''
  }
  if (detail.value.isAnimation) {
    return 'Desenho'
  }
  return detail.value.mediaType === 'movie' ? 'Filme' : 'Série'
})

watch(
  () => [props.mediaType, props.tmdbId] as const,
  async () => {
    loading.value = true
    errorMessage.value = ''
    detail.value = null
    episodes.value = []
    try {
      detail.value = await catalogApi.getDetail(props.mediaType, props.tmdbId)
      selectedSeason.value = detail.value.seasons[0]?.number ?? 1
      if (detail.value.mediaType === 'tv' && detail.value.seasons.length) {
        await loadSeason(selectedSeason.value)
      }
    } catch (error) {
      errorMessage.value = extractErrorMessage(error, 'Não foi possível carregar este título.')
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

async function loadSeason(seasonNumber: number): Promise<void> {
  if (!detail.value) {
    return
  }
  selectedSeason.value = seasonNumber
  episodesLoading.value = true
  try {
    const season = await catalogApi.getSeason(detail.value.tmdbId, seasonNumber)
    episodes.value = season.episodes
  } finally {
    episodesLoading.value = false
  }
}

async function toggleWatchlist(): Promise<void> {
  if (!detail.value || !profilesStore.activeProfileId) {
    return
  }
  try {
    const added = await watchlistStore.toggle(profilesStore.activeProfileId, detail.value)
    showToast(added ? 'Adicionado à sua lista' : 'Removido da sua lista')
  } catch (error) {
    showToast(extractErrorMessage(error, 'Não foi possível atualizar sua lista.'))
  }
}

function playEpisode(episode: Episode): void {
  if (!detail.value) {
    return
  }
  void playTitle(detail.value, {
    seasonNumber: selectedSeason.value,
    episodeNumber: episode.number,
    subtitle: `T${selectedSeason.value} E${episode.number} — ${episode.name}`,
  })
}
</script>

<template>
  <BaseModal @close="emit('close')">
    <LoadingSpinner v-if="loading" />

    <div v-else-if="errorMessage" class="p-11 text-center text-foreground/60">
      {{ errorMessage }}
    </div>

    <template v-else-if="detail">
      <div
        class="relative flex h-[360px] items-end"
        :style="{ background: heroGradient((detail.tmdbId * 53) % 360) }"
      >
        <img
          v-if="detail.backdropUrl"
          :src="detail.backdropUrl"
          :alt="detail.title"
          class="absolute inset-0 size-full object-cover"
        >
        <div
          class="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(19,17,16,0.95)_96%)]"
        />
        <button
          type="button"
          class="absolute top-4.5 right-4.5 flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[rgba(11,10,9,0.6)] text-base text-foreground backdrop-blur-lg transition-all duration-200 hover:rotate-90 hover:bg-primary hover:text-on-primary"
          @click="emit('close')"
        >
          ✕
        </button>
        <div class="relative px-6 pb-7 sm:px-11">
          <span
            class="mb-2.5 inline-block text-[11.5px] font-extrabold tracking-[2.5px] text-primary uppercase"
          >
            {{ typeTag }}
          </span>
          <h1
            class="m-0 font-display text-[clamp(30px,4.4vw,52px)] leading-none font-extrabold tracking-[-1px]"
          >
            {{ detail.title }}
          </h1>
        </div>
      </div>

      <div class="px-6 pt-6.5 pb-10 sm:px-11">
        <div class="mb-4.5 flex flex-wrap items-center gap-3 text-[13.5px] font-bold">
          <span v-if="detail.rating > 0" class="text-star">★ {{ formatRating(detail.rating) }}</span>
          <span v-if="detail.year" class="rounded-md bg-white/5 px-2.5 py-1 text-foreground/75">
            {{ detail.year }}
          </span>
          <span
            v-if="formatDuration(detail)"
            class="rounded-md bg-white/5 px-2.5 py-1 text-foreground/75"
          >
            {{ formatDuration(detail) }}
          </span>
          <span
            v-for="genre in detail.genres.slice(0, 3)"
            :key="genre"
            class="rounded-md bg-primary/15 px-2.5 py-1 text-primary-soft"
          >
            {{ genre }}
          </span>
        </div>

        <p
          class="m-0 mb-4 max-w-[640px] text-base leading-[1.6] text-foreground/80 [text-wrap:pretty]"
        >
          {{ detail.overview || 'Sem sinopse disponível.' }}
        </p>

        <p v-if="detail.cast.length" class="m-0 mb-6.5 text-[13.5px] text-foreground/50">
          <span class="font-bold text-foreground/70">Elenco:</span> {{ detail.cast.join(', ') }}
        </p>

        <div class="mb-9 flex gap-3">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-2.5 rounded-[11px] bg-primary px-7.5 py-3.5 font-display text-[15px] font-bold text-on-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_12px_30px_rgba(255,106,0,0.35)]"
            @click="playTitle(detail)"
          >
            <span class="text-xs">▶</span> Assistir
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-2.5 rounded-[11px] border px-6.5 py-3.5 font-display text-[15px] font-semibold transition-all duration-200 hover:border-primary"
            :class="
              inWatchlist
                ? 'border-primary bg-primary/15 text-primary-soft'
                : 'border-white/20 bg-white/5 text-foreground'
            "
            @click="toggleWatchlist"
          >
            {{ inWatchlist ? '✓ Na minha lista' : '+ Minha lista' }}
          </button>
        </div>

        <div v-if="detail.mediaType === 'tv' && detail.seasons.length" class="mb-9.5">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 class="m-0 font-display text-base font-bold text-foreground/85">Episódios</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="season in detail.seasons"
                :key="season.number"
                type="button"
                class="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-200 hover:border-primary"
                :class="
                  selectedSeason === season.number
                    ? 'border-primary bg-primary/15 text-primary-soft'
                    : 'border-white/15 bg-transparent text-foreground/60'
                "
                @click="loadSeason(season.number)"
              >
                Temporada {{ season.number }}
              </button>
            </div>
          </div>
          <LoadingSpinner v-if="episodesLoading" />
          <div v-else class="flex flex-col gap-1.5">
            <EpisodeListItem
              v-for="episode in episodes"
              :key="episode.number"
              :episode="episode"
              :seed-hue="(detail.tmdbId * 53) % 360"
              @play="playEpisode"
            />
          </div>
        </div>

        <template v-if="detail.related.length">
          <h3 class="m-0 mb-3.5 font-display text-base font-bold text-foreground/85">
            Títulos parecidos
          </h3>
          <div class="-mx-1 -mt-3.5 -mb-2 flex gap-3 overflow-x-auto px-1 py-3.5 pb-4">
            <TitleCard
              v-for="related in detail.related"
              :key="`${related.mediaType}-${related.tmdbId}`"
              :item="related"
              class="!w-[138px]"
              @open="emit('open', $event)"
            />
          </div>
        </template>
      </div>
    </template>
  </BaseModal>
</template>
