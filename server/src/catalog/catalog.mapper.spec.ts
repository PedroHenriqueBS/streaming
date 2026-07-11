import { mapTitleDetail, mapTitleSummary, pickTrailerKey } from './catalog.mapper';
import { TmdbMediaDetail, TmdbMediaSummary, TmdbVideo } from './tmdb/tmdb.types';

const GENRES = new Map<number, string>([
  [28, 'Ação'],
  [16, 'Animação'],
]);

function rawSummary(overrides: Partial<TmdbMediaSummary> = {}): TmdbMediaSummary {
  return {
    id: 42,
    media_type: 'movie',
    title: 'A Última Fronteira',
    overview: 'Um piloto de resgate cruza uma zona proibida.',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2024-03-01',
    vote_average: 8.66,
    genre_ids: [28],
    popularity: 100,
    ...overrides,
  };
}

describe('mapTitleSummary', () => {
  it('maps a movie with image urls, rounded rating and primary genre', () => {
    const summary = mapTitleSummary(rawSummary(), GENRES);

    expect(summary).toEqual({
      tmdbId: 42,
      mediaType: 'movie',
      title: 'A Última Fronteira',
      overview: 'Um piloto de resgate cruza uma zona proibida.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
      year: 2024,
      rating: 8.7,
      genre: 'Ação',
      isAnimation: false,
      isNew: false,
    });
  });

  it('uses the fallback media type for endpoints without media_type', () => {
    const summary = mapTitleSummary(
      rawSummary({ media_type: undefined, title: undefined, name: 'Protocolo Zero' }),
      GENRES,
      'tv',
    );
    expect(summary?.mediaType).toBe('tv');
    expect(summary?.title).toBe('Protocolo Zero');
  });

  it('discards people and titles without poster', () => {
    expect(mapTitleSummary(rawSummary({ media_type: 'person' }), GENRES)).toBeNull();
    expect(mapTitleSummary(rawSummary({ poster_path: null }), GENRES)).toBeNull();
  });

  it('flags animation and current-year releases', () => {
    const currentYear = new Date().getFullYear();
    const summary = mapTitleSummary(
      rawSummary({ genre_ids: [16], release_date: `${currentYear}-01-10` }),
      GENRES,
    );
    expect(summary?.isAnimation).toBe(true);
    expect(summary?.isNew).toBe(true);
  });
});

describe('pickTrailerKey', () => {
  function video(overrides: Partial<TmdbVideo>): TmdbVideo {
    return {
      key: 'key',
      site: 'YouTube',
      type: 'Trailer',
      official: true,
      published_at: '2024-01-01T00:00:00Z',
      ...overrides,
    };
  }

  it('prefers official trailers, then any trailer, then teasers', () => {
    const videos = [
      video({ key: 'teaser', type: 'Teaser', official: false }),
      video({ key: 'unofficial-trailer', official: false }),
      video({ key: 'official-trailer' }),
    ];
    expect(pickTrailerKey(videos)).toBe('official-trailer');
    expect(pickTrailerKey(videos.slice(0, 2))).toBe('unofficial-trailer');
    expect(pickTrailerKey(videos.slice(0, 1))).toBe('teaser');
  });

  it('ignores non-YouTube videos and handles empty lists', () => {
    expect(pickTrailerKey([video({ site: 'Vimeo' })])).toBeNull();
    expect(pickTrailerKey([])).toBeNull();
    expect(pickTrailerKey(undefined)).toBeNull();
  });

  it('picks the most recent among equals', () => {
    const videos = [
      video({ key: 'older', published_at: '2023-01-01T00:00:00Z' }),
      video({ key: 'newer', published_at: '2025-01-01T00:00:00Z' }),
    ];
    expect(pickTrailerKey(videos)).toBe('newer');
  });
});

describe('mapTitleDetail', () => {
  it('maps a tv detail with seasons, cast and related titles', () => {
    const raw: TmdbMediaDetail = {
      ...rawSummary({ media_type: 'tv', title: undefined, name: 'Protocolo Zero' }),
      genres: [{ id: 28, name: 'Ação' }],
      number_of_seasons: 2,
      episode_run_time: [52],
      seasons: [
        { season_number: 0, name: 'Especiais', episode_count: 3, poster_path: null, air_date: null },
        { season_number: 1, name: 'Temporada 1', episode_count: 8, poster_path: null, air_date: null },
        { season_number: 2, name: 'Temporada 2', episode_count: 0, poster_path: null, air_date: null },
      ],
      videos: { results: [] },
      similar: {
        page: 1,
        total_pages: 1,
        total_results: 1,
        // /tv/{id}/similar results carry no media_type — the fallback applies
        results: [rawSummary({ id: 7, media_type: undefined })],
      },
      credits: {
        cast: [
          { name: 'Atriz B', character: 'B', order: 1 },
          { name: 'Ator A', character: 'A', order: 0 },
        ],
      },
    };

    const detail = mapTitleDetail(raw, GENRES, 'tv');

    expect(detail.seasonCount).toBe(2);
    expect(detail.runtimeMinutes).toBe(52);
    // specials (season 0) and empty seasons are hidden
    expect(detail.seasons).toEqual([{ number: 1, name: 'Temporada 1', episodeCount: 8 }]);
    expect(detail.cast).toEqual(['Ator A', 'Atriz B']);
    expect(detail.trailerKey).toBeNull();
    expect(detail.related).toHaveLength(1);
    expect(detail.related[0].mediaType).toBe('tv');
  });
});
