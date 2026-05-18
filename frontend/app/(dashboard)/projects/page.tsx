'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/authStore'
import { projectsApi } from '@/lib/api/projects'
import ProjectCard from '@/components/project/ProjectCard'
import { Project } from '@/types'
import Link from 'next/link'
import { Search, PlusCircle, FolderOpen } from 'lucide-react'

const STATUS_TABS = ['all', 'open', 'in_progress', 'completed', 'cancelled'] as const
type StatusTab = typeof STATUS_TABS[number]

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const isClient = user?.role === 'client'

  const [tab, setTab]       = useState<StatusTab>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['projects', tab, search, user?.role],
    queryFn: () =>
      projectsApi.list({
        ...(tab !== 'all' && { status: tab }),
        ...(search && { search }),
        // For clients, show only their own projects
        ...(isClient && { mine: 'true' }),
      }).then((r) => r.data),
  })

  const projects: Project[] = Array.isArray(data) ? data : (data?.results ?? [])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isClient ? 'My Projects' : 'Browse Projects'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isClient
              ? 'Manage your posted projects'
              : 'Find and bid on construction projects'}
          </p>
        </div>
        {isClient && (
          <Link
            href="/projects/post"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Post Project
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by title, skill, or location..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium text-gray-500">No projects found</p>
          <p className="text-sm text-gray-400 mt-1">
            {isClient ? 'Post your first project to get started.' : 'Try adjusting your filters.'}
          </p>
          {isClient && (
            <Link
              href="/projects/post"
              className="mt-4 text-brand-600 text-sm font-medium hover:underline"
            >
              Post a Project →
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data?.count ?? projects.length} projects</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
