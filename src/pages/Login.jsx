/**
 * Login page
 * ----------
 * Email + password sign-in. Same flow as before; UI uses AuthLayout.
 * After success: OTP if required, else role-aware redirect (and cart for customers).
 */

import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { loginUser } from '@/store/slices/authSlice'
import { fetchCart } from '@/store/slices/catalogSlice'
import { resolvePostAuthPath } from '@/lib/authRoutes'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const authError = useSelector((s) => s.auth.error)
  const status = useSelector((s) => s.auth.status)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  // Optional return path from a protected route (e.g. /contact)
  const intendedPath = location.state?.from

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')

    const result = await dispatch(loginUser({ email, password }))
    if (!loginUser.fulfilled.match(result)) {
      setLocalError(result.payload || 'Login failed')
      return
    }

    const payload = result.payload

    // Login may still require email OTP
    if (payload.pendingEmail && !payload.token) {
      navigate('/verify-otp')
      return
    }

    const user = payload.user
    if ((user?.role || '').toLowerCase() === 'customer') {
      dispatch(fetchCart())
    }
    navigate(resolvePostAuthPath(user, intendedPath))
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to shop, manage orders, or continue selling on Oscillate."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-leaf-dim font-semibold hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            placeholder="you@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password">
          <Input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {(localError || authError) && (
          <p className="text-sm text-coral">{localError || authError}</p>
        )}

        {intendedPath === '/contact' && (
          <p className="text-xs text-onLight/45">Log in to start a conversation with us.</p>
        )}

        <Button type="submit" size="lg" className="w-full mt-2" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Log in'}
        </Button>

        {import.meta.env.DEV && (
          <p className="text-center text-xs text-onLight/35 pt-1">
            Dev admin: admin@aro.com / admin12345
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
