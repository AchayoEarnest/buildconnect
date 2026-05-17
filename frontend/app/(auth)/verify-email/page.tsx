'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Status = 'loading' | 'success' | 'error' | 'expired'

export default function VerifyEmailPage() {
  const params   = useSearchParams()
  const router   = useRouter()
  const token    = params.get('token')
  const uid      = params.get('uid')
  const [status, setStatus] = useState<Status>('loading')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!token || !uid) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        await apiClient.post('/auth/verify-email/', { token, uid })
        setStatus('success')
      } catch (err: any) {
        const code = err?.response?.data?.code
        setStatus(code === 'token_expired' ? 'expired' : 'error')
      }
    }

    verify()
  }, [token, uid])

  // Auto-redirect after success
  useEffect(() => {
    if (status !== 'success') return
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval)
          router.push('/feed')
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status, router])

  const resend = async () => {
    try {
      await apiClient.post('/auth/resend-verification/')
      alert('A new verification email has been sent. Please check your inbox.')
    } catch {
      alert('Failed to resend. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 max-w-md w-full text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 text-brand-600 animate-spin mx-auto mb-5" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your email…</h1>
            <p className="text-gray-400 text-sm mt-2">Please wait while we confirm your address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Email Verified!</h1>
            <p className="text-gray-500 text-sm mt-2">
              Your email has been confirmed. You'll be redirected to your dashboard in {countdown}s.
            </p>
            <Link href="/feed"
              className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-9 h-9 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Link Expired</h1>
            <p className="text-gray-500 text-sm mt-2">
              This verification link has expired. Request a new one below.
            </p>
            <button onClick={resend}
              className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
              Resend Verification Email
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Verification Failed</h1>
            <p className="text-gray-500 text-sm mt-2">
              The link is invalid or has already been used. Try logging in or request a new link.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/login"
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
                Back to Login
              </Link>
              <button onClick={resend} className="text-sm text-brand-600 hover:underline">
                Resend verification email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
