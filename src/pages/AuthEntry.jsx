/**
 * Auth entry
 * ----------
 * First screen after “Get Started”: choose create account vs log in.
 * Optional ?intent=customer|vendor is stored for role pre-selection later.
 */

import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import { setRegistrationIntent } from '@/store/slices/authSlice'

export default function AuthEntry() {
  const [params] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Capture intent from product links (e.g. /auth?intent=customer)
  useEffect(() => {
    const intent = params.get('intent')
    if (intent) dispatch(setRegistrationIntent(intent))
  }, [params, dispatch])

  return (
    <AuthLayout
      title="Create an account"
      subtitle="One account for shopping or selling — start exploring verified vendors on Oscillate."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-leaf-dim font-semibold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={() => navigate('/register')} className="w-full">
          Create an account
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full">
          Log in
        </Button>
      </div>
    </AuthLayout>
  )
}
