'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/projects'
import { useAuthStore } from '@/lib/store/authStore'
import BidForm from '@/components/project/BidForm'
import MilestoneTracker from '@/components/project/MilestoneTracker'
import { MapPin, Calendar, DollarSign, Users, Tag } from 'lucide-react'
import { format } from 'date-fns'

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { user }   = useAuthStore()
  const qc         = useQueryClient()
  const projectId  = parseInt(params.id)

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId).then((r) => r.data),
  })

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  )
  if (!project) return null

  const isClient   = user?.role === 'client' && project.client?.full_name === user?.full_name
  const isEngineer = user?.role === 'engineer'
  const hasBid     = project.bids?.some((b: any) => b.engineer?.user === user?.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
            <p className="text-gray-500 mt-1">Posted by {project.client?.company_name || project.client?.full_name}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
            project.status === 'open' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
            project.status === 'in_progress' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: DollarSign, label: 'Budget', value: `$${project.budget_min.toLocaleString()} – $${project.budget_max.toLocaleString()}`, color: 'text-green-500' },
            { icon: Calendar,   label: 'Deadline', value: format(new Date(project.deadline), 'MMM d, yyyy'), color: 'text-brand-500' },
            { icon: MapPin,     label: 'Location', value: project.location || 'Remote', color: 'text-red-400' },
            { icon: Users,      label: 'Bids',     value: `${project.bids?.length ?? 0} proposals`, color: 'text-purple-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-start gap-2.5">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Project Description</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </section>

          {/* Required Skills */}
          {project.skills_req?.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-500" />Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.skills_req.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <MilestoneTracker
              milestones={project.milestones}
              projectId={projectId}
              isClient={isClient}
              onUpdate={() => qc.invalidateQueries({ queryKey: ['project', projectId] })}
            />
          )}

          {/* Bid Form (engineers only, open projects) */}
          {isEngineer && project.status === 'open' && !hasBid && (
            <BidForm projectId={projectId} onSuccess={() => qc.invalidateQueries({ queryKey: ['project', projectId] })} />
          )}
        </div>

        {/* Bids sidebar (client view) */}
        {isClient && project.bids && project.bids.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Proposals ({project.bids.length})
            </h3>
            {project.bids.map((bid: any) => (
              <div key={bid.id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{bid.engineer?.full_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{bid.engineer?.specialization}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">${bid.amount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">{bid.cover_letter}</p>
                <p className="text-xs text-gray-400 mt-2">{bid.timeline} days delivery</p>
                {bid.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => projectsApi.updateBid(bid.id, 'accepted').then(() => qc.invalidateQueries({ queryKey: ['project', projectId] }))}
                      className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors">
                      Accept
                    </button>
                    <button onClick={() => projectsApi.updateBid(bid.id, 'rejected').then(() => qc.invalidateQueries({ queryKey: ['project', projectId] }))}
                      className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Decline
                    </button>
                  </div>
                )}
                {bid.status !== 'pending' && (
                  <span className={`mt-3 inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    bid.status === 'accepted'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>{bid.status}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
