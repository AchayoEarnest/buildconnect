import { apiClient } from './client'
import { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types'

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens & { user: User }>('/auth/login/', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<User>('/auth/register/', payload),

  logout: (refresh: string) =>
    apiClient.post('/auth/logout/', { refresh }),

  me: () => apiClient.get<User>('/auth/me/'),

  refreshToken: (refresh: string) =>
    apiClient.post<{ access: string }>('/auth/token/refresh/', { refresh }),
}
