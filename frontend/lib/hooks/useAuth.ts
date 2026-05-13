import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { LoginPayload, RegisterPayload } from '@/types'

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const login = async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload)
    setAuth(data.user, { access: data.access, refresh: data.refresh })
    return data.user
  }

  const register = async (payload: RegisterPayload) => {
    const { data } = await authApi.register(payload)
    return data
  }

  const logout = async () => {
    const tokens = useAuthStore.getState().tokens
    if (tokens?.refresh) {
      await authApi.logout(tokens.refresh).catch(() => {})
    }
    clearAuth()
  }

  return { user, isAuthenticated, login, register, logout }
}
