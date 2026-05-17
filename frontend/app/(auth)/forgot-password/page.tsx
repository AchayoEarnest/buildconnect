'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import { HardHat, Loader2, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormData) => {
    setLoading(true)
    try {
      await apiClient.post('/auth/password-reset/', { email })
      setSent(true)
    } catch {
      // Always show success to prevent email enumeration
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">BuildConnect</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-brand-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Check your inbox</h1>
              <p className="text-sm text-gray-500 mt-2">
                If <span className="font-medium text-gray-700 dark:text-gray-300">{getValues('email')}</span> is registered, you'll receive a reset link within a few minutes.
              </p>
              <p className="text-xs text-gray-400 mt-3">Don't see it? Check your spam folder.</p>
              <Link href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm text-brand-600 hover:underline font-medium">
                <ArrowLeft className="w-4 h-4" />Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
                <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send Reset Link
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <ArrowLeft className="w-4 h-4" />Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
