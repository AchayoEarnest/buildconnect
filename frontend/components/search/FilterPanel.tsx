'use client'

const SPECIALIZATIONS = [
  { value: '', label: 'All Specializations' },
  { value: 'civil', label: 'Civil Engineering' },
  { value: 'structural', label: 'Structural Engineering' },
  { value: 'mechanical', label: 'Mechanical Engineering' },
  { value: 'electrical', label: 'Electrical Engineering' },
  { value: 'quantity_surveyor', label: 'Quantity Surveying' },
  { value: 'architect', label: 'Architecture' },
  { value: 'geotechnical', label: 'Geotechnical Engineering' },
  { value: 'environmental', label: 'Environmental Engineering' },
  { value: 'project_manager', label: 'Project Management' },
]

const AVAILABILITY = [
  { value: '', label: 'Any Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' },
]

interface Props {
  filters: Record<string, string>
  onChange: (f: Record<string, string>) => void
}

export default function FilterPanel({ filters, onChange }: Props) {
  const set = (key: string, value: string) =>
    onChange({ ...filters, [key]: value })

  const clear = () => onChange({})

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Filters</h3>
        <button onClick={clear} className="text-xs text-brand-600 hover:underline">Clear all</button>
      </div>

      {/* Specialization */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Specialization</label>
        <select
          value={filters.specialization || ''}
          onChange={(e) => set('specialization', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {SPECIALIZATIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Availability</label>
        <div className="space-y-1.5">
          {AVAILABILITY.map((a) => (
            <label key={a.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="availability"
                value={a.value}
                checked={(filters.availability || '') === a.value}
                onChange={() => set('availability', a.value)}
                className="accent-brand-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {a.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Hourly Rate */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Hourly Rate (USD)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_rate || ''}
            onChange={(e) => set('min_rate', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_rate || ''}
            onChange={(e) => set('max_rate', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Minimum Rating</label>
        <div className="space-y-1.5">
          {[4, 3, 2, 0].map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="min_rating"
                value={r}
                checked={(filters.min_rating || '0') === String(r)}
                onChange={() => set('min_rating', String(r))}
                className="accent-brand-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {r === 0 ? 'Any rating' : `${r}★ & above`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Verified only */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.is_verified === 'true'}
            onChange={(e) => set('is_verified', e.target.checked ? 'true' : '')}
            className="accent-brand-600 w-4 h-4"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Verified engineers only</span>
        </label>
      </div>

      {/* Min Experience */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          Min Experience: {filters.min_exp || 0} yrs
        </label>
        <input
          type="range" min="0" max="30" step="1"
          value={filters.min_exp || 0}
          onChange={(e) => set('min_exp', e.target.value)}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span><span>30 yrs</span>
        </div>
      </div>
    </div>
  )
}
