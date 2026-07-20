/**
 * OTP verification
 * ----------------
 * 6-digit email code after register (or login when verification is required).
 * Resend uses /auth/resend-otp. Success → routeForUser (role / dashboard).
 */

import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import { verifyOtp } from '@/store/slices/authSlice'
import { api } from '@/lib/api'
import { routeForUser } from '@/lib/authRoutes'

const DIGIT_COUNT = 6

export default function OTPVerification() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const pendingEmail = useSelector((s) => s.auth.pendingEmail)
  const devOtp = useSelector((s) => s.auth.devOtp)
  const authError = useSelector((s) => s.auth.error)
  const status = useSelector((s) => s.auth.status)

  const [digits, setDigits] = useState(() => Array(DIGIT_COUNT).fill(''))
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [resending, setResending] = useState(false)
  const inputRefs = useRef([])

  function handleChange(index, value) {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, DIGIT_COUNT)
    if (!text) return
    e.preventDefault()
    const next = Array(DIGIT_COUNT).fill('')
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setDigits(next)
    inputRefs.current[Math.min(text.length, DIGIT_COUNT - 1)]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length !== DIGIT_COUNT) {
      setError('Enter all 6 digits.')
      return
    }
    if (!pendingEmail) {
      setError('No pending email. Please register again.')
      return
    }
    setError('')
    const result = await dispatch(verifyOtp({ email: pendingEmail, code }))
    if (verifyOtp.fulfilled.match(result)) {
      navigate(routeForUser(result.payload.user), { replace: true })
    }
  }

  async function handleResend() {
    if (!pendingEmail || resending) return
    setResending(true)
    setError('')
    try {
      const res = await api.resendOtp(pendingEmail)
      setInfo(res.devOtp ? `New code (dev): ${res.devOtp}` : res.message || 'A new code was sent.')
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digit code to{' '}
          <strong className="text-onLight/70 font-medium">
            {pendingEmail || 'your email'}
          </strong>
          .
        </>
      }
      footer={
        <>
          Wrong email?{' '}
          <Link to="/register" className="text-leaf-dim font-semibold hover:underline">
            Register again
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!pendingEmail && (
          <p className="text-sm text-coral">
            No verification in progress.{' '}
            <Link to="/register" className="underline font-medium">
              Register
            </Link>{' '}
            or{' '}
            <Link to="/login" className="underline font-medium">
              log in
            </Link>
            .
          </p>
        )}

        {devOtp && (
          <p className="text-xs text-amber bg-amber/10 rounded-xl px-3 py-2">
            Dev OTP: <strong>{devOtp}</strong>
          </p>
        )}

        <div
          className="flex justify-between sm:justify-center gap-2"
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              className="w-11 h-12 text-center text-lg rounded-xl border border-onLight/15 bg-paper focus:border-leaf focus:ring-1 focus:ring-leaf outline-none"
            />
          ))}
        </div>

        {(error || authError) && (
          <p className="text-sm text-coral">{error || authError}</p>
        )}
        {info && <p className="text-sm text-leaf">{info}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === 'loading' || !pendingEmail}
        >
          {status === 'loading' ? 'Verifying…' : 'Verify'}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={!pendingEmail || resending}
          className="w-full text-sm text-onLight/50 hover:text-leaf disabled:opacity-40"
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </form>
    </AuthLayout>
  )
}
