import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Lock, PlusCircle, Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { fetchProducts } from '@/store/slices/catalogSlice'

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books', 'Sports']

export default function VendorDashboard() {
  const user = useSelector((s) => s.auth.user)
  const dispatch = useDispatch()
  const verified = user?.vendorVerificationStatus === 'verified'
  const pending = user?.vendorVerificationStatus === 'pending'
  const rejected = user?.vendorVerificationStatus === 'rejected'

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Fashion',
    description: '',
    image: '',
  })
  const [uploading, setUploading] = useState(false)

  async function loadMine() {
    if (!verified) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await api.getMyProducts()
      setProducts(list || [])
    } catch (e) {
      setError(e.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMine()
  }, [verified])

  async function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const res = await api.uploadProductImage(file)
      if (res?.url && !String(res.url).startsWith('http')) {
        setError('Cloudinary is not configured on the server. Set CLOUDINARY_* env vars.')
      }
      setForm((f) => ({ ...f, image: res.url || '' }))
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        description: form.description.trim(),
        image: form.image || undefined,
      }
      if (form.originalPrice) body.originalPrice = Number(form.originalPrice)
      await api.createProduct(body)
      setForm({
        name: '',
        price: '',
        originalPrice: '',
        category: 'Fashion',
        description: '',
        image: '',
      })
      setShowForm(false)
      await loadMine()
      dispatch(fetchProducts({ force: true }))
    } catch (err) {
      setError(err.message || 'Could not create product')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(id) {
    try {
      await api.deactivateProduct(id)
      await loadMine()
      dispatch(fetchProducts({ force: true }))
    } catch (err) {
      setError(err.message || 'Could not deactivate')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-semibold mb-1">
          {user?.vendorEligibility?.businessName || 'Your shop'}
        </h1>
        <div className="flex items-center gap-2 mb-8">
          <span
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              verified && 'bg-emerald/15 text-emerald',
              pending && 'bg-amber/15 text-amber',
              rejected && 'bg-coral/15 text-coral',
              !verified && !pending && !rejected && 'bg-onLight/10 text-onLight/50',
            )}
          >
            {verified
              ? 'Verified vendor'
              : pending
                ? 'Verification pending'
                : rejected
                  ? 'Application rejected'
                  : 'Not submitted'}
          </span>
        </div>

        {!verified && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber/10 border border-amber/25 text-onLight/70 text-sm rounded-2xl p-5 mb-8 max-w-xl"
          >
            {pending &&
              'Your application is under review. Listing products stays locked until an admin verifies you.'}
            {rejected &&
              `Your application was rejected${
                user?.vendorEligibility?.rejectionReason
                  ? `: ${user.vendorEligibility.rejectionReason}`
                  : '.'
              } Update your documents via onboarding if you re-apply.`}
            {!pending && !rejected && 'Complete vendor eligibility to start selling.'}
          </motion.div>
        )}

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <button
            type="button"
            disabled={!verified}
            onClick={() => verified && setShowForm((v) => !v)}
            title={!verified ? "Unlocks once you're verified" : undefined}
            className={cn(
              'p-6 rounded-2xl border bg-white flex flex-col items-start gap-4 text-left',
              !verified
                ? 'opacity-50 border-onLight/10 cursor-not-allowed'
                : 'border-onLight/10 hover:border-leaf/40 cursor-pointer',
            )}
          >
            <div className="flex items-center justify-between w-full">
              <PlusCircle size={22} className="text-leaf" />
              {!verified && <Lock size={14} className="text-onLight/35" />}
            </div>
            <span className="text-sm font-medium">Add a product</span>
          </button>
          <div className="p-6 rounded-2xl border border-onLight/10 bg-white flex flex-col items-start gap-4">
            <Package size={22} className="text-leaf" />
            <span className="text-sm font-medium">
              Your listings {verified ? `(${products.length})` : ''}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-coral mb-4">{error}</p>}

        {showForm && verified && (
          <form
            onSubmit={handleCreate}
            className="bg-white border border-onLight/10 rounded-2xl p-6 mb-10 max-w-lg space-y-4"
          >
            <h2 className="font-display text-xl font-semibold">New listing</h2>
            <Field label="Product name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₦)">
                <Input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </Field>
              <Field label="Compare-at price (optional)">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.originalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Category">
              <select
                className="w-full h-11 px-3 rounded-xl border border-onLight/15 text-sm bg-white"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                className="w-full min-h-[88px] px-3 py-2 rounded-xl border border-onLight/15 text-sm outline-none focus:border-leaf"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
            <Field label="Product image (Cloudinary)">
              <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
              {uploading && <p className="text-xs text-onLight/45 mt-1">Uploading…</p>}
              {form.image?.startsWith('http') && (
                <p className="text-xs text-emerald mt-1 truncate">Uploaded: {form.image}</p>
              )}
            </Field>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || uploading}>
                {saving ? 'Saving…' : 'Publish listing'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {verified && (
          <div className="flex flex-col gap-3 max-w-2xl">
            {loading && <p className="text-sm text-onLight/45">Loading your products…</p>}
            {!loading && products.length === 0 && (
              <p className="text-sm text-onLight/45">No listings yet. Add your first product above.</p>
            )}
            {products.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center bg-white border border-onLight/10 rounded-xl p-4 gap-4"
              >
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-onLight/45 mt-0.5">
                    ₦{(p.price || 0).toLocaleString()} · {p.category} ·{' '}
                    {p.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                {p.active && (
                  <button
                    type="button"
                    onClick={() => handleDeactivate(p.id)}
                    className="text-xs font-medium text-coral hover:underline"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
