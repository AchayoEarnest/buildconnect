'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/projects'
import ProjectCard from '@/components/project/ProjectCard'
import { useAuthStore } from '@/lib/store/authStore'
import Link from 'next/link'
import { Search, PlusCircle } from 'lucide-react'
import { Project } from '@/types'

const STATUS_TABS = ['all', 'open', 'in_progress', 'completed']

export default function ProjectsPage() {
  const { user }     = useAuthStore()
  const [tab, setTab]   = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['projects', tab, search],
    queryFn: () => projectsApi.list({
      ...(tab !== 'all' && { status: tab }),
      ...(search && { search }),
    }).then((r) => r.data),
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'client' ? 'My Projects' : 'Browse Projects'}
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.role === 'client' ? 'Manage your posted projects' : 'Find projects matching your skills'}
          </p>
        </div>
        {user?.role === 'client' && (
          <Link href="/projects/post"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors">
            <PlusCircle className="w-4 h-4" /> Post Project
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'
            }`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.results?.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {data?.results?.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <p className="text-lg">No projects found</p>
              {user?.role === 'client' && (
                <Link href="/projects/post" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
                  Post your first project →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
