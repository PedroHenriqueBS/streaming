export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMediaSummary {
  id: number;
  media_type?: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  popularity: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TmdbCastMember {
  name: string;
  character: string;
  order: number;
}

export interface TmdbSeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface TmdbMediaDetail extends TmdbMediaSummary {
  genres: TmdbGenre[];
  runtime?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
  seasons?: TmdbSeasonSummary[];
  videos?: { results: TmdbVideo[] };
  similar?: TmdbPaginatedResponse<TmdbMediaSummary>;
  credits?: { cast: TmdbCastMember[] };
}

export interface TmdbEpisode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
  air_date: string | null;
}

export interface TmdbSeasonDetail {
  season_number: number;
  name: string;
  episodes: TmdbEpisode[];
}
