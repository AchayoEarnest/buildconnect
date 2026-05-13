'use client'
import Link from 'next/link'
import { EngineerProfile } from '@/types'
import StarRating from '@/components/shared/StarRating'
import VerificationBadge from '@/components/engineer/VerificationBadge'
import { MapPin, Clock } from 'lucide-react'

interface Props {
  engineer: EngineerProfile
}

export default function EngineerCard({ engineer }: Props) {
  const availColor: Record<string, string> = {
    available:   'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    busy:        'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    unavailable: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <Link href={`/engineers/${engineer.slug}`}
      className="group block bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100
                 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-200
                 dark:hover:border-brand-700 transition-all duration-200">
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <img
            src={engineer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(engineer.full_name)}&size=56&background=2563eb&color=fff`}
            alt={engineer.full_name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          {engineer.is_verified && (
            <VerificationBadge className="absolute -bottom-1.5 -right-1.5 scale-75" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                {engineer.full_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">{engineer.title}</p>
            </div>
            {engineer.hourly_rate && (
              <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                ${engineer.hourly_rate}/hr
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{engineer.location_city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />{engineer.years_exp} yrs
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <StarRating value={engineer.avg_rating} size="sm" />
          <span className="text-xs text-gray-400">({engineer.review_count})</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${availColor[engineer.availability]}`}>
          {engineer.availability}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {engineer.skills.slice(0, 4).map((skill) => (
          <span key={skill.id}
            className="text-xs px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {skill.name}
          </span>
        ))}
        {engineer.skills.length > 4 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-400">
            +{engineer.skills.length - 4}
          </span>
        )}
      </div>
    </Link>
  )
}
