'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Users, Briefcase, DollarSign, TrendingUp, Activity } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiClient.get('/analytics/admin/').then((r) => r.data),
  })

  const stats = [
    { label: 'Total Users',      value: data?.total_users,     icon: Users,      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Engineers',        value: data?.engineers,        icon: Activity,   color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Clients',          value: data?.clients,          icon: Users,      color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'New Users (30d)',  value: data?.new_users_30d,   icon: TrendingUp, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Active Projects',  value: data?.active_projects,  icon: Briefcase,  color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Total Projects',   value: data?.total_projects,   icon: Briefcase,  color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Revenue (30d)',    value: `$${(data?.revenue_30d ?? 0).toLocaleString()}`,   icon: DollarSign, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Revenue',   value: `$${(data?.total_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
        <p className="text-gray-500 mt-1">Real-time platform overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? <span className="text-gray-300 dark:text-gray-700">—</span> : (value ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
