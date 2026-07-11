export type ApiMediaType = 'movie' | 'tv';

export interface TitleSummary {
  tmdbId: number;
  mediaType: ApiMediaType;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  year: number | null;
  rating: number;
  genre: string;
  isAnimation: boolean;
  isNew: boolean;
}

export interface CatalogRow {
  id: string;
  label: string;
  items: TitleSummary[];
}

export interface CatalogSection {
  featured: TitleSummary[];
  rows: CatalogRow[];
}

export interface SeasonSummary {
  number: number;
  name: string;
  episodeCount: number;
}

export interface TitleDetail extends TitleSummary {
  genres: string[];
  runtimeMinutes: number | null;
  seasonCount: number | null;
  seasons: SeasonSummary[];
  trailerKey: string | null;
  cast: string[];
  related: TitleSummary[];
}

export interface Episode {
  number: number;
  name: string;
  overview: string;
  stillUrl: string | null;
  runtimeMinutes: number | null;
}

export interface SeasonDetail {
  number: number;
  name: string;
  episodes: Episode[];
}
