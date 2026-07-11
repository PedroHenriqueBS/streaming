import type { TitleDetail, TitleSummary } from '@/types/api'

export function formatRuntime(minutes: number | null): string {
  if (!minutes) {
    return ''
  }
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) {
    return `${rest}min`
  }
  return rest === 0 ? `${hours}h` : `${hours}h ${String(rest).padStart(2, '0')}min`
}

export function formatSeasonCount(count: number | null): string {
  if (!count) {
    return ''
  }
  return count === 1 ? '1 temporada' : `${count} temporadas`
}

export function formatDuration(title: Pick<TitleDetail, 'mediaType' | 'runtimeMinutes' | 'seasonCount'>): string {
  return title.mediaType === 'tv'
    ? formatSeasonCount(title.seasonCount)
    : formatRuntime(title.runtimeMinutes)
}

export function formatMeta(title: TitleSummary): string {
  return [title.year, title.genre].filter(Boolean).join(' · ')
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/** Card badge: "Novo" for current-year titles, otherwise the content kind. */
export function badgeOf(title: TitleSummary): { label: string; highlighted: boolean } {
  if (title.isNew) {
    return { label: 'Novo', highlighted: true }
  }
  if (title.isAnimation) {
    return { label: 'Desenho', highlighted: false }
  }
  return { label: title.mediaType === 'movie' ? 'Filme' : 'Série', highlighted: false }
}
