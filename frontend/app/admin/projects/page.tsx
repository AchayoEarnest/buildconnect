'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Project } from '@/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Search, Eye, Trash2, Ban, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_TABS = ['all', 'open', 'in_progress', 'completed', 'cancelled'] as const
type StatusTab = typeof STATUS_TABS[number]

const statusStyle: Record<string, string> = {
  open:        'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  completed:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export default function AdminProjectsPage() {
  const qc = useQueryClient()
  const [tab, setTab]       = useState<StatusTab>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', tab, search],
    queryFn: () => apiClient.get('/admin/projects/', {
      params: { ...(tab !== 'all' && { status: tab }), search },
    }).then((r) => r.data),
  })

  const projects: Project[] = Array.isArray(data) ? data : (data?.results ?? [])

  const changeStatus = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/admin/projects/${id}/`, { status })
      toast.success(`Project marked as ${status}`)
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
    } catch {
      toast.error('Action failed')
    }
  }

  const deleteProject = async (id: number) => {
    if (!confirm('Permanently delete this project?')) return
    try {
      await apiClient.delete(`/admin/projects/${id}/`)
      toast.success('Project deleted')
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <p className="text-gray-500 mt-1">Monitor and moderate all platform projects</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                tab === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'
              }`}>
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No projects found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Project', 'Client', 'Budget', 'Deadline', 'Status', 'Bids', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.location || 'Remote'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[150px] truncate">
                      {p.client?.company_name || p.client?.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      ${p.budget_min.toLocaleString()} – ${p.budget_max.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(p.deadline), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[p.status]}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {p.bid_count ?? p.bids?.length ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${p.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {p.status === 'open' && (
                          <button onClick={() => changeStatus(p.id, 'cancelled')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Cancel project">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {p.status === 'cancelled' && (
                          <button onClick={() => changeStatus(p.id, 'open')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Re-open project">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteProject(p.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete project">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
