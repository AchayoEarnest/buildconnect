'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { projectsApi } from '@/lib/api/projects'
import toast from 'react-hot-toast'

const schema = z.object({
  amount:       z.number({ invalid_type_error: 'Enter a valid amount' }).positive('Amount must be positive'),
  timeline:     z.number({ invalid_type_error: 'Enter days' }).int().positive(),
  cover_letter: z.string().min(100, 'Proposal must be at least 100 characters'),
})
type FormData = z.infer<typeof schema>

interface Props {
  projectId: number
  onSuccess?: () => void
}

export default function BidForm({ projectId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await projectsApi.submitBid(projectId, data)
      toast.success('Bid submitted successfully!')
      reset()
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit bid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Submit a Proposal</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Bid Amount (USD)</label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number" placeholder="5000"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Timeline (days)</label>
            <input
              {...register('timeline', { valueAsNumber: true })}
              type="number" placeholder="30"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.timeline && <p className="text-red-500 text-xs mt-1">{errors.timeline.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Cover Letter / Proposal</label>
          <textarea
            {...register('cover_letter')}
            rows={5}
            placeholder="Describe your approach, relevant experience, and why you're the best fit for this project..."
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          {errors.cover_letter && <p className="text-red-500 text-xs mt-1">{errors.cover_letter.message}</p>}
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                     text-white font-semibold text-sm transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </div>
  )
}
