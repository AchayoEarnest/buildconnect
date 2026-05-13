'use client'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/authStore'
import { projectsApi } from '@/lib/api/projects'
import { profilesApi } from '@/lib/api/profiles'
import ProjectCard from '@/components/project/ProjectCard'
import EngineerCard from '@/components/engineer/EngineerCard'
import Link from 'next/link'
import { ArrowRight, Briefcase, Users, TrendingUp } from 'lucide-react'

export default function FeedPage() {
  const { user } = useAuthStore()
  const isEngineer = user?.role === 'engineer'

  const { data: projects } = useQuery({
    queryKey: ['feed-projects'],
    queryFn: () => projectsApi.list({ status: 'open' }).then((r) => r.data),
    enabled: isEngineer,
  })

  const { data: engineers } = useQuery({
    queryKey: ['feed-engineers'],
    queryFn: () => profilesApi.listEngineers({ ordering: '-avg_rating' }).then((r) => r.data),
    enabled: !isEngineer,
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-7 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-brand-100 mt-1">
          {isEngineer
            ? 'Discover new projects matching your skills'
            : 'Find the right engineer for your project'}
        </p>
        <div className="flex gap-3 mt-5">
          <Link href={isEngineer ? '/projects' : '/engineers'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-colors">
            {isEngineer ? <><Briefcase className="w-4 h-4" />Browse Projects</> : <><Users className="w-4 h-4" />Find Engineers</>}
          </Link>
          <Link href={isEngineer ? '/analytics' : '/projects/post'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
            {isEngineer ? <><TrendingUp className="w-4 h-4" />Analytics</> : '+ Post a Project'}
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {isEngineer ? [
          { label: 'Open Projects', value: projects?.count ?? '—', href: '/projects' },
          { label: 'My Active Bids', value: '—', href: '/bids' },
          { label: 'Profile Views', value: '—', href: '/analytics' },
        ] : [
          { label: 'Engineers Available', value: engineers?.count ?? '—', href: '/engineers' },
          { label: 'My Projects', value: '—', href: '/projects' },
          { label: 'Active Conversations', value: '—', href: '/messages' },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800
                       hover:border-brand-200 dark:hover:border-brand-700 transition-colors">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEngineer ? 'Latest Projects' : 'Top Engineers'}
          </h2>
          <Link href={isEngineer ? '/projects' : '/engineers'}
            className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isEngineer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects?.results?.slice(0, 4).map((p: any) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {engineers?.results?.slice(0, 4).map((e: any) => (
              <EngineerCard key={e.id} engineer={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
