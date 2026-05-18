'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/authStore'
import { projectsApi } from '@/lib/api/projects'
import BidForm from '@/components/project/BidForm'
import MilestoneTracker from '@/components/project/MilestoneTracker'
import { Project, Bid } from '@/types'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  MapPin, Calendar, DollarSign, Tag, Users, ChevronLeft,
  Clock, CheckCircle, XCircle, Briefcase, Trash2
} from 'lucide-react'

const statusStyle: Record<string, string> = {
  open:        'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  completed:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

const bidStatusStyle: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const projectId = parseInt(params.id, 10)

  const { data: project, isLoading, isError } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId).then((r) => r.data),
  })

  const isOwner = user?.role === 'client' && project?.client?.id === (user as any)?.profile_id
  const isEngineer = user?.role === 'engineer'
  const canBid = isEngineer && project?.status === 'open'

  const { data: bids } = useQuery<Bid[]>({
    queryKey: ['project-bids', projectId],
    queryFn: () => projectsApi.getBids(projectId).then((r) => r.data),
    enabled: isOwner || isEngineer,
  })

  const updateBidStatus = async (bidId: number, status: 'accepted' | 'rejected') => {
    try {
      await projectsApi.updateBid(bidId, status)
      toast.success(`Bid ${status}`)
      qc.invalidateQueries({ queryKey: ['project-bids', projectId] })
      qc.invalidateQueries({ queryKey: ['project', projectId] })
    } catch {
      toast.error('Action failed')
    }
  }

  const deleteProject = async () => {
    if (!confirm('Permanently delete this project?')) return
    try {
      await projectsApi.delete(projectId)
      toast.success('Project deleted')
      router.push('/projects')
    } catch {
      toast.error('Delete failed')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-10 w-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    )
  }

  if (isError || !project) return notFound()

  const bidsArr: Bid[] = Array.isArray(bids) ? bids : (bids as any)?.results ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
        <ChevronLeft className="w-4 h-4" />Back to Projects
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[project.status]}`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-400">
                Posted {format(new Date(project.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              by {project.client?.company_name || project.client?.full_name}
            </p>
          </div>
          {isOwner && (
            <button onClick={deleteProject}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors">
              <Trash2 className="w-4 h-4" />Delete
            </button>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-5 mt-5 pt-5 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4 text-green-500" />
            KES {project.budget_min.toLocaleString()} – {project.budget_max.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-blue-500" />
            Deadline: {format(new Date(project.deadline), 'MMM d, yyyy')}
          </div>
          {project.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-rose-500" />
              {project.location}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 text-purple-500" />
            {project.bid_count ?? bidsArr.length} bid{(project.bid_count ?? bidsArr.length) !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {project.description}
        </p>

        {/* Skills */}
        {project.skills_req?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-3">
              <Tag className="w-3.5 h-3.5" />Skills Required
            </p>
            <div className="flex flex-wrap gap-2">
              {project.skills_req.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Milestones</h2>
          <MilestoneTracker
            milestones={project.milestones}
            projectId={project.id}
            isClient={isOwner}
          />
        </div>
      )}

      {/* Bid form for engineers */}
      {canBid && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-600" />Submit a Proposal
          </h2>
          <BidForm
            projectId={project.id}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['project-bids', projectId] })
              qc.invalidateQueries({ queryKey: ['project', projectId] })
            }}
          />
        </div>
      )}

      {/* Bids list */}
      {(isOwner || isEngineer) && bidsArr.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            {isOwner ? 'Received Proposals' : 'All Proposals'}
            <span className="ml-2 text-sm font-normal text-gray-400">({bidsArr.length})</span>
          </h2>

          <div className="space-y-4">
            {bidsArr.map((bid) => (
              <div key={bid.id}
                className="border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-brand-100 dark:hover:border-brand-800 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {bid.engineer?.full_name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <Link href={`/engineers/${bid.engineer?.slug}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 transition-colors">
                        {bid.engineer?.full_name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {bid.engineer?.title} · {format(new Date(bid.submitted_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${bidStatusStyle[bid.status]}`}>
                      {bid.status}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                      <DollarSign className="w-3.5 h-3.5 text-green-500" />
                      {bid.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {bid.timeline} days
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed line-clamp-3">
                  {bid.cover_letter}
                </p>

                {/* Client actions */}
                {isOwner && bid.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => updateBidStatus(bid.id, 'accepted')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />Accept
                    </button>
                    <button onClick={() => updateBidStatus(bid.id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors">
                      <XCircle className="w-3.5 h-3.5" />Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
