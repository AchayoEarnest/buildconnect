'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/authStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import {
  Eye, DollarSign, Star, TrendingUp, Briefcase, CheckCircle,
  FolderOpen, Users, Building2,
} from 'lucide-react'

const MOCK_MONTHLY = [
  { month: 'Jan', value: 2400 }, { month: 'Feb', value: 3200 },
  { month: 'Mar', value: 2800 }, { month: 'Apr', value: 4100 },
  { month: 'May', value: 3700 }, { month: 'Jun', value: 5200 },
]
const MOCK_VIEWS = [
  { day: 'Mon', views: 12 }, { day: 'Tue', views: 19 },
  { day: 'Wed', views: 8  }, { day: 'Thu', views: 25 },
  { day: 'Fri', views: 31 }, { day: 'Sat', views: 14 },
  { day: 'Sun', views: 9  },
]

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  // FIX: was hardcoded to /analytics/engineer/ → clients got 403
  const endpoint = user?.role === 'client' ? '/analytics/client/' : '/analytics/engineer/'

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', user?.role],
    queryFn: () => apiClient.get(endpoint).then((r) => r.data),
    enabled: !!user,
  })

  // ── Engineer stat cards ──────────────────────────────────────────────────
  const engineerCards = [
    { label: 'Profile Views (30d)', value: stats?.profile_views_30d ?? 0,          icon: Eye,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Earnings',      value: `KES ${(stats?.total_earnings ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Avg Rating',          value: stats?.avg_rating?.toFixed(1) ?? '—',    icon: Star,        color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Completed Projects',  value: stats?.completed_projects ?? 0,          icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Bids',          value: stats?.bid_stats?.total ?? 0,            icon: Briefcase,   color: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Bids Accepted',       value: stats?.bid_stats?.accepted ?? 0,         icon: TrendingUp,  color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ]

  // FIX: client-specific stat cards
  const clientCards = [
    { label: 'Total Projects',      value: stats?.total_projects ?? 0,      icon: FolderOpen,  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Projects',     value: stats?.active_projects ?? 0,     icon: TrendingUp,  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Completed Projects',  value: stats?.completed_projects ?? 0,  icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Bids Received',       value: stats?.total_bids_received ?? 0, icon: Users,       color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Engineers Hired',     value: stats?.accepted_bids ?? 0,       icon: Building2,   color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Total Spent',         value: `KES ${(stats?.total_spent ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ]

  const cards = user?.role === 'client' ? clientCards : engineerCards
  const chartLabel = user?.role === 'client' ? 'Project Spend' : 'Earnings'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 mt-1">Your performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading
                ? <span className="animate-pulse bg-gray-200 rounded w-16 h-6 inline-block" />
                : value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Monthly {chartLabel}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_MONTHLY} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, chartLabel]} />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profile views only relevant for engineers */}
        {user?.role === 'engineer' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Profile Views (This Week)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MOCK_VIEWS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Project breakdown for clients */}
        {user?.role === 'client' && stats && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Project Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { label: 'Open',      count: stats.open_projects ?? 0 },
                  { label: 'Active',    count: stats.active_projects ?? 0 },
                  { label: 'Completed', count: stats.completed_projects ?? 0 },
                ]}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bid success rate — engineers only */}
      {user?.role === 'engineer' && stats?.bid_stats?.total > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Bid Success Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-700"
                style={{ width: `${(stats.bid_stats.accepted / stats.bid_stats.total) * 100}%` }}
              />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round((stats.bid_stats.accepted / stats.bid_stats.total) * 100)}%
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {stats.bid_stats.accepted} accepted out of {stats.bid_stats.total} bids submitted
          </p>
        </div>
      )}
    </div>
  )
}
