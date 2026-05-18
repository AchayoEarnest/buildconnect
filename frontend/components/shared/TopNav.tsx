'use client'
import { useAuthStore } from '@/lib/store/authStore'
import { useNotificationStore } from '@/lib/store/notificationStore'
import { useWebSocket } from '@/lib/hooks/useWebSocket'
import { notificationsApi } from '@/lib/api/notifications'
import { usePathname } from 'next/navigation'
import { Bell, Search, X, Check } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Notification } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const routeLabels: Record<string, string> = {
  '/feed':          'Feed',
  '/engineers':     'Engineers',
  '/bids':          'My Bids',
  '/messages':      'Messages',
  '/analytics':     'Analytics',
  '/settings':      'Settings',
  '/projects/post': 'Post a Project',
}

function getPageTitle(pathname: string): string {
  for (const [route, label] of Object.entries(routeLabels)) {
    if (pathname === route || pathname.startsWith(route + '/')) return label
  }
  return 'Dashboard'
}

export default function TopNav() {
  const { user } = useAuthStore()
  const pathname  = usePathname()
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)
  const panelRef            = useRef<HTMLDivElement>(null)

  const { notifications, unreadCount, setNotifications, prependNotification, markAllRead } =
    useNotificationStore()

  // --- Load notifications on mount ---
  useEffect(() => {
    notificationsApi.list().then((r) => {
      const list: Notification[] = Array.isArray(r.data)
        ? r.data
        : (r.data as any)?.results ?? []
      setNotifications(list)
    }).catch(() => {})
  }, [setNotifications])

  // --- Real-time push via WebSocket ---
  const handleWsMessage = useCallback((data: unknown) => {
    if (data && typeof data === 'object') {
      prependNotification(data as Notification)
    }
  }, [prependNotification])

  useWebSocket('ws/notifications/', { onMessage: handleWsMessage })

  // --- Close panel on outside click ---
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      markAllRead()
    } catch {}
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-900 dark:text-white">
        {getPageTitle(pathname)}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications {unreadCount > 0 && <span className="text-brand-600">({unreadCount})</span>}
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {notifications.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No notifications yet</p>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <NotificationRow key={n.id} notification={n} onClose={() => setOpen(false)} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
              {user.first_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.first_name}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}

function NotificationRow({ notification: n, onClose }: { notification: Notification; onClose: () => void }) {
  const content = (
    <div className={`px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.is_read ? 'bg-brand-50 dark:bg-brand-900/10' : ''}`}>
      {/* Unread indicator */}
      <div className="pt-1.5 shrink-0">
        <div className={`w-2 h-2 rounded-full ${!n.is_read ? 'bg-brand-500' : 'bg-transparent'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  )

  if (n.link) {
    return (
      <Link href={n.link} onClick={onClose} className="block">
        {content}
      </Link>
    )
  }
  return <div>{content}</div>
}
