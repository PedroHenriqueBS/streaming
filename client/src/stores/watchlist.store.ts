import { defineStore } from 'pinia'
import { watchlistApi } from '@/api/watchlist.api'
import type { MediaType, TitleSummary } from '@/types/api'

interface WatchlistState {
  items: TitleSummary[]
  loaded: boolean
}

export const useWatchlistStore = defineStore('watchlist', {
  state: (): WatchlistState => ({
    items: [],
    loaded: false,
  }),

  getters: {
    has: (state) => (mediaType: MediaType, tmdbId: number) =>
      state.items.some((item) => item.mediaType === mediaType && item.tmdbId === tmdbId),
  },

  actions: {
    async fetch(profileId: string): Promise<void> {
      this.items = await watchlistApi.list(profileId)
      this.loaded = true
    },

    /** Returns true when the title ended up added, false when removed. */
    async toggle(profileId: string, title: TitleSummary): Promise<boolean> {
      const exists = this.has(title.mediaType, title.tmdbId)
      this.items = exists
        ? await watchlistApi.remove(profileId, title.mediaType, title.tmdbId)
        : await watchlistApi.add(profileId, title.mediaType, title.tmdbId)
      return !exists
    },

    reset(): void {
      this.items = []
      this.loaded = false
    },
  },
})
