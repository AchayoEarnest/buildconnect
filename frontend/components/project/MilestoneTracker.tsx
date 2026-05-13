'use client'
import { useState } from 'react'
import { Milestone } from '@/types'
import { CheckCircle, Clock, Lock, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { projectsApi } from '@/lib/api/projects'
import { apiClient } from '@/lib/api/client'
import toast from 'react-hot-toast'

interface Props {
  milestones: Milestone[]
  projectId: number
  isClient: boolean
  onUpdate?: () => void
}

export default function MilestoneTracker({ milestones, projectId, isClient, onUpdate }: Props) {
  const [releasing, setReleasing] = useState<number | null>(null)

  const releaseMilestone = async (milestoneId: number) => {
    setReleasing(milestoneId)
    try {
      await apiClient.post(`/payments/release/${milestoneId}/`)
      toast.success('Milestone payment released!')
      onUpdate?.()
    } catch {
      toast.error('Failed to release payment')
    } finally {
      setReleasing(null)
    }
  }

  const total    = milestones.reduce((s, m) => s + m.amount, 0)
  const released = milestones.filter((m) => m.is_released).reduce((s, m) => s + m.amount, 0)
  const progress = total > 0 ? (released / total) * 100 : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">Project Milestones</h3>
        <span className="text-sm text-gray-500">${released.toLocaleString()} / ${total.toLocaleString()} released</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-brand-600 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, idx) => (
          <div key={milestone.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              milestone.is_released
                ? 'border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10'
                : 'border-gray-100 dark:border-gray-800'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              milestone.is_released
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {milestone.is_released
                ? <CheckCircle className="w-4 h-4" />
                : <span className="text-xs font-bold">{idx + 1}</span>}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{milestone.title}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                </span>
                {milestone.is_released && milestone.released_at && (
                  <span className="text-green-600">Released {format(new Date(milestone.released_at), 'MMM d')}</span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                ${milestone.amount.toLocaleString()}
              </p>
              {isClient && !milestone.is_released && (
                <button
                  onClick={() => releaseMilestone(milestone.id)}
                  disabled={releasing === milestone.id}
                  className="mt-1 text-xs px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700
                             disabled:opacity-60 text-white font-medium transition-colors">
                  {releasing === milestone.id ? 'Releasing...' : 'Release'}
                </button>
              )}
              {!isClient && !milestone.is_released && (
                <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Lock className="w-3 h-3" />In escrow
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
