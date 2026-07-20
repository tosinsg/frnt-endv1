/**
 * Role confirmation
 * -----------------
 * After OTP: pick customer or vendor. Pre-selects registration intent when present.
 * Saves role via API, then routeForUser → quiz / vendor eligibility / dashboard.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingBag, Store } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import { confirmRole } from '@/store/slices/authSlice'
import { routeForUser } from '@/lib/authRoutes'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  {
    id: 'customer',
    icon: ShoppingBag,
    title: 'Continue as a Customer',
    desc: 'Browse a personalized feed and shop from verified vendors.',
  },
  {
    id: 'vendor',
    icon: Store,
    title: 'Continue as a Vendor',
    desc: 'Apply to sell — we review a short eligibility form before you list.',
  },
]

export default function RoleConfirmation() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const registrationIntent = useSelector((s) => s.auth.registrationIntent)
  const user = useSelector((s) => s.auth.user)

  const [role, setRole] = useState(
    registrationIntent || user?.registrationIntent || 'customer',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fromProduct =
    registrationIntent === 'customer' || user?.registrationIntent === 'customer'

  async function handleContinue() {
    setLoading(true)
    setError('')
    const result = await dispatch(confirmRole(role))
    setLoading(false)
    if (confirmRole.fulfilled.match(result)) {
      navigate(routeForUser(result.payload.user), { replace: true })
    } else {
      setError(result.payload || 'Could not save role')
    }
  }

  return (
    <AuthLayout
      wide
      title="How will you use Oscillate?"
      subtitle={
        fromProduct
          ? "We've pre-selected Customer since you came from a product link — switch anytime below."
          : 'Choose one to start. You can request a change later through support.'
      }
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((opt) => {
            const selected = role === opt.id
            const Icon = opt.icon
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id)}
                className={cn(
                  'text-left p-5 rounded-2xl border-2 transition-colors bg-paper',
                  selected
                    ? 'border-leaf bg-leaf/5'
                    : 'border-onLight/10 hover:border-onLight/25',
                )}
              >
                <Icon size={22} className={selected ? 'text-leaf' : 'text-onLight/40'} />
                <h3 className="font-semibold mt-3 mb-1 text-sm">{opt.title}</h3>
                <p className="text-xs text-onLight/55 leading-relaxed">{opt.desc}</p>
              </button>
            )
          })}
        </div>

        {error && <p className="text-sm text-coral">{error}</p>}

        <Button size="lg" className="w-full" onClick={handleContinue} disabled={loading}>
          {loading
            ? 'Saving…'
            : `Continue as ${role === 'customer' ? 'Customer' : 'Vendor'}`}
        </Button>
      </div>
    </AuthLayout>
  )
}
