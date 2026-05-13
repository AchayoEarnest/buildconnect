'use client'
import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { messagesApi } from '@/lib/api/messages'
import { useWebSocket } from '@/lib/hooks/useWebSocket'
import { useAuthStore } from '@/lib/store/authStore'
import { Message } from '@/types'
import { Send, Paperclip } from 'lucide-react'
import { format } from 'date-fns'

export default function ChatPage({ params }: { params: { roomId: string } }) {
  const { user }           = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]  = useState('')
  const bottomRef          = useRef<HTMLDivElement>(null)
  const roomId             = parseInt(params.roomId)

  const { data: history } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => messagesApi.getMessages(roomId).then((r) => r.data),
  })

  useEffect(() => {
    if (history) setMessages(history)
  }, [history])

  const { send } = useWebSocket(`ws/chat/${roomId}/`, {
    onMessage: (data) => {
      setMessages((prev) => [...prev, data as Message])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    send({ content: input })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => {
          const isOwn = msg.sender?.id === user?.id
          return (
            <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2.5 ${
                isOwn
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
              }`}>
                {!isOwn && <p className="text-xs font-semibold opacity-60 mb-0.5">{msg.sender?.full_name}</p>}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 opacity-60 ${isOwn ? 'text-right' : ''}`}>
                  {format(new Date(msg.sent_at), 'HH:mm')}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50
                       dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
