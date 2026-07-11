import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import {
  ANIMATION_GENRE_ID,
  buildImageUrl,
  GenreLookup,
  mapSeasonDetail,
  mapTitleDetail,
  mapTitleSummaries,
} from './catalog.mapper';
import { TmdbClient } from './tmdb/tmdb-client';
import {
  TmdbMediaDetail,
  TmdbMediaSummary,
  TmdbPaginatedResponse,
  TmdbSeasonDetail,
} from './tmdb/tmdb.types';
import {
  ApiMediaType,
  CatalogRow,
  CatalogSection,
  SeasonDetail,
  TitleDetail,
  TitleSummary,
} from './types/catalog.types';
import { MediaType } from '../generated/prisma/enums';
import type { Prisma } from '../generated/prisma/client';

const CACHE_TTL_MS = 30 * 60 * 1000;
const FEATURED_COUNT = 5;

type TitleWithGenres = Prisma.TitleGetPayload<{ include: { genres: true } }>;

@Injectable()
export class CatalogService {
  constructor(
    private readonly tmdb: TmdbClient,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  getHome(): Promise<CatalogSection> {
    return this.cached('catalog:home', async () => {
      const genres = await this.genreLookup();
      const [trending, nowPlaying, onTheAir, popularMovies, popularSeries, animation] =
        await Promise.all([
          this.fetchList('/trending/all/week'),
          this.fetchList('/movie/now_playing'),
          this.fetchList('/tv/on_the_air'),
          this.fetchList('/movie/popular'),
          this.fetchList('/tv/popular'),
          this.fetchAnimation(),
        ]);

      const releases = this.interleave(
        mapTitleSummaries(nowPlaying, genres, 'movie'),
        mapTitleSummaries(onTheAir, genres, 'tv'),
      );

      return this.buildSection([
        ['trending', 'Em alta agora', mapTitleSummaries(trending, genres)],
        ['releases', 'Lançamentos', releases],
        ['movies', 'Filmes populares', mapTitleSummaries(popularMovies, genres, 'movie')],
        ['series', 'Séries populares', mapTitleSummaries(popularSeries, genres, 'tv')],
        ['animation', 'Desenhos e animação', animation],
      ]);
    });
  }

  getMovies(): Promise<CatalogSection> {
    return this.cached('catalog:movies', async () => {
      const genres = await this.genreLookup();
      const [trending, nowPlaying, popular, topRated] = await Promise.all([
        this.fetchList('/trending/movie/week'),
        this.fetchList('/movie/now_playing'),
        this.fetchList('/movie/popular'),
        this.fetchList('/movie/top_rated'),
      ]);
      return this.buildSection([
        ['trending', 'Filmes em alta', mapTitleSummaries(trending, genres, 'movie')],
        ['releases', 'Lançamentos', mapTitleSummaries(nowPlaying, genres, 'movie')],
        ['popular', 'Populares', mapTitleSummaries(popular, genres, 'movie')],
        ['top-rated', 'Bem avaliados', mapTitleSummaries(topRated, genres, 'movie')],
      ]);
    });
  }

  getSeries(): Promise<CatalogSection> {
    return this.cached('catalog:series', async () => {
      const genres = await this.genreLookup();
      const [trending, onTheAir, popular, topRated] = await Promise.all([
        this.fetchList('/trending/tv/week'),
        this.fetchList('/tv/on_the_air'),
        this.fetchList('/tv/popular'),
        this.fetchList('/tv/top_rated'),
      ]);
      return this.buildSection([
        ['trending', 'Séries em alta', mapTitleSummaries(trending, genres, 'tv')],
        ['releases', 'Lançamentos', mapTitleSummaries(onTheAir, genres, 'tv')],
        ['popular', 'Populares', mapTitleSummaries(popular, genres, 'tv')],
        ['top-rated', 'Bem avaliadas', mapTitleSummaries(topRated, genres, 'tv')],
      ]);
    });
  }

  getAnimation(): Promise<CatalogSection> {
    return this.cached('catalog:animation', async () => {
      const genres = await this.genreLookup();
      const [movies, series, topRatedMovies, family] = await Promise.all([
        this.fetchList('/discover/movie', {
          with_genres: ANIMATION_GENRE_ID,
          sort_by: 'popularity.desc',
        }),
        this.fetchList('/discover/tv', {
          with_genres: ANIMATION_GENRE_ID,
          sort_by: 'popularity.desc',
        }),
        this.fetchList('/discover/movie', {
          with_genres: ANIMATION_GENRE_ID,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 300,
        }),
        this.fetchList('/discover/movie', {
          with_genres: `${ANIMATION_GENRE_ID},10751`,
          sort_by: 'popularity.desc',
        }),
      ]);
      const trending = this.interleave(
        mapTitleSummaries(movies, genres, 'movie'),
        mapTitleSummaries(series, genres, 'tv'),
      );
      return this.buildSection([
        ['trending', 'Desenhos em alta', trending],
        ['movies', 'Filmes de animação', mapTitleSummaries(movies, genres, 'movie')],
        ['series', 'Séries animadas', mapTitleSummaries(series, genres, 'tv')],
        ['family', 'Para toda a família', mapTitleSummaries(family, genres, 'movie')],
        ['top-rated', 'Bem avaliados', mapTitleSummaries(topRatedMovies, genres, 'movie')],
      ]);
    });
  }

  async search(query: string): Promise<TitleSummary[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }
    return this.cached(`catalog:search:${trimmed.toLowerCase()}`, async () => {
      const genres = await this.genreLookup();
      const response = await this.tmdb.get<TmdbPaginatedResponse<TmdbMediaSummary>>(
        '/search/multi',
        { query: trimmed, include_adult: 'false' },
      );
      return mapTitleSummaries(response.results, genres);
    });
  }

  getDetail(mediaType: ApiMediaType, tmdbId: number): Promise<TitleDetail> {
    return this.cached(`catalog:detail:${mediaType}:${tmdbId}`, async () => {
      const genres = await this.genreLookup();
      const raw = await this.tmdb.get<TmdbMediaDetail>(`/${mediaType}/${tmdbId}`, {
        append_to_response: 'videos,similar,credits',
        include_video_language: 'pt,en',
      });
      return mapTitleDetail(raw, genres, mediaType);
    });
  }

  getSeason(tmdbId: number, seasonNumber: number): Promise<SeasonDetail> {
    return this.cached(`catalog:season:${tmdbId}:${seasonNumber}`, async () => {
      const raw = await this.tmdb.get<TmdbSeasonDetail>(`/tv/${tmdbId}/season/${seasonNumber}`);
      return mapSeasonDetail(raw);
    });
  }

  /**
   * Persists a TMDB title locally so watchlist/history rows survive without
   * depending on the TMDB API. Returns the local Title id.
   */
  async ensureTitleCached(mediaType: ApiMediaType, tmdbId: number): Promise<string> {
    const dbMediaType = mediaType === 'movie' ? MediaType.MOVIE : MediaType.TV;
    const detail = await this.getDetail(mediaType, tmdbId);

    const genreConnections = await this.prisma.genre.findMany({
      where: { name: { in: detail.genres } },
      select: { id: true },
    });

    const data = {
      name: detail.title,
      overview: detail.overview,
      posterPath: this.stripImageBase(detail.posterUrl),
      backdropPath: this.stripImageBase(detail.backdropUrl),
      releaseYear: detail.year,
      runtimeMinutes: detail.runtimeMinutes,
      seasonCount: detail.seasonCount,
      voteAverage: detail.rating,
      isAnimation: detail.isAnimation,
      syncedAt: new Date(),
      genres: { set: [], connect: genreConnections },
    };

    const title = await this.prisma.title.upsert({
      where: { tmdbId_mediaType: { tmdbId, mediaType: dbMediaType } },
      update: data,
      create: {
        tmdbId,
        mediaType: dbMediaType,
        ...data,
        genres: { connect: genreConnections },
      },
    });
    return title.id;
  }

  mapStoredTitle(title: TitleWithGenres): TitleSummary {
    return {
      tmdbId: title.tmdbId,
      mediaType: title.mediaType === MediaType.MOVIE ? 'movie' : 'tv',
      title: title.name,
      overview: title.overview,
      posterUrl: buildImageUrl(title.posterPath, 'w500'),
      backdropUrl: buildImageUrl(title.backdropPath, 'w1280'),
      year: title.releaseYear,
      rating: Number(title.voteAverage),
      genre: title.genres[0]?.name ?? '',
      isAnimation: title.isAnimation,
      isNew: title.releaseYear !== null && title.releaseYear >= new Date().getFullYear(),
    };
  }

  private async fetchList(
    path: string,
    params: Record<string, string | number> = {},
  ): Promise<TmdbMediaSummary[]> {
    const response = await this.tmdb.get<TmdbPaginatedResponse<TmdbMediaSummary>>(path, params);
    return response.results;
  }

  private async fetchAnimation(): Promise<TitleSummary[]> {
    const genres = await this.genreLookup();
    const [movies, series] = await Promise.all([
      this.fetchList('/discover/movie', {
        with_genres: ANIMATION_GENRE_ID,
        sort_by: 'popularity.desc',
      }),
      this.fetchList('/discover/tv', {
        with_genres: ANIMATION_GENRE_ID,
        sort_by: 'popularity.desc',
      }),
    ]);
    return this.interleave(
      mapTitleSummaries(movies, genres, 'movie'),
      mapTitleSummaries(series, genres, 'tv'),
    );
  }

  private buildSection(rowsInput: [string, string, TitleSummary[]][]): CatalogSection {
    const rows: CatalogRow[] = rowsInput
      .map(([id, label, items]) => ({ id, label, items: this.dedupe(items) }))
      .filter((row) => row.items.length > 0);
    const featured = (rows[0]?.items ?? [])
      .filter((item) => item.backdropUrl && item.overview)
      .slice(0, FEATURED_COUNT);
    return { featured, rows };
  }

  private dedupe(items: TitleSummary[]): TitleSummary[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.mediaType}:${item.tmdbId}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private interleave(first: TitleSummary[], second: TitleSummary[]): TitleSummary[] {
    const merged: TitleSummary[] = [];
    const max = Math.max(first.length, second.length);
    for (let index = 0; index < max; index += 1) {
      if (first[index]) {
        merged.push(first[index]);
      }
      if (second[index]) {
        merged.push(second[index]);
      }
    }
    return merged;
  }

  private stripImageBase(url: string | null): string | null {
    if (!url) {
      return null;
    }
    const lastSlash = url.lastIndexOf('/');
    return lastSlash >= 0 ? url.slice(lastSlash) : url;
  }

  private async genreLookup(): Promise<GenreLookup> {
    return this.cached('catalog:genres', async () => {
      const genres = await this.prisma.genre.findMany();
      return new Map(genres.map((genre) => [genre.tmdbId, genre.name]));
    });
  }

  private async cached<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const hit = await this.cache.get<T>(key);
    if (hit !== undefined && hit !== null) {
      return hit;
    }
    const value = await factory();
    await this.cache.set(key, value, CACHE_TTL_MS);
    return value;
  }
}
