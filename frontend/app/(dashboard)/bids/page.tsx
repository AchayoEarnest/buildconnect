'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Bid } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { DollarSign, Clock, ChevronRight, Inbox } from 'lucide-react'

const STATUS_TABS = ['all', 'pending', 'accepted', 'rejected'] as const
type StatusTab = typeof STATUS_TABS[number]

const statusStyle: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

export default function BidsPage() {
  const [tab, setTab] = useState<StatusTab>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['my-bids', tab],
    queryFn: () => apiClient.get('/bids/my/', {
      params: tab !== 'all' ? { status: tab } : {},
    }).then((r) => r.data),
  })

  const bids: (Bid & { project: any })[] = Array.isArray(data) ? data : (data?.results ?? [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bids</h1>
        <p className="text-gray-500 mt-1">Track all proposals you've submitted</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : bids.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-gray-500">No bids yet</p>
          <p className="text-sm text-gray-400 mt-1">Browse open projects and submit your first proposal.</p>
          <Link href="/projects" className="mt-4 text-brand-600 text-sm font-medium hover:underline">
            Browse Projects →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <Link key={bid.id} href={`/projects/${bid.project?.id ?? '#'}`}
              className="group flex items-start gap-5 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                      {bid.project?.title ?? 'Project'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {bid.project?.client?.company_name ?? bid.project?.client?.full_name ?? 'Client'} ·{' '}
                      {format(new Date(bid.submitted_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyle[bid.status]}`}>
                    {bid.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{bid.cover_letter}</p>

                <div className="flex items-center gap-5 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">${bid.amount.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {bid.timeline} day{bid.timeline !== 1 ? 's' : ''} delivery
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 shrink-0 mt-1 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
