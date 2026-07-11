import { http } from './http'
import type { CatalogSection, MediaType, SeasonDetail, TitleDetail, TitleSummary } from '@/types/api'

export type CatalogSectionKey = 'home' | 'movies' | 'series' | 'animation'

export const catalogApi = {
  async getSection(section: CatalogSectionKey): Promise<CatalogSection> {
    const { data } = await http.get<CatalogSection>(`/catalog/${section}`)
    return data
  },

  async search(query: string): Promise<TitleSummary[]> {
    const { data } = await http.get<TitleSummary[]>('/catalog/search', { params: { query } })
    return data
  },

  async getDetail(mediaType: MediaType, tmdbId: number): Promise<TitleDetail> {
    const { data } = await http.get<TitleDetail>(`/catalog/${mediaType}/${tmdbId}`)
    return data
  },

  async getSeason(tmdbId: number, seasonNumber: number): Promise<SeasonDetail> {
    const { data } = await http.get<SeasonDetail>(`/catalog/tv/${tmdbId}/seasons/${seasonNumber}`)
    return data
  },
}
