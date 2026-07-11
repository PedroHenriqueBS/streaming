import { http } from './http'
import type { HistoryEntry, MediaType } from '@/types/api'

export const historyApi = {
  async list(profileId: string): Promise<HistoryEntry[]> {
    const { data } = await http.get<HistoryEntry[]>('/history', { params: { profileId } })
    return data
  },

  async record(payload: {
    profileId: string
    mediaType: MediaType
    tmdbId: number
    seasonNumber?: number
    episodeNumber?: number
  }): Promise<void> {
    await http.post('/history', payload)
  },
}
