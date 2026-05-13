'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import {
  HardHat, LayoutDashboard, Search, FolderOpen,
  MessageCircle, BarChart2, Settings, LogOut, Users, ShieldCheck
} from 'lucide-react'

const engineerLinks = [
  { href: '/feed',      icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects',  icon: FolderOpen,      label: 'Projects' },
  { href: '/bids',      icon: Search,          label: 'My Bids' },
  { href: '/messages',  icon: MessageCircle,   label: 'Messages' },
  { href: '/analytics', icon: BarChart2,       label: 'Analytics' },
]

const clientLinks = [
  { href: '/feed',      icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/engineers', icon: Users,           label: 'Find Engineers' },
  { href: '/projects',  icon: FolderOpen,      label: 'My Projects' },
  { href: '/messages',  icon: MessageCircle,   label: 'Messages' },
]

const adminLinks = [
  { href: '/admin/users',    icon: Users,       label: 'Users' },
  { href: '/admin/verify',   icon: ShieldCheck, label: 'Verification' },
  { href: '/admin/analytics',icon: BarChart2,   label: 'Analytics' },
]

export default function Sidebar() {
  const pathname           = usePathname()
  const { user, clearAuth } = useAuthStore()

  const links = user?.role === 'engineer' ? engineerLinks
              : user?.role === 'admin'    ? adminLinks
              : clientLinks

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <HardHat className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-lg">BuildConnect</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600
                     dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
          <Settings className="w-4 h-4" />Settings
        </Link>
        <button onClick={clearAuth}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </aside>
  )
}
