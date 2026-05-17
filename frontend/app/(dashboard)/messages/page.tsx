'use client'
import { useQuery } from '@tanstack/react-query'
import { messagesApi } from '@/lib/api/messages'
import { useAuthStore } from '@/lib/store/authStore'
import { Conversation, User } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Search } from 'lucide-react'
import { useState } from 'react'

function getOtherParticipant(conversation: Conversation, currentUser: User | null): User | undefined {
  return conversation.participants.find((p) => p.id !== currentUser?.id)
}

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations().then((r) => r.data),
    refetchInterval: 15_000,
  })

  const conversations: Conversation[] = Array.isArray(data) ? data : (data?.results ?? [])
  const filtered = conversations.filter((c) => {
    const other = getOtherParticipant(c, user)
    return other?.full_name?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-500 mt-1">Your conversations with engineers and clients</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations…"
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-gray-500">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start a conversation by contacting an engineer or accepting a bid.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">
          {filtered.map((conv) => {
            const other    = getOtherParticipant(conv, user)
            const lastMsg  = conv.last_message
            const isUnread = conv.unread_count > 0

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-base">
                    {other?.first_name?.charAt(0) ?? '?'}
                  </div>
                  {isUnread && (
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-brand-600 border-2 border-white dark:border-gray-900" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-200'}`}>
                      {other?.full_name ?? 'Unknown'}
                    </p>
                    {lastMsg && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatDistanceToNow(new Date(lastMsg.sent_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-xs truncate ${isUnread ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                      {lastMsg
                        ? `${lastMsg.sender?.id === user?.id ? 'You: ' : ''}${lastMsg.content}`
                        : 'No messages yet'}
                    </p>
                    {isUnread && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                  {conv.project && (
                    <p className="text-xs text-brand-500 mt-0.5 truncate">Re: Project #{conv.project}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
