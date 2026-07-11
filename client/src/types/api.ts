export type MediaType = 'movie' | 'tv'

export type Plan = 'BASIC' | 'STANDARD' | 'PREMIUM'

export type VideoQuality = 'HD' | 'FULL_HD' | 'UHD_4K'

export interface AccountUser {
  id: string
  name: string
  email: string
  plan: Plan
}

export interface AuthResponse {
  user: AccountUser
  accessToken: string
}

export interface UserPreferences {
  autoplay: boolean
  previews: boolean
  subtitles: boolean
  releaseNotifications: boolean
  videoQuality: VideoQuality
}

export interface Account extends AccountUser {
  preferences: UserPreferences
}

export interface Profile {
  id: string
  name: string
  avatarHue: number
}

export interface TitleSummary {
  tmdbId: number
  mediaType: MediaType
  title: string
  overview: string
  posterUrl: string | null
  backdropUrl: string | null
  year: number | null
  rating: number
  genre: string
  isAnimation: boolean
  isNew: boolean
}

export interface CatalogRow {
  id: string
  label: string
  items: TitleSummary[]
}

export interface CatalogSection {
  featured: TitleSummary[]
  rows: CatalogRow[]
}

export interface SeasonSummary {
  number: number
  name: string
  episodeCount: number
}

export interface TitleDetail extends TitleSummary {
  genres: string[]
  runtimeMinutes: number | null
  seasonCount: number | null
  seasons: SeasonSummary[]
  trailerKey: string | null
  cast: string[]
  related: TitleSummary[]
}

export interface Episode {
  number: number
  name: string
  overview: string
  stillUrl: string | null
  runtimeMinutes: number | null
}

export interface SeasonDetail {
  number: number
  name: string
  episodes: Episode[]
}

export interface HistoryEntry {
  title: TitleSummary
  seasonNumber: number | null
  episodeNumber: number | null
  watchedAt: string
}
