'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'

const inputCls = `w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm transition`

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

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

interface PlatformSettings {
  platform_name: string
  support_email: string
  commission_rate: number
  min_bid_amount: number
  max_bid_amount: number
  registration_open: boolean
  require_email_verification: boolean
  auto_verify_engineers: boolean
  maintenance_mode: boolean
  allow_client_registration: boolean
  allow_engineer_registration: boolean
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: 'BuildConnect',
    support_email: 'support@buildconnect.co.ke',
    commission_rate: 10,
    min_bid_amount: 5000,
    max_bid_amount: 50000000,
    registration_open: true,
    require_email_verification: true,
    auto_verify_engineers: false,
    maintenance_mode: false,
    allow_client_registration: true,
    allow_engineer_registration: true,
  })

  const { isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/settings/')
      setSettings(res.data)
      return res.data
    },
  })

  const update = (key: keyof PlatformSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await apiClient.put('/admin/settings/', settings)
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure global platform behaviour</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* General */}
      <SectionCard title="General" description="Basic platform configuration.">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Platform Name</label>
            <input value={settings.platform_name} onChange={(e) => update('platform_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Support Email</label>
            <input type="email" value={settings.support_email} onChange={(e) => update('support_email', e.target.value)} className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* Finance */}
      <SectionCard title="Finance" description="Fees and bid limits applied across the platform.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Commission Rate (%)</label>
            <input type="number" min="0" max="100" value={settings.commission_rate}
              onChange={(e) => update('commission_rate', parseFloat(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Min Bid (KES)</label>
            <input type="number" min="0" value={settings.min_bid_amount}
              onChange={(e) => update('min_bid_amount', parseInt(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Bid (KES)</label>
            <input type="number" min="0" value={settings.max_bid_amount}
              onChange={(e) => update('max_bid_amount', parseInt(e.target.value))} className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* Registration */}
      <SectionCard title="Registration & Access" description="Control who can register and what is required.">
        <Toggle label="Open Registration" description="Allow new users to sign up" checked={settings.registration_open} onChange={(v) => update('registration_open', v)} />
        <Toggle label="Allow Client Sign-ups" description="New clients can self-register" checked={settings.allow_client_registration} onChange={(v) => update('allow_client_registration', v)} />
        <Toggle label="Allow Engineer Sign-ups" description="New engineers can self-register" checked={settings.allow_engineer_registration} onChange={(v) => update('allow_engineer_registration', v)} />
        <Toggle label="Require Email Verification" description="Users must verify email before accessing dashboard" checked={settings.require_email_verification} onChange={(v) => update('require_email_verification', v)} />
        <Toggle label="Auto-Verify Engineers" description="Skip manual verification review — verify instantly on signup" checked={settings.auto_verify_engineers} onChange={(v) => update('auto_verify_engineers', v)} />
      </SectionCard>

      {/* Maintenance */}
      <SectionCard title="Maintenance Mode" description="Temporarily disable access for all non-admin users.">
        <div className={`rounded-xl p-4 border transition-colors ${settings.maintenance_mode ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800 border-transparent'}`}>
          <Toggle
            label="Maintenance Mode"
            description="Shows a maintenance page to all regular users"
            checked={settings.maintenance_mode}
            onChange={(v) => update('maintenance_mode', v)}
          />
          {settings.maintenance_mode && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
              ⚠️ Platform is currently in maintenance mode. Only admins can access the dashboard.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
