import { defineStore } from 'pinia'

export interface PlaybackRequest {
  title: string
  trailerKey: string
  subtitle?: string
}

interface PlayerState {
  playback: PlaybackRequest | null
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    playback: null,
  }),

  actions: {
    play(playback: PlaybackRequest): void {
      this.playback = playback
    },

    close(): void {
      this.playback = null
    },
  },
})
