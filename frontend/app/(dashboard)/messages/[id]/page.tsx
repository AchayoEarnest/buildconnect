'use client'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/authStore'
import { messagesApi } from '@/lib/api/messages'
import { Conversation, Message, User } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronLeft, Send, Paperclip, Loader2, FileText } from 'lucide-react'

function getOtherParticipant(conv: Conversation, me: User | null): User | undefined {
  return conv.participants.find((p) => p.id !== me?.id)
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const convId = parseInt(params.id, 10)

  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: conv } = useQuery<Conversation>({
    queryKey: ['conversation', convId],
    queryFn: () => messagesApi.getConversation(convId).then((r) => r.data),
  })

  const { data: msgs, isLoading } = useQuery<Message[]>({
    queryKey: ['messages', convId],
    queryFn: async () => {
      const { data } = await messagesApi.getMessages(convId)
      await messagesApi.markRead(convId)
      return data
    },
    refetchInterval: 6_000,
  })

  const messages: Message[] = Array.isArray(msgs) ? msgs : (msgs as any)?.results ?? []
  const other = conv ? getOtherParticipant(conv, user) : undefined

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const send = async () => {
    if (!text.trim() && !file) return
    setSending(true)
    try {
      await messagesApi.sendMessage(convId, text.trim(), file ?? undefined)
      setText('')
      setFile(null)
      qc.invalidateQueries({ queryKey: ['messages', convId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    } catch {
      // silently fail — user can retry
    } finally {
      setSending(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-112px)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/messages"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors shrink-0">
          <ChevronLeft className="w-4 h-4" />Back
        </Link>

        {other && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {other.first_name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{other.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{other.role}</p>
            </div>
          </div>
        )}

        {conv?.project && (
          <Link href={`/projects/${conv.project}`}
            className="ml-auto shrink-0 text-xs text-brand-600 hover:underline">
            Project #{conv.project}
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?.id === user?.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                  }`}>
                    {msg.file_url && (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-2 mb-1.5 text-xs font-medium underline ${isMe ? 'text-white/80' : 'text-brand-600'}`}>
                        <FileText className="w-3.5 h-3.5" />
                        {msg.file_name ?? 'Attachment'}
                      </a>
                    )}
                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">
                    {format(new Date(msg.sent_at), 'h:mm a')}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* File preview */}
      {file && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800">
          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="text-xs text-brand-700 dark:text-brand-300 truncate flex-1">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline shrink-0">Remove</button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2.5 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors shrink-0"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32 overflow-y-auto"
          style={{ fieldSizing: 'content' } as any}
        />

        <button
          onClick={send}
          disabled={sending || (!text.trim() && !file)}
          className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white transition-colors shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
