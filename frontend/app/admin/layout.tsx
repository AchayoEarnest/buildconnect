'use client'
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HardHat, Users, ShieldCheck, BarChart2,
  FolderOpen, LogOut, ChevronLeft, Settings
} from 'lucide-react'

const adminLinks = [
  { href: '/admin/users',     icon: Users,       label: 'User Management'   },
  { href: '/admin/verify',    icon: ShieldCheck, label: 'Verifications'     },
  { href: '/admin/projects',  icon: FolderOpen,  label: 'Projects'          },
  { href: '/admin/analytics', icon: BarChart2,   label: 'Analytics'         },
  { href: '/admin/settings',  icon: Settings,    label: 'Platform Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const router   = useRouter()
  const pathname = usePathname()

  // Hydration guard — prevents flash redirect before zustand rehydrates
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) { router.push('/login'); return }
    if (user?.role !== 'admin') { router.push('/feed') }
  }, [hydrated, isAuthenticated, user, router])

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') return null

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Admin Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col h-full bg-gray-900 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">BuildConnect</p>
            <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-700 space-y-1">
          <Link href="/feed"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />Back to App
          </Link>
          <button onClick={clearAuth}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500">
            Logged in as <span className="text-gray-900 dark:text-white font-semibold">{user.full_name}</span>
          </p>
          <span className="text-xs px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">
            Admin
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
