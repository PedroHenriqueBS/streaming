import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth.store'
import { authApi } from '@/api/auth.api'
import { setAccessToken } from '@/api/http'
import type { AuthResponse } from '@/types/api'

jest.mock('@/api/auth.api', () => ({
  authApi: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
  },
}))

jest.mock('@/api/http', () => ({
  setAccessToken: jest.fn(),
  setSessionRefreshedListener: jest.fn(),
}))

const authApiMock = authApi as jest.Mocked<typeof authApi>

const session: AuthResponse = {
  user: { id: 'u1', name: 'Pedro', email: 'pedro@test.dev', plan: 'PREMIUM' },
  accessToken: 'jwt-token',
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('restores the session from the refresh cookie on bootstrap', async () => {
    authApiMock.refresh.mockResolvedValue(session)
    const store = useAuthStore()

    await store.bootstrap()

    expect(store.isAuthenticated).toBe(true)
    expect(store.user).toEqual(session.user)
    expect(setAccessToken).toHaveBeenCalledWith('jwt-token')
  })

  it('stays unauthenticated when there is no valid refresh cookie', async () => {
    authApiMock.refresh.mockRejectedValue(new Error('401'))
    const store = useAuthStore()

    await store.bootstrap()

    expect(store.isAuthenticated).toBe(false)
    expect(store.initialized).toBe(true)
  })

  it('bootstraps only once', async () => {
    authApiMock.refresh.mockResolvedValue(session)
    const store = useAuthStore()

    await store.bootstrap()
    await store.bootstrap()

    expect(authApiMock.refresh).toHaveBeenCalledTimes(1)
  })

  it('logs in and stores the user', async () => {
    authApiMock.login.mockResolvedValue(session)
    const store = useAuthStore()

    await store.login({ email: 'pedro@test.dev', password: 'secret123' })

    expect(store.user).toEqual(session.user)
    expect(setAccessToken).toHaveBeenCalledWith('jwt-token')
  })

  it('clears the session on logout even when the API call fails', async () => {
    authApiMock.login.mockResolvedValue(session)
    authApiMock.logout.mockRejectedValue(new Error('network'))
    const store = useAuthStore()
    await store.login({ email: 'pedro@test.dev', password: 'secret123' })

    await expect(store.logout()).rejects.toThrow('network')

    expect(store.user).toBeNull()
    expect(setAccessToken).toHaveBeenLastCalledWith(null)
  })
})
