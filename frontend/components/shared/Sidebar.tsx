'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import {
  HardHat,
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
  FileText,
} from 'lucide-react'

const engineerLinks = [
  { href: '/feed',        icon: LayoutDashboard, label: 'Feed'        },
  { href: '/engineers',   icon: Users,           label: 'Engineers'   },
  { href: '/bids',        icon: FileText,        label: 'My Bids'     },
  { href: '/messages',    icon: MessageSquare,   label: 'Messages'    },
  { href: '/analytics',   icon: BarChart2,       label: 'Analytics'   },
  { href: '/settings',    icon: Settings,        label: 'Settings'    },
]

const clientLinks = [
  { href: '/feed',            icon: LayoutDashboard, label: 'Feed'           },
  { href: '/projects/post',   icon: PlusCircle,      label: 'Post Project'   },
  { href: '/engineers',       icon: Users,           label: 'Find Engineers' },
  { href: '/messages',        icon: MessageSquare,   label: 'Messages'       },
  { href: '/analytics',       icon: BarChart2,       label: 'Analytics'      },
  { href: '/settings',        icon: Settings,        label: 'Settings'       },
]

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const pathname = usePathname()

  const links = user?.role === 'client' ? clientLinks : engineerLinks

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <HardHat className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-none">BuildConnect</p>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role ?? 'Dashboard'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-700">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.first_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={clearAuth}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
