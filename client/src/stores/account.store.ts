import { defineStore } from 'pinia'
import { usersApi } from '@/api/users.api'
import { useAuthStore } from './auth.store'
import type { Account, Plan, UserPreferences } from '@/types/api'

interface AccountState {
  account: Account | null
}

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    account: null,
  }),

  actions: {
    async fetchAccount(): Promise<void> {
      this.setAccount(await usersApi.getAccount())
    },

    async updateAccount(payload: { name?: string; email?: string }): Promise<void> {
      this.setAccount(await usersApi.updateAccount(payload))
    },

    async updatePreferences(payload: Partial<UserPreferences>): Promise<void> {
      this.setAccount(await usersApi.updatePreferences(payload))
    },

    async updatePlan(plan: Plan): Promise<void> {
      this.setAccount(await usersApi.updatePlan(plan))
    },

    setAccount(account: Account): void {
      this.account = account
      const authStore = useAuthStore()
      authStore.updateUser({
        id: account.id,
        name: account.name,
        email: account.email,
        plan: account.plan,
      })
    },

    reset(): void {
      this.account = null
    },
  },
})
