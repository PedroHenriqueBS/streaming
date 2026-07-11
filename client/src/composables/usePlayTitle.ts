import { catalogApi } from '@/api/catalog.api'
import { historyApi } from '@/api/history.api'
import { usePlayerStore } from '@/stores/player.store'
import { useProfilesStore } from '@/stores/profiles.store'
import { useToast } from './useToast'
import type { TitleDetail, TitleSummary } from '@/types/api'

interface PlayOptions {
  seasonNumber?: number
  episodeNumber?: number
  subtitle?: string
}

/**
 * Opens the trailer player for a title (fetching its detail when needed) and
 * records the playback in the profile's watch history.
 */
export function usePlayTitle() {
  const playerStore = usePlayerStore()
  const profilesStore = useProfilesStore()
  const { showToast } = useToast()

  async function playTitle(item: TitleSummary | TitleDetail, options: PlayOptions = {}): Promise<void> {
    try {
      const detail: TitleDetail =
        'trailerKey' in item ? item : await catalogApi.getDetail(item.mediaType, item.tmdbId)

      if (!detail.trailerKey) {
        showToast('Trailer indisponível para este título.')
        return
      }

      playerStore.play({
        title: detail.title,
        trailerKey: detail.trailerKey,
        subtitle: options.subtitle,
      })

      const profileId = profilesStore.activeProfileId
      if (profileId) {
        void historyApi
          .record({
            profileId,
            mediaType: detail.mediaType,
            tmdbId: detail.tmdbId,
            seasonNumber: options.seasonNumber,
            episodeNumber: options.episodeNumber,
          })
          .catch(() => {
            /* histórico é melhor-esforço; não bloqueia a reprodução */
          })
      }
    } catch {
      showToast('Não foi possível iniciar a reprodução.')
    }
  }

  return { playTitle }
}
