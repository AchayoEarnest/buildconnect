import { apiClient } from './client'
import { EngineerProfile, PaginatedResponse } from '@/types'

export const profilesApi = {
  listEngineers: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<EngineerProfile>>('/engineers/', { params }),

  getEngineer: (slug: string) =>
    apiClient.get<EngineerProfile>(`/engineers/${slug}/`),

  updateProfile: (slug: string, data: Partial<EngineerProfile>) =>
    apiClient.patch<EngineerProfile>(`/engineers/${slug}/`, data),

  bookmarkEngineer: (slug: string) =>
    apiClient.post<{ saved: boolean }>(`/engineers/${slug}/bookmark/`),

  searchEngineers: (params: Record<string, string>) =>
    apiClient.get<EngineerProfile[]>('/search/engineers/', { params }),

  uploadPortfolioProject: (data: FormData) =>
    apiClient.post('/portfolio/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
