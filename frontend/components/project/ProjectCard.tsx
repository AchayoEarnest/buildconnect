'use client'
import Link from 'next/link'
import { Project } from '@/types'
import { MapPin, Calendar, DollarSign, Tag, Users } from 'lucide-react'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  open:        'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  completed:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled:   'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}
      className="group block bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100
                 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-200
                 dark:hover:border-brand-700 transition-all duration-200">

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-1">
          {project.title}
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${statusColors[project.status]}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
        {project.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <DollarSign className="w-3.5 h-3.5 text-green-500" />
          ${project.budget_min.toLocaleString()} – ${project.budget_max.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 text-brand-500" />
          {format(new Date(project.deadline), 'MMM d, yyyy')}
        </div>
        {project.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            {project.location}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          {project.bid_count ?? 0} bid{project.bid_count !== 1 ? 's' : ''}
        </div>
      </div>

      {project.skills_req?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
          {project.skills_req.slice(0, 4).map((skill) => (
            <span key={skill}
              className="text-xs px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {skill}
            </span>
          ))}
          {project.skills_req.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-400">
              +{project.skills_req.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
