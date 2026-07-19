import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { registerUser } from '@/store/slices/authSlice'
import { ShieldCheck } from 'lucide-react'

const idTypes = ['National ID (NIN)', 'International Passport', "Driver's License", "Voter's Card"]

export default function RegistrationForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const registrationIntent = useSelector((s) => s.auth.registrationIntent)
  const authError = useSelector((s) => s.auth.error)
  const status = useSelector((s) => s.auth.status)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    idType: idTypes[0],
    idNumber: '',
    dob: '',
    address: '',
  })

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.name) nextErrors.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email.'
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!form.phone) nextErrors.phone = 'Enter a phone number.'
    if (!form.idNumber) nextErrors.idNumber = 'ID number is required.'
    if (!form.dob) nextErrors.dob = 'Date of birth is required.'
    if (!form.address) nextErrors.address = 'Enter your address.'
    if (!captchaChecked) nextErrors.captcha = "Confirm you're not a robot."
    if (!agreedToTerms) nextErrors.terms = 'You must agree to the Terms of Service.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const result = await dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        idType: form.idType,
        idNumber: form.idNumber,
        dob: form.dob,
        address: form.address,
        agreedToTerms: true,
        registrationIntent: registrationIntent || null,
      }),
    )

    if (registerUser.fulfilled.match(result)) {
      navigate('/verify-otp')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 flex justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl bg-white border border-onLight/10 rounded-3xl p-8 md:p-10"
        >
          <h1 className="font-display text-3xl font-semibold mb-1">Create your account</h1>
          <p className="text-onLight/50 mb-8 text-sm">
            We collect a few identity details now so verification never blocks you later.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full name" error={errors.name}>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ada Obi" />
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
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 000 0000" />
            </Field>
            <Field label="ID type">
              <Select value={form.idType} onChange={(e) => update('idType', e.target.value)}>
                {idTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="ID number" error={errors.idNumber}>
              <Input value={form.idNumber} onChange={(e) => update('idNumber', e.target.value)} placeholder="00000000000" />
            </Field>
            <Field label="Date of birth" error={errors.dob}>
              <Input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} />
            </Field>
            <Field label="Address" error={errors.address}>
              <Input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, city, state" />
            </Field>
          </div>

          <label className="mt-7 flex items-start gap-3 p-4 rounded-xl border border-onLight/10 bg-paper cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="size-4 accent-leaf mt-0.5"
            />
            <span className="text-sm text-onLight/70">
              I agree to the{' '}
              <Link to="/terms" className="text-leaf underline" target="_blank">
                Terms of Service and Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && <span className="block text-xs text-coral mt-1.5">{errors.terms}</span>}

          <label className="mt-3 flex items-center gap-3 p-4 rounded-xl border border-onLight/10 bg-paper cursor-pointer">
            <input
              type="checkbox"
              checked={captchaChecked}
              onChange={(e) => setCaptchaChecked(e.target.checked)}
              className="size-4 accent-leaf"
            />
            <ShieldCheck size={18} className="text-onLight/40" />
            <span className="text-sm text-onLight/70">I&apos;m not a robot</span>
          </label>
          {errors.captcha && <span className="block text-xs text-coral mt-1.5">{errors.captcha}</span>}
          {(authError || errors.submit) && (
            <p className="text-sm text-coral mt-4">{authError || errors.submit}</p>
          )}

          <Button type="submit" size="lg" className="w-full mt-8" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account…' : 'Continue'}
          </Button>
        </motion.form>
      </div>
    </div>
  )
}
