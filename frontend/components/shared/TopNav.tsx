'use client'
import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { useWebSocket } from '@/lib/hooks/useWebSocket'
import { Notification } from '@/types'
import { apiClient } from '@/lib/api/client'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

export default function TopNav() {
  const { user }    = useAuthStore()
  const [open, setOpen]   = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifs, setNotifs] = useState<Notification[]>([])

  const { data } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications/').then((r) => r.data),
  })

  useEffect(() => {
    if (data) {
      setNotifs(data)
      setUnread(data.filter((n) => !n.is_read).length)
    }
  }, [data])

  useWebSocket('ws/notifications/', {
    onMessage: (data) => {
      const notif = data as Notification
      setNotifs((prev) => [notif, ...prev])
      setUnread((n) => n + 1)
    },
  })

  const markAllRead = async () => {
    await apiClient.post('/notifications/mark-read/')
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div />
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setOpen(!open)}
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {notifs.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">All caught up!</p>
                ) : notifs.slice(0, 10).map((n) => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.is_read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.first_name?.charAt(0) ?? '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user?.full_name}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
