import { Star } from 'lucide-react'

interface Props {
  rating: number   // 0–5
  size?: 'sm' | 'md'
  showValue?: boolean
}

export default function StarRating({ rating, size = 'sm', showValue = true }: Props) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${starSize} ${
            n <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
          }`}
        />
      ))}
      {showValue && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}
