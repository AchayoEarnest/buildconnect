import { apiClient } from './client'
import { Project, Bid, PaginatedResponse } from '@/types'

export const projectsApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Project>>('/projects/', { params }),

  get: (id: number) =>
    apiClient.get<Project>(`/projects/${id}/`),

  create: (data: Partial<Project> & { skills_req: string[]; milestones?: any[] }) =>
    apiClient.post<Project>('/projects/', data),

  update: (id: number, data: Partial<Project>) =>
    apiClient.patch<Project>(`/projects/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/projects/${id}/`),

  getBids: (projectId: number) =>
    apiClient.get<Bid[]>(`/projects/${projectId}/bids/`),

  submitBid: (projectId: number, data: { amount: number; cover_letter: string; timeline: number }) =>
    apiClient.post<Bid>(`/projects/${projectId}/bids/`, data),

  updateBid: (bidId: number, status: 'accepted' | 'rejected') =>
    apiClient.patch<Bid>(`/bids/${bidId}/`, { status }),

  getMyBids: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Bid & { project: Project }>>('/bids/my/', { params }),

  releaseMilestone: (milestoneId: number) =>
    apiClient.post(`/milestones/${milestoneId}/release/`),
}
