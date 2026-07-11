import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '@/api/config'
import type { AuthResponse } from '@/types/api'

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

/** Called by the auth store so a refreshed session updates Pinia state too. */
type SessionRefreshListener = (session: AuthResponse) => void
let onSessionRefreshed: SessionRefreshListener | null = null

export function setSessionRefreshedListener(listener: SessionRefreshListener | null): void {
  onSessionRefreshed = listener
}

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise: Promise<AuthResponse> | null = null

async function refreshSession(): Promise<AuthResponse> {
  refreshPromise ??= axios
    .post<AuthResponse>(`${API_URL}/auth/refresh`, null, { withCredentials: true })
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableRequestConfig | undefined
  const isAuthRoute = config?.url?.startsWith('/auth/') ?? false

  if (error.response?.status !== 401 || !config || config._retried || isAuthRoute) {
    throw error
  }

  const session = await refreshSession()
  setAccessToken(session.accessToken)
  onSessionRefreshed?.(session)

  config._retried = true
  config.headers.Authorization = `Bearer ${session.accessToken}`
  return http(config)
})

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message
    if (Array.isArray(message)) {
      return message[0] ?? fallback
    }
    if (typeof message === 'string') {
      return message
    }
  }
  return fallback
}
