import { mount } from '@vue/test-utils'
import TitleCard from './TitleCard.vue'
import type { TitleSummary } from '@/types/api'

function title(overrides: Partial<TitleSummary> = {}): TitleSummary {
  return {
    tmdbId: 42,
    mediaType: 'movie',
    title: 'A Última Fronteira',
    overview: '',
    posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    backdropUrl: null,
    year: 2026,
    rating: 8.7,
    genre: 'Ação',
    isAnimation: false,
    isNew: false,
    ...overrides,
  }
}

describe('TitleCard', () => {
  it('renders title, poster, meta, badge and rating', () => {
    const wrapper = mount(TitleCard, { props: { item: title() } })

    // uppercase é aplicado via CSS; o texto do DOM permanece original
    expect(wrapper.text()).toContain('A Última Fronteira')
    expect(wrapper.text()).toContain('2026 · Ação')
    expect(wrapper.text()).toContain('Filme')
    expect(wrapper.text()).toContain('★ 8.7')
    expect(wrapper.find('img').attributes('src')).toBe(
      'https://image.tmdb.org/t/p/w500/poster.jpg',
    )
  })

  it('shows the highlighted "Novo" badge for current-year titles', () => {
    const wrapper = mount(TitleCard, { props: { item: title({ isNew: true }) } })
    expect(wrapper.text()).toContain('Novo')
  })

  it('hides the rating pill when there is no rating', () => {
    const wrapper = mount(TitleCard, { props: { item: title({ rating: 0 }) } })
    expect(wrapper.text()).not.toContain('★')
  })

  it('emits open with the item on click', async () => {
    const item = title()
    const wrapper = mount(TitleCard, { props: { item } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('open')).toEqual([[item]])
  })
})
