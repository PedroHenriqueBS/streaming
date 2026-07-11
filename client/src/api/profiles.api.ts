import { http } from './http'
import type { Profile } from '@/types/api'

export const profilesApi = {
  async list(): Promise<Profile[]> {
    const { data } = await http.get<Profile[]>('/profiles')
    return data
  },

  async create(payload: { name: string; avatarHue: number }): Promise<Profile> {
    const { data } = await http.post<Profile>('/profiles', payload)
    return data
  },

  async update(id: string, payload: { name?: string; avatarHue?: number }): Promise<Profile> {
    const { data } = await http.patch<Profile>(`/profiles/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/profiles/${id}`)
  },
}
