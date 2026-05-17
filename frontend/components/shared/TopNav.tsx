'use client'
import { useAuthStore } from '@/lib/store/authStore'
import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { useState } from 'react'

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
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-4 h-4" />
          {/* Unread dot — wire to real data when ready */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

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
