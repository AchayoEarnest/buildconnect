import { apiClient } from './client'
import { Conversation, Message } from '@/types'

export const messagesApi = {
  listConversations: () =>
    apiClient.get<Conversation[]>('/conversations/'),

  getMessages: (conversationId: number) =>
    apiClient.get<Message[]>(`/conversations/${conversationId}/messages/`),

  startConversation: (participantId: string, projectId?: number) =>
    apiClient.post<Conversation>('/conversations/start/', {
      participant_id: participantId,
      project_id: projectId,
    }),
}
