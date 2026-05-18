import { create } from 'zustand'
import { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount:   number

  setNotifications: (list: Notification[]) => void
  prependNotification: (n: Notification) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount:   0,

  setNotifications: (list) =>
    set({
      notifications: list,
      unreadCount:   list.filter((n) => !n.is_read).length,
    }),

  prependNotification: (n) => {
    const updated = [n, ...get().notifications]
    set({
      notifications: updated,
      unreadCount:   updated.filter((x) => !x.is_read).length,
    })
  },

  markAllRead: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount:   0,
    }),
}))
