import { http } from './http'
import type { MediaType, TitleSummary } from '@/types/api'

export const watchlistApi = {
  async list(profileId: string): Promise<TitleSummary[]> {
    const { data } = await http.get<TitleSummary[]>('/watchlist', { params: { profileId } })
    return data
  },

  async add(profileId: string, mediaType: MediaType, tmdbId: number): Promise<TitleSummary[]> {
    const { data } = await http.post<TitleSummary[]>('/watchlist', { profileId, mediaType, tmdbId })
    return data
  },

  async remove(profileId: string, mediaType: MediaType, tmdbId: number): Promise<TitleSummary[]> {
    const { data } = await http.delete<TitleSummary[]>(`/watchlist/${mediaType}/${tmdbId}`, {
      params: { profileId },
    })
    return data
  },
}
