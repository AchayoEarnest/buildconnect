'use client'
import { useState } from 'react'
import { PortfolioProject } from '@/types'
import { X, ChevronLeft, ChevronRight, FileText, Play } from 'lucide-react'

interface Props {
  projects: PortfolioProject[]
}

export default function PortfolioGrid({ projects }: Props) {
  const [selected, setSelected] = useState<PortfolioProject | null>(null)
  const [mediaIdx, setMediaIdx] = useState(0)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => { setSelected(project); setMediaIdx(0) }}
            className="group text-left rounded-xl overflow-hidden border border-gray-100
                       dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-700
                       transition-all hover:shadow-md"
          >
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
              {project.cover_image ? (
                <img src={project.cover_image} alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0
                              group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{project.title}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{project.location} · {project.completed}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {selected.media.length > 0 && (
              <div className="relative">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                  <img src={selected.media[mediaIdx]?.url} alt=""
                    className="w-full h-full object-cover" />
                </div>
                {selected.media.length > 1 && (
                  <>
                    <button onClick={() => setMediaIdx((i) => (i - 1 + selected.media.length) % selected.media.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setMediaIdx((i) => (i + 1) % selected.media.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {selected.media.map((_, i) => (
                        <button key={i} onClick={() => setMediaIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${i === mediaIdx ? 'bg-white' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="p-5">
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{selected.description}</p>
              <div className="flex gap-4 mt-4 text-xs text-gray-400">
                {selected.location && <span>📍 {selected.location}</span>}
                {selected.client_name && <span>🏢 {selected.client_name}</span>}
                {selected.value && <span>💰 ${selected.value.toLocaleString()}</span>}
                <span>📅 {selected.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
