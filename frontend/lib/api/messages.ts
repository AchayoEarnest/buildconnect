import { apiClient } from './client'
import { Conversation, Message } from '@/types'

export const messagesApi = {
  getConversations: () =>
    apiClient.get<Conversation[]>('/conversations/'),

  getConversation: (id: number) =>
    apiClient.get<Conversation>(`/conversations/${id}/`),

  getMessages: (conversationId: number) =>
    apiClient.get<Message[]>(`/conversations/${conversationId}/messages/`),

  sendMessage: (conversationId: number, content: string, file?: File) => {
    if (file) {
      const fd = new FormData()
      fd.append('content', content)
      fd.append('file', file)
      return apiClient.post<Message>(`/conversations/${conversationId}/messages/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return apiClient.post<Message>(`/conversations/${conversationId}/messages/`, { content })
  },

  markRead: (conversationId: number) =>
    apiClient.post(`/conversations/${conversationId}/mark-read/`),

  startConversation: (participantId: string, projectId?: number) =>
    apiClient.post<Conversation>('/conversations/', {
      participant_id: participantId,
      ...(projectId && { project: projectId }),
    }),
}
