import { createPinia, setActivePinia } from 'pinia'
import { useWatchlistStore } from './watchlist.store'
import { watchlistApi } from '@/api/watchlist.api'
import type { TitleSummary } from '@/types/api'

jest.mock('@/api/watchlist.api', () => ({
  watchlistApi: {
    list: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  },
}))

const watchlistApiMock = watchlistApi as jest.Mocked<typeof watchlistApi>

function title(tmdbId: number): TitleSummary {
  return {
    tmdbId,
    mediaType: 'movie',
    title: `Título ${tmdbId}`,
    overview: '',
    posterUrl: null,
    backdropUrl: null,
    year: 2024,
    rating: 8,
    genre: 'Ação',
    isAnimation: false,
    isNew: false,
  }
}

describe('watchlist store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('adds a title that is not in the list yet and reports "added"', async () => {
    watchlistApiMock.add.mockResolvedValue([title(1)])
    const store = useWatchlistStore()

    const added = await store.toggle('profile-1', title(1))

    expect(added).toBe(true)
    expect(watchlistApiMock.add).toHaveBeenCalledWith('profile-1', 'movie', 1)
    expect(store.items).toHaveLength(1)
    expect(store.has('movie', 1)).toBe(true)
  })

  it('removes a title that is already in the list and reports "removed"', async () => {
    watchlistApiMock.list.mockResolvedValue([title(1)])
    watchlistApiMock.remove.mockResolvedValue([])
    const store = useWatchlistStore()
    await store.fetch('profile-1')

    const added = await store.toggle('profile-1', title(1))

    expect(added).toBe(false)
    expect(watchlistApiMock.remove).toHaveBeenCalledWith('profile-1', 'movie', 1)
    expect(store.items).toHaveLength(0)
  })

  it('resets state on profile switch/logout', async () => {
    watchlistApiMock.list.mockResolvedValue([title(1)])
    const store = useWatchlistStore()
    await store.fetch('profile-1')

    store.reset()

    expect(store.items).toEqual([])
    expect(store.loaded).toBe(false)
  })
})
