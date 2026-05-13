import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const tokens = localStorage.getItem('auth_tokens')
    if (tokens) {
      const parsed = JSON.parse(tokens)
      config.headers.Authorization = `Bearer ${parsed.access}`
    }
  }
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
        const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}')
        const { data } = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: tokens.refresh,
        })
        const newTokens = { ...tokens, access: data.access }
        localStorage.setItem('auth_tokens', JSON.stringify(newTokens))
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return apiClient(originalRequest)
      } catch {
        localStorage.removeItem('auth_tokens')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
