import { defineStore } from 'pinia'
import { catalogApi, type CatalogSectionKey } from '@/api/catalog.api'
import type { CatalogSection, TitleSummary } from '@/types/api'

interface CatalogState {
  sections: Partial<Record<CatalogSectionKey, CatalogSection>>
  loading: boolean
  error: string | null
  searchResults: TitleSummary[]
  searching: boolean
}

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogState => ({
    sections: {},
    loading: false,
    error: null,
    searchResults: [],
    searching: false,
  }),

  actions: {
    async fetchSection(key: CatalogSectionKey): Promise<void> {
      if (this.sections[key]) {
        return
      }
      this.loading = true
      this.error = null
      try {
        this.sections[key] = await catalogApi.getSection(key)
      } catch (error) {
        this.error =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Não foi possível carregar o catálogo agora.'
      } finally {
        this.loading = false
      }
    },

    async search(query: string): Promise<void> {
      const trimmed = query.trim()
      if (!trimmed) {
        this.searchResults = []
        return
      }
      this.searching = true
      try {
        this.searchResults = await catalogApi.search(trimmed)
      } finally {
        this.searching = false
      }
    },
  },
})
