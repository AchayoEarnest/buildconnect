import { apiClient } from './client'
import { Conversation, Message } from '@/types'

export const messagesApi = {
  getConversations: () =>
    apiClient.get<Conversation[]>('/conversations/'),

  // FIX: backend route is /conversations/{id}/ (was trying /conversations/{id}/)
  getConversation: (id: number) =>
    apiClient.get<Conversation>(`/conversations/${id}/`),

  getMessages: (conversationId: number) =>
    apiClient.get<Message[]>(`/conversations/${conversationId}/messages/`),

  // FIX: backend only had GET on this route; POST must go to /messages/send/
  sendMessage: (conversationId: number, content: string, file?: File) => {
    if (file) {
      const fd = new FormData()
      fd.append('content', content)
      fd.append('file', file)
      return apiClient.post<Message>(
        `/conversations/${conversationId}/messages/send/`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
    }
    return apiClient.post<Message>(
      `/conversations/${conversationId}/messages/send/`,
      { content },
    )
  },

  markRead: (conversationId: number) =>
    apiClient.post(`/conversations/${conversationId}/mark-read/`),

  // FIX: was posting to /conversations/ — correct endpoint is /conversations/start/
  startConversation: (participantId: string, projectId?: number) =>
    apiClient.post<Conversation>('/conversations/start/', {
      participant_id: participantId,
      // FIX: backend reads key 'project' (and falls back to 'project_id')
      ...(projectId && { project: projectId }),
    }),
}
