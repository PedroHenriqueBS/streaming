import { defineStore } from 'pinia'
import { profilesApi } from '@/api/profiles.api'
import type { Profile } from '@/types/api'

const ACTIVE_PROFILE_STORAGE_KEY = 'devflix_active_profile'

interface ProfilesState {
  profiles: Profile[]
  activeProfileId: string | null
  loaded: boolean
}

export const useProfilesStore = defineStore('profiles', {
  state: (): ProfilesState => ({
    profiles: [],
    activeProfileId: localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY),
    loaded: false,
  }),

  getters: {
    activeProfile: (state): Profile | null =>
      state.profiles.find((profile) => profile.id === state.activeProfileId) ?? null,
    canAddProfile: (state) => state.profiles.length < 5,
  },

  actions: {
    async fetchProfiles(): Promise<void> {
      this.profiles = await profilesApi.list()
      this.loaded = true
      if (this.activeProfileId && !this.profiles.some((p) => p.id === this.activeProfileId)) {
        this.setActiveProfile(null)
      }
    },

    setActiveProfile(profileId: string | null): void {
      this.activeProfileId = profileId
      if (profileId) {
        localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, profileId)
      } else {
        localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY)
      }
    },

    async createProfile(payload: { name: string; avatarHue: number }): Promise<void> {
      const profile = await profilesApi.create(payload)
      this.profiles.push(profile)
    },

    async updateProfile(id: string, payload: { name?: string; avatarHue?: number }): Promise<void> {
      const updated = await profilesApi.update(id, payload)
      this.profiles = this.profiles.map((profile) => (profile.id === id ? updated : profile))
    },

    async removeProfile(id: string): Promise<void> {
      await profilesApi.remove(id)
      this.profiles = this.profiles.filter((profile) => profile.id !== id)
      if (this.activeProfileId === id) {
        this.setActiveProfile(null)
      }
    },

    reset(): void {
      this.profiles = []
      this.loaded = false
      this.setActiveProfile(null)
    },
  },
})
