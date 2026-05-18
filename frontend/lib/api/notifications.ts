import { apiClient } from './client'
import { Notification, PaginatedResponse } from '@/types'

export const notificationsApi = {
  list: () =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications/'),

  markAllRead: () =>
    apiClient.post('/notifications/mark-read/'),
}
