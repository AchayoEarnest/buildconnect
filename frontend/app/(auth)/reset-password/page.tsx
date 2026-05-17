'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { HardHat, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  new_password: z.string().min(8, 'At least 8 characters'),
  confirm:      z.string(),
}).refine((d) => d.new_password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const params   = useSearchParams()
  const router   = useRouter()
  const token    = params.get('token')
  const uid      = params.get('uid')
  const [done, setDone]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ new_password }: FormData) => {
    if (!token || !uid) { setError('Invalid reset link.'); return }
    setLoading(true)
    setError('')
    try {
      await apiClient.post('/auth/password-reset/confirm/', { token, uid, new_password })
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 dark:border-gray-700
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">BuildConnect</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Password reset!</h1>
              <p className="text-sm text-gray-500 mt-2">Your password has been updated. Redirecting to login…</p>
              <Link href="/login" className="mt-5 inline-block text-sm text-brand-600 hover:underline font-medium">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set new password</h1>
                <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input {...register('new_password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className={inputCls} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input {...register('confirm')} type={showCf ? 'text' : 'password'} placeholder="••••••••" className={inputCls} />
                    <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
