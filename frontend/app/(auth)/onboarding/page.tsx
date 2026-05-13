'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/lib/store/authStore'
import { apiClient } from '@/lib/api/client'
import toast from 'react-hot-toast'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const SPECIALIZATIONS = [
  'civil','structural','mechanical','electrical',
  'quantity_surveyor','architect','geotechnical','environmental','project_manager',
]

const SKILLS_LIST = [
  'AutoCAD','Revit','SketchUp','SAP2000','STAAD.Pro','Primavera P6',
  'MS Project','Tekla','ArchiCAD','ETABS','BIM','Civil 3D','GIS',
  'Quantity Takeoff','Cost Estimation','Site Supervision','Structural Analysis',
  'Foundation Design','Road Design','Drainage Design','Contract Management',
]

export default function OnboardingPage() {
  const { user } = useAuthStore()
  const router   = useRouter()
  const [step, setStep] = useState(1)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const totalSteps = user?.role === 'engineer' ? 3 : 2

  const { register, handleSubmit, getValues } = useForm({
    defaultValues: {
      title: '', specialization: 'civil', bio: '',
      years_exp: 0, hourly_rate: '', location_city: '', location_country: '',
      company_name: '', industry: '', location: '',
    },
  })

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )

  const onFinish = async () => {
    setLoading(true)
    const vals = getValues()
    try {
      if (user?.role === 'engineer') {
        await apiClient.post('/profiles/engineer/setup/', {
          ...vals, skills: selectedSkills,
        })
      } else {
        await apiClient.post('/profiles/client/setup/', vals)
      }
      toast.success('Profile set up! Welcome to BuildConnect.')
      router.push('/feed')
    } catch {
      toast.error('Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white
    dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500`

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          {/* Step 1 – Basic info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.role === 'engineer' ? '🏗️ Professional Info' : '🏢 Company Info'}
              </h2>
              {user?.role === 'engineer' ? (
                <>
                  <input {...register('title')} placeholder="e.g. Senior Civil Engineer" className={inputCls} />
                  <select {...register('specialization')} className={inputCls}>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                    ))}
                  </select>
                  <input {...register('years_exp')} type="number" placeholder="Years of experience" className={inputCls} />
                  <input {...register('hourly_rate')} type="number" placeholder="Hourly rate (USD, optional)" className={inputCls} />
                </>
              ) : (
                <>
                  <input {...register('company_name')} placeholder="Company name (optional)" className={inputCls} />
                  <input {...register('industry')} placeholder="Industry e.g. Real Estate, Government" className={inputCls} />
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input {...register('location_city')} placeholder="City" className={inputCls} />
                <input {...register('location_country')} placeholder="Country" className={inputCls} />
              </div>
            </div>
          )}

          {/* Step 2 – Bio */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">✍️ Tell your story</h2>
              <textarea
                {...register('bio')}
                rows={7}
                placeholder={user?.role === 'engineer'
                  ? "Describe your background, key projects, and what makes you exceptional as an engineer..."
                  : "Describe your company, the types of projects you work on, and what you're looking for..."}
                className={`${inputCls} resize-none`}
              />
              <p className="text-xs text-gray-400">A strong profile increases your visibility by up to 3×</p>
            </div>
          )}

          {/* Step 3 – Skills (engineer only) */}
          {step === 3 && user?.role === 'engineer' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🛠️ Your Skills</h2>
              <p className="text-sm text-gray-500">Select all that apply</p>
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto">
                {SKILLS_LIST.map((skill) => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>
                    {skill}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">{selectedSkills.length} skills selected</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep((s) => s - 1)} disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                         text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />Back
            </button>
            {step < totalSteps ? (
              <button onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
                Continue<ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={onFinish} disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                {loading ? 'Saving...' : 'Finish Setup'}<ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
