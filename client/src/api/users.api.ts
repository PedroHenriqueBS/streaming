import { http } from './http'
import type { Account, Plan, UserPreferences } from '@/types/api'

export const usersApi = {
  async getAccount(): Promise<Account> {
    const { data } = await http.get<Account>('/users/me')
    return data
  },

  async updateAccount(payload: { name?: string; email?: string }): Promise<Account> {
    const { data } = await http.patch<Account>('/users/me', payload)
    return data
  },

  async updatePreferences(payload: Partial<UserPreferences>): Promise<Account> {
    const { data } = await http.patch<Account>('/users/me/preferences', payload)
    return data
  },

  async updatePlan(plan: Plan): Promise<Account> {
    const { data } = await http.patch<Account>('/users/me/plan', { plan })
    return data
  },
}
