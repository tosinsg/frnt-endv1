import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { loginUser } from '@/store/slices/authSlice'
import { fetchCart } from '@/store/slices/catalogSlice'
import { routeForUser } from '@/lib/authRoutes'

/** Only allow same-app relative paths (blocks open redirects). */
function safeReturnPath(from) {
  if (typeof from !== 'string') return null
  if (!from.startsWith('/') || from.startsWith('//')) return null
  return from
}

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const authError = useSelector((s) => s.auth.error)
  const status = useSelector((s) => s.auth.status)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const returnTo = safeReturnPath(location.state?.from)

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) {
      const payload = result.payload
      if (payload.pendingEmail && !payload.token) {
        navigate('/verify-otp')
        return
      }
      // Hydrate cart so the nav badge is correct immediately after login
      dispatch(fetchCart())
      // Prefer the page they were trying to open (e.g. /contact)
      navigate(returnTo || routeForUser(payload.user))
    } else {
      setLocalError(result.payload || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-24 flex justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-semibold mb-8 text-center">Log in</h1>
          <div className="space-y-4">
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
          </div>
          {(localError || authError) && (
            <p className="text-sm text-coral mt-4">{localError || authError}</p>
          )}
          <Button type="submit" size="lg" className="w-full mt-8" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Log in'}
          </Button>
          {returnTo === '/contact' && (
            <p className="text-center text-xs text-onLight/45 mt-4">
              Log in to start a conversation with us.
            </p>
          )}
          <p className="text-center text-sm text-onLight/50 mt-6">
            No account yet?{' '}
            <Link to="/register" className="text-leaf-dim hover:underline font-medium">
              Create one
            </Link>
          </p>
          {import.meta.env.DEV && (
            <p className="text-center text-xs text-onLight/40 mt-4">
              Dev admin seed: admin@aro.com / admin12345
            </p>
          )}
        </motion.form>
      </div>
    </div>
  )
}
