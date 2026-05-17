'use client'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { projectsApi } from '@/lib/api/projects'
import toast from 'react-hot-toast'
import { PlusCircle, Trash2, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Please provide at least 50 characters'),
  location:    z.string().min(2, 'Required'),
  budget_min:  z.coerce.number().min(1, 'Required'),
  budget_max:  z.coerce.number().min(1, 'Required'),
  deadline:    z.string().min(1, 'Required'),
  skills_req:  z.array(z.object({ value: z.string().min(1) })).min(1, 'Add at least one skill'),
  milestones:  z.array(z.object({
    title:       z.string().min(1, 'Required'),
    description: z.string().optional(),
    amount:      z.coerce.number().min(0),
    due_date:    z.string().min(1, 'Required'),
  })).optional(),
}).refine((d) => d.budget_max >= d.budget_min, {
  message: 'Max budget must be ≥ min budget',
  path: ['budget_max'],
})

type FormData = z.infer<typeof schema>

const inputCls = `w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition`

function Field({ label, error, children, hint }: {
  label: string; error?: string; children: React.ReactNode; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
      {hint  && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const SKILL_SUGGESTIONS = [
  'Structural Engineering', 'Civil Engineering', 'Electrical', 'Plumbing',
  'Mechanical', 'Architecture', 'Interior Design', 'Project Management',
  'Quantity Surveying', 'Landscaping', 'Steel Fabrication', 'Concrete Works',
]

export default function PostProjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      skills_req: [],
      milestones: [],
    },
  })

  const { fields: skillFields, append: addSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills_req' })
  const { fields: msFields,    append: addMs,    remove: removeMs }    = useFieldArray({ control, name: 'milestones' })

  const addSkillTag = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed) return
    const current = watch('skills_req').map((s) => s.value.toLowerCase())
    if (!current.includes(trimmed.toLowerCase())) addSkill({ value: trimmed })
    setSkillInput('')
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        skills_req: data.skills_req.map((s) => s.value),
      }
      const res = await projectsApi.create(payload as any)
      toast.success('Project posted successfully!')
      router.push(`/projects/${res.data.id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to post project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/projects" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post a Project</h1>
          <p className="text-gray-500 mt-1">Describe your project to attract qualified engineers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Project Details</h2>

          <Field label="Project Title" error={errors.title?.message} hint="Be specific — e.g. 'Residential Foundation Waterproofing in Westlands'">
            <input {...register('title')} placeholder="e.g. 3-bedroom house construction in Karen" className={inputCls} />
          </Field>

          <Field label="Description" error={errors.description?.message} hint="Describe scope, site conditions, deliverables, and any special requirements.">
            <textarea {...register('description')} rows={6} placeholder="Provide a detailed description of your project..." className={inputCls + ' resize-none'} />
          </Field>

          <Field label="Location" error={errors.location?.message}>
            <input {...register('location')} placeholder="e.g. Nairobi, Kenya" className={inputCls} />
          </Field>
        </div>

        {/* Budget & Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Budget & Timeline</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Minimum Budget (KES)" error={errors.budget_min?.message}>
              <input {...register('budget_min')} type="number" min="0" placeholder="500,000" className={inputCls} />
            </Field>
            <Field label="Maximum Budget (KES)" error={errors.budget_max?.message}>
              <input {...register('budget_max')} type="number" min="0" placeholder="1,200,000" className={inputCls} />
            </Field>
          </div>
          <Field label="Project Deadline" error={errors.deadline?.message}>
            <input {...register('deadline')} type="date" className={inputCls}
              min={new Date().toISOString().split('T')[0]} />
          </Field>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Required Skills</h2>
          {errors.skills_req?.message && (
            <p className="text-red-500 text-xs">{errors.skills_req.message}</p>
          )}
          {/* Tag input */}
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag(skillInput) } }}
              placeholder="Type a skill and press Enter"
              className={inputCls + ' flex-1'}
            />
            <button type="button" onClick={() => addSkillTag(skillInput)}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors">
              Add
            </button>
          </div>
          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {SKILL_SUGGESTIONS.filter(s => !watch('skills_req').map(f => f.value).includes(s)).slice(0, 8).map((s) => (
              <button key={s} type="button" onClick={() => addSkill({ value: s })}
                className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
                + {s}
              </button>
            ))}
          </div>
          {/* Tags */}
          {skillFields.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {skillFields.map((field, i) => (
                <span key={field.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 text-sm font-medium">
                  {field.value}
                  <button type="button" onClick={() => removeSkill(i)} className="hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Milestones <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
              <p className="text-xs text-gray-400 mt-0.5">Break payment into stages for better project control</p>
            </div>
            <button type="button" onClick={() => addMs({ title: '', description: '', amount: 0, due_date: '' })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              <PlusCircle className="w-4 h-4" /> Add Milestone
            </button>
          </div>

          {msFields.map((field, i) => (
            <div key={field.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3 relative">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestone {i + 1}</p>
                <button type="button" onClick={() => removeMs(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title" error={(errors.milestones?.[i] as any)?.title?.message}>
                  <input {...register(`milestones.${i}.title`)} placeholder="e.g. Foundation Complete" className={inputCls} />
                </Field>
                <Field label="Amount (KES)" error={(errors.milestones?.[i] as any)?.amount?.message}>
                  <input {...register(`milestones.${i}.amount`)} type="number" placeholder="150,000" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Due Date">
                  <input {...register(`milestones.${i}.due_date`)} type="date" className={inputCls} />
                </Field>
                <Field label="Description (optional)">
                  <input {...register(`milestones.${i}.description`)} placeholder="What's included?" className={inputCls} />
                </Field>
              </div>
            </div>
          ))}

          {msFields.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              No milestones added — the full payment will be released on completion.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <Link href="/projects" className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Post Project
          </button>
        </div>
      </form>
    </div>
  )
}
