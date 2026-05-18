import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Helper: read access token from zustand-persisted store (key: buildconnect-auth)
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('buildconnect-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.tokens?.access ?? null
  } catch {
    return null
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('buildconnect-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.tokens?.refresh ?? null
  } catch {
    return null
  }
}

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refresh = getRefreshToken()
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh })
        // Patch the persisted store with the new access token
        const raw = localStorage.getItem('buildconnect-auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.state?.tokens) {
            parsed.state.tokens.access = data.access
            localStorage.setItem('buildconnect-auth', JSON.stringify(parsed))
          }
        }
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return apiClient(originalRequest)
      } catch {
        // Clear store and redirect on refresh failure
        localStorage.removeItem('buildconnect-auth')
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
