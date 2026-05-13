'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Eye, DollarSign, Star, TrendingUp, Briefcase, CheckCircle } from 'lucide-react'

const MOCK_MONTHLY = [
  { month: 'Jan', earnings: 2400 }, { month: 'Feb', earnings: 3200 },
  { month: 'Mar', earnings: 2800 }, { month: 'Apr', earnings: 4100 },
  { month: 'May', earnings: 3700 }, { month: 'Jun', earnings: 5200 },
]

const MOCK_VIEWS = [
  { day: 'Mon', views: 12 }, { day: 'Tue', views: 19 },
  { day: 'Wed', views: 8  }, { day: 'Thu', views: 25 },
  { day: 'Fri', views: 31 }, { day: 'Sat', views: 14 },
  { day: 'Sun', views: 9  },
]

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient.get('/analytics/engineer/').then((r) => r.data),
  })

  const cards = [
    { label: 'Profile Views (30d)', value: stats?.profile_views_30d ?? 0, icon: Eye,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Earnings',      value: `$${(stats?.total_earnings ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Avg Rating',          value: stats?.avg_rating?.toFixed(1) ?? '—',              icon: Star,        color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Completed Projects',  value: stats?.completed_projects ?? 0,                    icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Bids',          value: stats?.bid_stats?.total ?? 0,                      icon: Briefcase,   color: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Bids Accepted',       value: stats?.bid_stats?.accepted ?? 0,                   icon: TrendingUp,  color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ]

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
              {isLoading ? <span className="animate-pulse bg-gray-200 rounded w-16 h-6 inline-block" /> : value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_MONTHLY} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v}`, 'Earnings']} />
              <Bar dataKey="earnings" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
      </div>

      {/* Bid Success Rate */}
      {stats?.bid_stats?.total > 0 && (
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
