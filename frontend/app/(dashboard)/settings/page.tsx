'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/lib/store/authStore'
import { apiClient } from '@/lib/api/client'
import { authApi } from '@/lib/api/auth'
import toast from 'react-hot-toast'
import { User, Lock, Bell, Shield, Camera, Loader2, Eye, EyeOff } from 'lucide-react'

// ─── Schemas ─────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  email:      z.string().email('Invalid email'),
})

const passwordSchema = z.object({
  old_password:  z.string().min(1, 'Required'),
  new_password:  z.string().min(8, 'At least 8 characters'),
  confirm:       z.string(),
}).refine((d) => d.new_password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

const notifSchema = z.object({
  email_new_bid:       z.boolean(),
  email_bid_accepted:  z.boolean(),
  email_new_message:   z.boolean(),
  email_project_update:z.boolean(),
  push_enabled:        z.boolean(),
})

type ProfileForm   = z.infer<typeof profileSchema>
type PasswordForm  = z.infer<typeof passwordSchema>
type NotifForm     = z.infer<typeof notifSchema>

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'account' | 'security' | 'notifications' | 'verification'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'account',       label: 'Account',       icon: User  },
  { id: 'security',      label: 'Security',       icon: Lock  },
  { id: 'notifications', label: 'Notifications',  icon: Bell  },
  { id: 'verification',  label: 'Verification',   icon: Shield},
]

// ─── Helper ───────────────────────────────────────────────────────────────────
function SectionCard({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls = `w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition`

// ─── Account Tab ──────────────────────────────────────────────────────────────
function AccountTab() {
  const { user, updateUser } = useAuthStore()
  const [saving, setSaving]  = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', email: user?.email ?? '' },
  })

  const onSave = async (data: ProfileForm) => {
    setSaving(true)
    try {
      const res = await apiClient.patch('/auth/me/', data)
      updateUser(res.data)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const res = await apiClient.patch('/auth/me/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateUser(res.data)
      toast.success('Avatar updated')
    } catch {
      toast.error('Upload failed')
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.first_name?.charAt(0) ?? '?'}
            </div>
            <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" /> : <Camera className="w-3.5 h-3.5 text-gray-500" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP, max 5MB</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal Information" description="Update your name and email address.">
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" error={errors.first_name?.message}>
              <input {...register('first_name')} className={inputCls} />
            </Field>
            <Field label="Last Name" error={errors.last_name?.message}>
              <input {...register('last_name')} className={inputCls} />
            </Field>
          </div>
          <Field label="Email Address" error={errors.email?.message}>
            <input {...register('email')} type="email" className={inputCls} />
          </Field>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Danger Zone" description="Permanently delete your account and all associated data.">
        <button
          onClick={() => toast.error('Please contact support to delete your account.')}
          className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          Delete Account
        </button>
      </SectionCard>
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [saving, setSaving] = useState(false)
  const [show, setShow]     = useState({ old: false, new: false, confirm: false })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSave = async (data: PasswordForm) => {
    setSaving(true)
    try {
      await apiClient.post('/auth/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully')
      reset()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const PasswordInput = ({ name, label, visible, onToggle, error }: {
    name: keyof PasswordForm; label: string; visible: boolean; onToggle: () => void; error?: string
  }) => (
    <Field label={label} error={error}>
      <div className="relative">
        <input {...register(name)} type={visible ? 'text' : 'password'} className={inputCls + ' pr-12'} />
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  )

  return (
    <div className="space-y-6">
      <SectionCard title="Change Password" description="Choose a strong password you don't use elsewhere.">
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 max-w-md">
          <PasswordInput name="old_password" label="Current Password" visible={show.old} onToggle={() => setShow(s => ({ ...s, old: !s.old }))} error={errors.old_password?.message} />
          <PasswordInput name="new_password" label="New Password"     visible={show.new} onToggle={() => setShow(s => ({ ...s, new: !s.new }))} error={errors.new_password?.message} />
          <PasswordInput name="confirm"       label="Confirm Password" visible={show.confirm} onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))} error={errors.confirm?.message} />
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Active Sessions" description="Devices currently logged into your account.">
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'Nairobi, KE', current: true, time: 'Active now' },
            { device: 'Safari on iPhone',  location: 'Nairobi, KE', current: false, time: '2 hours ago' },
          ].map((s) => (
            <div key={s.device} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{s.device}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.location} · {s.time}</p>
              </div>
              {s.current
                ? <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-medium">Current</span>
                : <button className="text-xs text-red-500 hover:underline">Revoke</button>}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit } = useForm<NotifForm>({
    defaultValues: {
      email_new_bid: true, email_bid_accepted: true,
      email_new_message: true, email_project_update: true, push_enabled: false,
    },
  })

  const Toggle = ({ name, label, description }: { name: keyof NotifForm; label: string; description: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input {...register(name)} type="checkbox" className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
      </label>
    </div>
  )

  const onSave = async (data: NotifForm) => {
    setSaving(true)
    try {
      await apiClient.patch('/notifications/preferences/', data)
      toast.success('Preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Email Notifications" description="Choose which emails you want to receive.">
        <form onSubmit={handleSubmit(onSave)}>
          <Toggle name="email_new_bid"        label="New Bid Received"    description="When an engineer submits a proposal on your project" />
          <Toggle name="email_bid_accepted"   label="Bid Accepted"        description="When a client accepts your proposal" />
          <Toggle name="email_new_message"    label="New Message"         description="When you receive a new chat message" />
          <Toggle name="email_project_update" label="Project Updates"     description="Status changes and milestone updates" />
          <Toggle name="push_enabled"         label="Push Notifications"  description="Browser push notifications for real-time alerts" />
          <div className="flex justify-end mt-5">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Preferences
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

// ─── Verification Tab ─────────────────────────────────────────────────────────
function VerificationTab() {
  const { user } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [files, setFiles] = useState<{ id: string; national_id?: File; cert?: File; license?: File }>({ id: '' })

  const handleSubmitDocs = async () => {
    setUploading(true)
    try {
      const fd = new FormData()
      if (files.national_id) fd.append('national_id', files.national_id)
      if (files.cert)        fd.append('certificate', files.cert)
      if (files.license)     fd.append('license',     files.license)
      await apiClient.post('/auth/verification/submit/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSubmitted(true)
      toast.success('Documents submitted for review')
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (user?.is_verified) {
    return (
      <SectionCard title="Verification Status">
        <div className="flex items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Your account is verified ✓</p>
            <p className="text-sm text-gray-400 mt-0.5">Your identity and credentials have been confirmed by our team.</p>
          </div>
        </div>
      </SectionCard>
    )
  }

  if (submitted) {
    return (
      <SectionCard title="Documents Submitted">
        <div className="flex items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Under Review</p>
            <p className="text-sm text-gray-400 mt-0.5">We'll verify your documents within 1–2 business days and notify you by email.</p>
          </div>
        </div>
      </SectionCard>
    )
  }

  const DocUpload = ({ label, description, onChange }: { label: string; description: string; onChange: (f: File) => void }) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-50 dark:border-gray-800 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <label className="shrink-0 cursor-pointer px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
        Upload
        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} />
      </label>
    </div>
  )

  return (
    <div className="space-y-6">
      <SectionCard title="Get Verified" description="Submit your documents to receive a verified badge on your profile. This increases trust and bid acceptance rates.">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 mb-5">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">Verification is currently pending for your account.</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Upload the required documents below to begin the review process.</p>
        </div>

        <DocUpload label="National ID / Passport" description="PDF or image, max 10MB" onChange={(f) => setFiles(p => ({ ...p, national_id: f }))} />
        <DocUpload label="Professional Certificate" description="Engineering degree or trade certificate" onChange={(f) => setFiles(p => ({ ...p, cert: f }))} />
        <DocUpload label="Professional License (optional)" description="NCA or equivalent registration" onChange={(f) => setFiles(p => ({ ...p, license: f }))} />

        <div className="flex justify-end mt-5">
          <button onClick={handleSubmitDocs} disabled={uploading || (!files.national_id && !files.cert)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit for Verification
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account, security, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-7 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'account'       && <AccountTab />}
      {tab === 'security'      && <SecurityTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'verification'  && <VerificationTab />}
    </div>
  )
}
