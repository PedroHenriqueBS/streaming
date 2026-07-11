import { defineStore } from 'pinia'
import { authApi } from '@/api/auth.api'
import { setAccessToken, setSessionRefreshedListener } from '@/api/http'
import type { AccountUser } from '@/types/api'

interface AuthState {
  user: AccountUser | null
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
  },

  actions: {
    /**
     * Attempts to restore the session from the refresh cookie once, on app
     * boot. Also wires the http layer so silent refreshes update this store.
     */
    async bootstrap(): Promise<void> {
      if (this.initialized) {
        return
      }
      setSessionRefreshedListener((session) => {
        this.user = session.user
      })
      try {
        const session = await authApi.refresh()
        setAccessToken(session.accessToken)
        this.user = session.user
      } catch {
        this.user = null
      } finally {
        this.initialized = true
      }
    },

    async register(payload: { name: string; email: string; password: string }): Promise<void> {
      const session = await authApi.register(payload)
      setAccessToken(session.accessToken)
      this.user = session.user
    },

    async login(payload: { email: string; password: string }): Promise<void> {
      const session = await authApi.login(payload)
      setAccessToken(session.accessToken)
      this.user = session.user
    },

    async logout(): Promise<void> {
      try {
        await authApi.logout()
      } finally {
        setAccessToken(null)
        this.user = null
      }
    },

    updateUser(user: AccountUser): void {
      this.user = user
    },
  },
})
