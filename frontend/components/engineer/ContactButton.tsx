'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { messagesApi } from '@/lib/api/messages'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'

interface Props {
  engineerSlug: string
  engineerId: string
  className?: string
  variant?: 'primary' | 'secondary'
}

export default function ContactButton({ engineerId, className = '', variant = 'secondary' }: Props) {
  const [loading, setLoading] = useState(false)
  const { isAuthenticated }   = useAuthStore()
  const router                = useRouter()

  const handleContact = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    setLoading(true)
    try {
      const { data } = await messagesApi.startConversation(engineerId)
      router.push(`/messages/${data.id}`)
    } catch {
      toast.error('Could not start conversation')
    } finally {
      setLoading(false)
    }
  }

  const base = 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors'
  const styles = variant === 'primary'
    ? `${base} bg-brand-600 hover:bg-brand-700 text-white`
    : `${base} border border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/20`

  return (
    <button onClick={handleContact} disabled={loading} className={`${styles} ${className}`}>
      <MessageCircle className="w-4 h-4" />
      {loading ? 'Opening...' : 'Contact'}
    </button>
  )
}
