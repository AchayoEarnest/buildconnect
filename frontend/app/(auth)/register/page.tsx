'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/hooks/useAuth'
import toast from 'react-hot-toast'
import { HardHat, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  first_name: z.string().min(2, 'First name required'),
  last_name:  z.string().min(2, 'Last name required'),
  email:      z.string().email('Invalid email'),
  role:       z.enum(['engineer', 'client']),
  password:   z.string().min(8, 'Minimum 8 characters'),
  password2:  z.string(),
}).refine((d) => d.password === d.password2, {
  message: 'Passwords do not match', path: ['password2'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: doRegister } = useAuth()
  const router   = useRouter()
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' },
  })

  const role = watch('role')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await doRegister(data)
      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white
    dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm
    focus:outline-none focus:ring-2 focus:ring-brand-500 transition`

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join BuildConnect</h1>
          <p className="text-gray-500 mt-2">Create your professional account</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['engineer', 'client'] as const).map((r) => (
              <label key={r}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  role === r
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}>
                <input {...register('role')} type="radio" value={r} className="sr-only" />
                <span className="text-2xl">{r === 'engineer' ? '🏗️' : '🏢'}</span>
                <span className="font-medium text-sm capitalize text-gray-900 dark:text-white">{r}</span>
                <span className="text-xs text-gray-400 text-center">
                  {r === 'engineer' ? 'Offer services & build your portfolio' : 'Hire engineers & post projects'}
                </span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input {...register('first_name')} placeholder="First name" className={inputCls} />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <input {...register('last_name')} placeholder="Last name" className={inputCls} />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <input {...register('email')} type="email" placeholder="Email address" className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="relative">
              <input {...register('password')} type={showPw ? 'text' : 'password'}
                placeholder="Password (min 8 characters)" className={`${inputCls} pr-12`} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <input {...register('password2')} type="password" placeholder="Confirm password" className={inputCls} />
              {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold transition-colors">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
