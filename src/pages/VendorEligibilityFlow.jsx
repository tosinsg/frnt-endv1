import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { UploadCloud, Clock, Loader2, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { submitVendorEligibility } from '@/store/slices/authSlice'
import { uploadVendorDoc } from '@/lib/cloudinary'
import { routeForUser } from '@/lib/authRoutes'

const categories = ['Fashion & Accessories', 'Electronics', 'Home & Living', 'Beauty', 'Food & Groceries']
const ranges = ['1–10 SKUs', '10–50 SKUs', '50–100 SKUs', '100+ SKUs']

export default function VendorEligibilityFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(null) // 'id' | 'business' | null
  const [error, setError] = useState('')
  const [uploadNotice, setUploadNotice] = useState('')
  const [form, setForm] = useState({
    businessName: '',
    businessCategory: categories[0],
    expectedProductRange: ranges[0],
    idDoc: null,
    idDocUrl: '',
    businessDoc: null,
    businessDocUrl: '',
  })

  const alreadyPending = user?.vendorVerificationStatus === 'pending' || user?.vendorVerificationStatus === 'verified'

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleFile(kind, file) {
    if (!file) return
    setError('')
    setUploadNotice('')
    setUploading(kind)
    try {
      const result = await uploadVendorDoc(file)
      if (kind === 'id') {
        update('idDoc', file)
        update('idDocUrl', result.url)
      } else {
        update('businessDoc', file)
        update('businessDocUrl', result.url)
      }
      if (result.cloudinaryConfigured === false) {
        setUploadNotice(
          'Demo mode: Cloudinary is not configured. File is stored as a placeholder URL. ' +
            'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the server for real uploads.',
        )
      } else {
        setUploadNotice('Document uploaded to Cloudinary.')
      }
    } catch (e) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.idDocUrl) {
      setError('Please upload a government ID document')
      return
    }
    setLoading(true)
    setError('')
    const documentUrls = [form.idDocUrl, form.businessDocUrl].filter(Boolean)
    const result = await dispatch(
      submitVendorEligibility({
        businessName: form.businessName,
        businessCategory: form.businessCategory,
        expectedProductRange: form.expectedProductRange,
        documentUrls,
      }),
    )
    setLoading(false)
    if (!submitVendorEligibility.fulfilled.match(result)) {
      setError(result.payload || 'Submission failed')
      return
    }
    // Role becomes vendor only after this submit — send to vendor dashboard (pending UI)
    const nextUser = result.payload?.user || result.payload
    navigate(nextUser ? routeForUser(nextUser) : '/vendor/dashboard', { replace: true })
  }

  const isStillCustomer = (user?.role || '').toLowerCase() === 'customer'

  if (alreadyPending || user?.vendorVerificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 flex flex-col items-center text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full bg-amber/15 flex items-center justify-center mb-8"
          >
            <Clock size={30} className="text-amber" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-3">
            {user?.vendorVerificationStatus === 'verified'
              ? "You're verified"
              : 'Your application is under review'}
          </h1>
          <p className="text-onLight/55 max-w-md mb-10">
            {user?.vendorVerificationStatus === 'verified'
              ? 'You can list products and manage payouts from your dashboard.'
              : 'Typically within a few hours. You can log in and look around your dashboard while you wait — listing products and payouts unlock once you\'re verified.'}
          </p>
          <Button size="lg" onClick={() => navigate('/vendor/dashboard')}>
            Go to my dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 flex justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white border border-onLight/10 rounded-3xl p-8 md:p-10"
        >
          {isStillCustomer && (
            <Link
              to="/customer/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-dim hover:text-leaf mb-5 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to customer dashboard
            </Link>
          )}
          <h1 className="font-display text-3xl font-semibold mb-1">Vendor eligibility</h1>
          <p className="text-sm text-onLight/50 mb-8">
            A few details about your business, plus identity documents for verification.
            You stay a customer until you submit this form.
          </p>

          <div className="space-y-5">
            <Field label="Business name">
              <Input
                required
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Business category">
                <Select value={form.businessCategory} onChange={(e) => update('businessCategory', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Expected product range">
                <Select
                  value={form.expectedProductRange}
                  onChange={(e) => update('expectedProductRange', e.target.value)}
                >
                  {ranges.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Government ID">
              <label className="flex items-center gap-3 p-4 border border-dashed border-onLight/20 rounded-xl cursor-pointer hover:border-leaf/40">
                {uploading === 'id' ? (
                  <Loader2 size={18} className="text-leaf animate-spin" />
                ) : (
                  <UploadCloud size={18} className="text-onLight/40" />
                )}
                <span className="text-sm text-onLight/60 flex-1 truncate">
                  {uploading === 'id'
                    ? 'Uploading…'
                    : form.idDocUrl
                      ? form.idDoc?.name || 'ID uploaded'
                      : 'Upload ID document (image or PDF)'}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={!!uploading || loading}
                  onChange={(e) => handleFile('id', e.target.files?.[0] || null)}
                />
              </label>
              {form.idDocUrl && (
                <p
                  className={`text-xs mt-1.5 truncate ${
                    form.idDocUrl.startsWith('local://') ? 'text-amber' : 'text-emerald'
                  }`}
                >
                  {form.idDocUrl.startsWith('local://')
                    ? 'Demo placeholder (configure Cloudinary for real storage)'
                    : `Saved · ${form.idDocUrl}`}
                </p>
              )}
            </Field>
            <Field label="Business registration (optional)">
              <label className="flex items-center gap-3 p-4 border border-dashed border-onLight/20 rounded-xl cursor-pointer hover:border-leaf/40">
                {uploading === 'business' ? (
                  <Loader2 size={18} className="text-leaf animate-spin" />
                ) : (
                  <UploadCloud size={18} className="text-onLight/40" />
                )}
                <span className="text-sm text-onLight/60 flex-1 truncate">
                  {uploading === 'business'
                    ? 'Uploading…'
                    : form.businessDocUrl
                      ? form.businessDoc?.name || 'Doc uploaded'
                      : 'Upload CAC / registration doc'}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  disabled={!!uploading || loading}
                  onChange={(e) => handleFile('business', e.target.files?.[0] || null)}
                />
              </label>
            </Field>
          </div>

          {uploadNotice && (
            <p
              className={`text-sm mt-4 ${
                uploadNotice.startsWith('Demo') ? 'text-amber' : 'text-emerald'
              }`}
            >
              {uploadNotice}
            </p>
          )}
          {error && <p className="text-sm text-coral mt-4">{error}</p>}

          <Button type="submit" size="lg" className="w-full mt-8" disabled={loading || !!uploading}>
            {loading ? 'Submitting…' : 'Submit for review'}
          </Button>
        </motion.form>
      </div>
    </div>
  )
}
