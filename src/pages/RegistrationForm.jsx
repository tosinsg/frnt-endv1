/**
 * Registration form
 * -----------------
 * Full signup + KYC fields, terms + captcha, then navigate to OTP.
 * Uses AuthLayout (wide) for the split form + reviews card.
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShieldCheck } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { registerUser } from '@/store/slices/authSlice'

const ID_TYPES = [
  'National ID (NIN)',
  'International Passport',
  "Driver's License",
  "Voter's Card",
]

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  idType: ID_TYPES[0],
  idNumber: '',
  dob: '',
  address: '',
}

export default function RegistrationForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const registrationIntent = useSelector((s) => s.auth.registrationIntent)
  const authError = useSelector((s) => s.auth.error)
  const status = useSelector((s) => s.auth.status)

  const [form, setForm] = useState(EMPTY_FORM)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /** Client-side validation before hitting the API */
  function validate() {
    const next = {}
    if (!form.name) next.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (!form.phone) next.phone = 'Enter a phone number.'
    if (!form.idNumber) next.idNumber = 'ID number is required.'
    if (!form.dob) next.dob = 'Date of birth is required.'
    if (!form.address) next.address = 'Enter your address.'
    if (!captchaChecked) next.captcha = "Confirm you're not a robot."
    if (!agreedToTerms) next.terms = 'You must agree to the Terms of Service.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const result = await dispatch(
      registerUser({
        ...form,
        agreedToTerms: true,
        registrationIntent: registrationIntent || null,
      }),
    )

    if (registerUser.fulfilled.match(result)) {
      navigate('/verify-otp')
    }
  }

  return (
    <AuthLayout
      wide
      title="Create an account"
      subtitle="We collect a few identity details now so verification never blocks you later."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-leaf-dim font-semibold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ada Obi"
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="ada@email.com"
            />
          </Field>
          <Field label="Password" error={errors.password} hint="At least 8 characters">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <Input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+234 800 000 0000"
            />
          </Field>
          <Field label="ID type">
            <Select value={form.idType} onChange={(e) => update('idType', e.target.value)}>
              {ID_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="ID number" error={errors.idNumber}>
            <Input
              value={form.idNumber}
              onChange={(e) => update('idNumber', e.target.value)}
              placeholder="00000000000"
            />
          </Field>
          <Field label="Date of birth" error={errors.dob}>
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => update('dob', e.target.value)}
            />
          </Field>
          <Field label="Address" error={errors.address}>
            <Input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Street, city, state"
            />
          </Field>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-onLight/10 bg-paper cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="size-4 accent-leaf mt-0.5"
          />
          <span className="text-sm text-onLight/70">
            I agree to the{' '}
            <Link to="/terms" className="text-leaf-dim underline" target="_blank">
              Terms of Service and Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms && <span className="block text-xs text-coral">{errors.terms}</span>}

        {/* Lightweight captcha stand-in */}
        <label className="flex items-center gap-3 p-3.5 rounded-xl border border-onLight/10 bg-paper cursor-pointer">
          <input
            type="checkbox"
            checked={captchaChecked}
            onChange={(e) => setCaptchaChecked(e.target.checked)}
            className="size-4 accent-leaf"
          />
          <ShieldCheck size={18} className="text-onLight/40" />
          <span className="text-sm text-onLight/70">I&apos;m not a robot</span>
        </label>
        {errors.captcha && <span className="block text-xs text-coral">{errors.captcha}</span>}

        {authError && <p className="text-sm text-coral">{authError}</p>}

        <Button type="submit" size="lg" className="w-full mt-2" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
