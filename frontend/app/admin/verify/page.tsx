'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  ShieldCheck, ShieldX, FileText, Download,
  Clock, CheckCircle, XCircle, Search, Eye
} from 'lucide-react'

type VerifStatus = 'pending' | 'approved' | 'rejected'

interface VerificationRequest {
  id: number
  user: {
    id: string
    full_name: string
    email: string
    role: string
    date_joined: string
  }
  national_id_url?: string
  certificate_url?: string
  license_url?:     string
  notes:  string
  status: VerifStatus
  submitted_at: string
  reviewed_at?: string
}

const statusStyle: Record<VerifStatus, string> = {
  pending:  'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  approved: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

const statusIcon: Record<VerifStatus, React.ElementType> = {
  pending:  Clock,
  approved: CheckCircle,
  rejected: XCircle,
}

export default function AdminVerifyPage() {
  const qc = useQueryClient()
  const [tab, setTab]           = useState<VerifStatus | 'all'>('pending')
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<VerificationRequest | null>(null)
  const [notes, setNotes]       = useState('')
  const [acting, setActing]     = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications', tab, search],
    queryFn: () => apiClient.get('/admin/verifications/', {
      params: { ...(tab !== 'all' && { status: tab }), search },
    }).then((r) => r.data),
  })

  const requests: VerificationRequest[] = Array.isArray(data) ? data : (data?.results ?? [])

  const action = async (id: number, status: 'approved' | 'rejected') => {
    setActing(true)
    try {
      await apiClient.patch(`/admin/verifications/${id}/`, { status, notes })
      toast.success(`Request ${status}`)
      setSelected(null)
      setNotes('')
      qc.invalidateQueries({ queryKey: ['admin-verifications'] })
    } catch {
      toast.error('Action failed')
    } finally {
      setActing(false)
    }
  }

  const TABS: { id: VerifStatus | 'all'; label: string }[] = [
    { id: 'all',      label: 'All'      },
    { id: 'pending',  label: 'Pending'  },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verification Queue</h1>
        <p className="text-gray-500 mt-1">Review and approve engineer verification requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                tab === t.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No {tab !== 'all' ? tab : ''} requests</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                {['Engineer', 'Submitted', 'Documents', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {requests.map((req) => {
                const Icon = statusIcon[req.status]
                const docs = [
                  req.national_id_url && 'National ID',
                  req.certificate_url && 'Certificate',
                  req.license_url     && 'License',
                ].filter(Boolean)

                return (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{req.user.full_name}</p>
                      <p className="text-xs text-gray-400">{req.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {format(new Date(req.submitted_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {docs.map((d) => (
                          <span key={d} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <FileText className="w-3 h-3" />{d}
                          </span>
                        ))}
                        {docs.length === 0 && <span className="text-xs text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[req.status]}`}>
                        <Icon className="w-3 h-3" />{req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => { setSelected(req); setNotes('') }}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline">
                        <Eye className="w-3.5 h-3.5" />Review
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review Verification</h2>
              <p className="text-sm text-gray-500 mt-0.5">{selected.user.full_name} · {selected.user.email}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Documents */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Submitted Documents</p>
                <div className="space-y-2">
                  {[
                    { label: 'National ID / Passport', url: selected.national_id_url },
                    { label: 'Professional Certificate', url: selected.certificate_url },
                    { label: 'License', url: selected.license_url },
                  ].map(({ label, url }) => url ? (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-300 transition-colors group">
                      <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <FileText className="w-4 h-4 text-gray-400" />{label}
                      </span>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                    </a>
                  ) : null)}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Review Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note for the engineer…"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-between">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <div className="flex gap-2">
                <button onClick={() => action(selected.id, 'rejected')} disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors">
                  <ShieldX className="w-4 h-4" />Reject
                </button>
                <button onClick={() => action(selected.id, 'approved')} disabled={acting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                  <ShieldCheck className="w-4 h-4" />Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
