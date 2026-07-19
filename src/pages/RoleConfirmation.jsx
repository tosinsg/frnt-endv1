import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ShoppingBag, Store } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { confirmRole } from '@/store/slices/authSlice'
import { routeForUser } from '@/lib/authRoutes'
import { cn } from '@/lib/utils'

export default function RoleConfirmation() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const registrationIntent = useSelector((s) => s.auth.registrationIntent)
  const user = useSelector((s) => s.auth.user)
  const [role, setRole] = useState(registrationIntent || user?.registrationIntent || 'customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const options = [
    {
      id: 'customer',
      icon: ShoppingBag,
      title: 'Continue as a Customer',
      desc: 'Browse a feed personalized to your interests and shop from verified vendors.',
    },
    {
      id: 'vendor',
      icon: Store,
      title: 'Continue as a Vendor',
      desc: 'Apply to sell on Oscillate. We review a short eligibility form before you can list.',
    },
  ]

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-20 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold mb-2">How do you want to use Oscillate?</h1>
          <p className="text-onLight/55">
            {registrationIntent === 'customer' || user?.registrationIntent === 'customer'
              ? "We've pre-selected Customer since you came from a product link — switch anytime below."
              : 'Choose one to start. You can request a change later through support.'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRole(opt.id)}
              className={cn(
                'text-left p-6 rounded-2xl border-2 transition-colors bg-white',
                role === opt.id ? 'border-leaf' : 'border-onLight/10 hover:border-onLight/25',
              )}
            >
              <opt.icon size={22} className={role === opt.id ? 'text-leaf' : 'text-onLight/40'} />
              <h3 className="font-semibold mt-4 mb-1.5">{opt.title}</h3>
              <p className="text-sm text-onLight/55">{opt.desc}</p>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-coral mt-6">{error}</p>}

        <Button size="lg" className="mt-10" onClick={handleContinue} disabled={loading}>
          {loading ? 'Saving…' : `Continue as ${role === 'customer' ? 'Customer' : 'Vendor'}`}
        </Button>
      </div>
    </div>
  )
}
