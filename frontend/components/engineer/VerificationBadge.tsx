import { ShieldCheck } from 'lucide-react'

interface Props {
  className?: string
}

export default function VerificationBadge({ className = '' }: Props) {
  return (
    <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 ${className}`}
      title="Verified Engineer">
      <ShieldCheck className="w-3.5 h-3.5 text-white" />
    </div>
  )
}
