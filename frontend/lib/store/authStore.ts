import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthTokens } from '@/types'
import Cookies from 'js-cookie'

interface AuthState {
  user:            User | null
  tokens:          AuthTokens | null
  isAuthenticated: boolean
  setAuth:         (user: User, tokens: AuthTokens) => void
  clearAuth:       () => void
  updateUser:      (partial: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      tokens:          null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        Cookies.set('access_token',  tokens.access,  { expires: 1, sameSite: 'Lax' })
        Cookies.set('refresh_token', tokens.refresh, { expires: 7, sameSite: 'Lax' })
        set({ user, tokens, isAuthenticated: true })
      },

      clearAuth: () => {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        set({ user: null, tokens: null, isAuthenticated: false })
        // Hard redirect so Next.js middleware re-evaluates
        if (typeof window !== 'undefined') window.location.href = '/login'
      },

      updateUser: (partial) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...partial } })
      },
    }),
    {
      name: 'buildconnect-auth',
      partialize: (state) => ({
        user:            state.user,
        tokens:          state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
