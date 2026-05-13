'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { profilesApi } from '@/lib/api/profiles'
import EngineerCard from '@/components/engineer/EngineerCard'
import FilterPanel from '@/components/search/FilterPanel'
import { EngineerProfile } from '@/types'
import { Search } from 'lucide-react'

export default function EngineersPage() {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [search, setSearch]   = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['engineers', filters, search],
    queryFn: () => profilesApi.listEngineers({ ...filters, search }),
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Engineers</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Connect with certified construction professionals
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, skill, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <FilterPanel filters={filters} onChange={setFilters} />
        </aside>
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{data?.count ?? 0} engineers found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.results.map((engineer: EngineerProfile) => (
                  <EngineerCard key={engineer.id} engineer={engineer} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
