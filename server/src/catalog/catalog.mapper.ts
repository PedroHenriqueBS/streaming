import {
  TmdbEpisode,
  TmdbMediaDetail,
  TmdbMediaSummary,
  TmdbSeasonDetail,
  TmdbVideo,
} from './tmdb/tmdb.types';
import {
  ApiMediaType,
  Episode,
  SeasonDetail,
  TitleDetail,
  TitleSummary,
} from './types/catalog.types';

export const ANIMATION_GENRE_ID = 16;

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type GenreLookup = ReadonlyMap<number, string>;

export function buildImageUrl(
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original',
): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

function extractYear(raw: TmdbMediaSummary): number | null {
  const date = raw.release_date ?? raw.first_air_date ?? '';
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

function resolveMediaType(raw: TmdbMediaSummary, fallback?: ApiMediaType): ApiMediaType | null {
  if (raw.media_type === 'movie' || raw.media_type === 'tv') {
    return raw.media_type;
  }
  return fallback ?? null;
}

export function mapTitleSummary(
  raw: TmdbMediaSummary,
  genres: GenreLookup,
  fallbackMediaType?: ApiMediaType,
): TitleSummary | null {
  const mediaType = resolveMediaType(raw, fallbackMediaType);
  const title = raw.title ?? raw.name;
  if (!mediaType || !title || !raw.poster_path) {
    return null;
  }

  const genreIds = raw.genre_ids ?? [];
  const year = extractYear(raw);
  return {
    tmdbId: raw.id,
    mediaType,
    title,
    overview: raw.overview ?? '',
    posterUrl: buildImageUrl(raw.poster_path, 'w500'),
    backdropUrl: buildImageUrl(raw.backdrop_path, 'w1280'),
    year,
    rating: Math.round(raw.vote_average * 10) / 10,
    genre: genreIds.map((id) => genres.get(id)).find(Boolean) ?? '',
    isAnimation: genreIds.includes(ANIMATION_GENRE_ID),
    isNew: year !== null && year >= new Date().getFullYear(),
  };
}

export function mapTitleSummaries(
  results: TmdbMediaSummary[],
  genres: GenreLookup,
  fallbackMediaType?: ApiMediaType,
): TitleSummary[] {
  const summaries: TitleSummary[] = [];
  for (const raw of results) {
    const summary = mapTitleSummary(raw, genres, fallbackMediaType);
    if (summary) {
      summaries.push(summary);
    }
  }
  return summaries;
}

export function pickTrailerKey(videos: TmdbVideo[] | undefined): string | null {
  if (!videos?.length) {
    return null;
  }
  const youtube = videos.filter((video) => video.site === 'YouTube');
  const byPreference = (type: string, official: boolean) =>
    youtube
      .filter((video) => video.type === type && video.official === official)
      .sort((a, b) => b.published_at.localeCompare(a.published_at))[0];

  const trailer =
    byPreference('Trailer', true) ??
    byPreference('Trailer', false) ??
    byPreference('Teaser', true) ??
    byPreference('Teaser', false);
  return trailer?.key ?? null;
}

export function mapTitleDetail(
  raw: TmdbMediaDetail,
  genres: GenreLookup,
  mediaType: ApiMediaType,
): TitleDetail {
  const title = raw.title ?? raw.name ?? '';
  const year = extractYear(raw);
  const genreNames = raw.genres.map((genre) => genre.name);
  const runtimeMinutes = raw.runtime ?? raw.episode_run_time?.[0] ?? null;

  return {
    tmdbId: raw.id,
    mediaType,
    title,
    overview: raw.overview ?? '',
    posterUrl: buildImageUrl(raw.poster_path, 'w500'),
    backdropUrl: buildImageUrl(raw.backdrop_path, 'w1280'),
    year,
    rating: Math.round(raw.vote_average * 10) / 10,
    genre: genreNames[0] ?? '',
    isAnimation: raw.genres.some((genre) => genre.id === ANIMATION_GENRE_ID),
    isNew: year !== null && year >= new Date().getFullYear(),
    genres: genreNames,
    runtimeMinutes,
    seasonCount: raw.number_of_seasons ?? null,
    seasons: (raw.seasons ?? [])
      .filter((season) => season.season_number > 0 && season.episode_count > 0)
      .map((season) => ({
        number: season.season_number,
        name: season.name,
        episodeCount: season.episode_count,
      })),
    trailerKey: pickTrailerKey(raw.videos?.results),
    cast: (raw.credits?.cast ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .slice(0, 6)
      .map((member) => member.name),
    related: mapTitleSummaries(raw.similar?.results ?? [], genres, mediaType).slice(0, 10),
  };
}

export function mapEpisode(raw: TmdbEpisode): Episode {
  return {
    number: raw.episode_number,
    name: raw.name,
    overview: raw.overview ?? '',
    stillUrl: buildImageUrl(raw.still_path, 'w300'),
    runtimeMinutes: raw.runtime ?? null,
  };
}

export function mapSeasonDetail(raw: TmdbSeasonDetail): SeasonDetail {
  return {
    number: raw.season_number,
    name: raw.name,
    episodes: raw.episodes.map(mapEpisode),
  };
}
