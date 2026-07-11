import { http } from './http'
import type { AccountUser, AuthResponse } from '@/types/api'

export const authApi = {
  async register(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async refresh(): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/refresh')
    return data
  },

  async logout(): Promise<void> {
    await http.post('/auth/logout')
  },

  async me(): Promise<AccountUser> {
    const { data } = await http.get<AccountUser>('/auth/me')
    return data
  },
}
