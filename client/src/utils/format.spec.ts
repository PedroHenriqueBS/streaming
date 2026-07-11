import { badgeOf, formatDuration, formatMeta, formatRuntime, formatSeasonCount } from './format'
import type { TitleSummary } from '@/types/api'

function summary(overrides: Partial<TitleSummary> = {}): TitleSummary {
  return {
    tmdbId: 1,
    mediaType: 'movie',
    title: 'Vertigem',
    overview: '',
    posterUrl: null,
    backdropUrl: null,
    year: 2024,
    rating: 9,
    genre: 'Ficção científica',
    isAnimation: false,
    isNew: false,
    ...overrides,
  }
}

describe('formatRuntime', () => {
  it('formats hours and minutes like the design (2h 14min)', () => {
    expect(formatRuntime(134)).toBe('2h 14min')
    expect(formatRuntime(120)).toBe('2h')
    expect(formatRuntime(45)).toBe('45min')
    expect(formatRuntime(125)).toBe('2h 05min')
  })

  it('is empty for unknown runtimes', () => {
    expect(formatRuntime(null)).toBe('')
    expect(formatRuntime(0)).toBe('')
  })
})

describe('formatSeasonCount / formatDuration', () => {
  it('pluralizes seasons', () => {
    expect(formatSeasonCount(1)).toBe('1 temporada')
    expect(formatSeasonCount(3)).toBe('3 temporadas')
  })

  it('picks seasons for tv and runtime for movies', () => {
    expect(formatDuration({ mediaType: 'tv', runtimeMinutes: 52, seasonCount: 2 })).toBe(
      '2 temporadas',
    )
    expect(formatDuration({ mediaType: 'movie', runtimeMinutes: 134, seasonCount: null })).toBe(
      '2h 14min',
    )
  })
})

describe('formatMeta', () => {
  it('joins year and genre with a separator', () => {
    expect(formatMeta(summary())).toBe('2024 · Ficção científica')
  })

  it('omits missing pieces', () => {
    expect(formatMeta(summary({ year: null }))).toBe('Ficção científica')
    expect(formatMeta(summary({ genre: '' }))).toBe('2024')
  })
})

describe('badgeOf', () => {
  it('highlights current-year releases as "Novo"', () => {
    expect(badgeOf(summary({ isNew: true }))).toEqual({ label: 'Novo', highlighted: true })
  })

  it('labels animation, movies and series', () => {
    expect(badgeOf(summary({ isAnimation: true })).label).toBe('Desenho')
    expect(badgeOf(summary()).label).toBe('Filme')
    expect(badgeOf(summary({ mediaType: 'tv' })).label).toBe('Série')
  })
})
