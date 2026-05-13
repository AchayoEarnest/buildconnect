'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Review } from '@/types'
import StarRating from './StarRating'
import { format } from 'date-fns'

export default function ReviewList({ engineerSlug }: { engineerSlug: string }) {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', engineerSlug],
    queryFn: () => apiClient.get(`/engineers/${engineerSlug}/reviews/`).then((r) => r.data),
  })

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
  ))}</div>

  if (reviews.length === 0) return (
    <p className="text-gray-400 text-sm text-center py-8">No reviews yet.</p>
  )

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4 pb-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              {review.client_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm text-gray-900 dark:text-white">{review.client_name}</span>
              <span className="text-xs text-gray-400">{format(new Date(review.created_at), 'MMM yyyy')}</span>
            </div>
            <StarRating value={review.rating} size="sm" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
