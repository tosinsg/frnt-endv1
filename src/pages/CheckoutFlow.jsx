import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Minus, Plus, Trash2, UploadCloud, Loader2, FileImage, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import ProgressBar from '@/components/ui/ProgressBar'
import ProductThumb from '@/components/ProductThumb'
import {
  initiateCheckout,
  fetchCart,
  fetchProducts,
  setCartQuantity,
  removeFromCart,
} from '@/store/slices/catalogSlice'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { routeForUser } from '@/lib/authRoutes'

export default function CheckoutFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.catalog.cart)
  const products = useSelector((s) => s.catalog.products)
  const user = useSelector((s) => s.auth.user)
  const [step, setStep] = useState(1)
  const [placed, setPlaced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [delivery, setDelivery] = useState({
    fullName: user?.name || '',
    address: '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCart())
  }, [dispatch])

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = cart.map((c) => c.productId)
      if (ids.length === 0) return new Set()
      if (prev.size === 0) return new Set(ids)
      const next = new Set()
      ids.forEach((id) => {
        if (prev.has(id)) next.add(id)
      })
      return next.size > 0 ? next : new Set(ids)
    })
  }, [cart])

  const cartLines = useMemo(
    () =>
      cart
        .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) }))
        .filter((c) => c.product),
    [cart, products],
  )

  const selectedLines = useMemo(
    () => cartLines.filter((c) => selectedIds.has(c.productId)),
    [cartLines, selectedIds],
  )

  const selectedCount = selectedLines.reduce((a, c) => a + c.quantity, 0)
  const total = selectedLines.reduce((sum, c) => sum + c.product.price * c.quantity, 0)
  const allSelected = cartLines.length > 0 && selectedLines.length === cartLines.length
  const dashboardPath = routeForUser(user)
  const dashboardLabel =
    (user?.role || '').toLowerCase() === 'admin'
      ? 'Back to admin dashboard'
      : (user?.role || '').toLowerCase() === 'vendor'
        ? 'Back to vendor dashboard'
        : 'Back to dashboard'

  function toggleItem(productId) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(cartLines.map((c) => c.productId)))
  }

  async function handleReceipt(file) {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const res = await api.uploadPaymentReceipt(file)
      if (!res?.url) throw new Error('Upload failed — no URL returned')
      setReceiptUrl(res.url)
      setReceiptName(file.name)
    } catch (e) {
      setError(e.message || 'Receipt upload failed')
      setReceiptUrl('')
      setReceiptName('')
    } finally {
      setUploading(false)
    }
  }

  async function placeOrder() {
    if (selectedLines.length === 0) {
      setError('Select at least one item to checkout.')
      return
    }
    if (!receiptUrl) {
      setError('Upload a payment receipt before placing the order.')
      return
    }
    setLoading(true)
    setError('')
    const result = await dispatch(
      initiateCheckout({
        fullName: delivery.fullName,
        address: delivery.address,
        phone: delivery.phone,
        productIds: Array.from(selectedIds),
        paymentReceiptUrl: receiptUrl,
      }),
    )
    setLoading(false)
    if (!initiateCheckout.fulfilled.match(result)) {
      setError(result.payload || 'Checkout failed — are you logged in?')
      return
    }
    setPlaced(true)
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="size-16 rounded-full bg-amber/15 flex items-center justify-center mb-6"
          >
            <Check size={28} className="text-amber" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-2">Order submitted</h1>
          <p className="text-onLight/50 mb-2 max-w-md">
            Your receipt is with Oscillate. An <strong className="text-onLight/70">admin must confirm</strong>{' '}
            the payment before your order is completed and prepared.
          </p>
          <p className="text-xs text-onLight/40 mb-8">
            Track status under Orders on your dashboard — you&apos;ll see &ldquo;Waiting for admin&rdquo; until confirmation.
          </p>
          <Button size="lg" onClick={() => navigate(dashboardPath)}>
            {dashboardLabel}
          </Button>
        </div>
      </div>
    )
  }

  if (cartLines.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-10">
          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-dim hover:text-leaf mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            {dashboardLabel}
          </Link>
          <div className="py-16 text-center">
            <h1 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h1>
            <p className="text-onLight/50 text-sm mb-8">Add products before checking out.</p>
            <Button size="lg" onClick={() => navigate(dashboardPath)}>
              Continue shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-10 md:py-14">
        <Link
          to={dashboardPath}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-dim hover:text-leaf mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          {dashboardLabel}
        </Link>
        <div className="grid md:grid-cols-[1fr_340px] gap-12">
        <div className="max-w-xl">
          <ProgressBar step={step} total={3} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8"
              >
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="font-display text-2xl font-semibold">Your cart</h2>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-medium text-leaf-dim hover:underline"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <p className="text-sm text-onLight/50 mb-5">
                  Adjust quantities, remove items, and choose what to checkout now.
                </p>
                <div className="flex flex-col gap-3">
                  {cartLines.map((line) => {
                    const selected = selectedIds.has(line.productId)
                    return (
                      <div
                        key={line.productId}
                        className={cn(
                          'flex gap-3 items-center bg-white border rounded-2xl p-3 sm:p-4 transition-colors',
                          selected ? 'border-leaf/40 ring-1 ring-leaf/15' : 'border-onLight/10 opacity-70',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleItem(line.productId)}
                          className="size-4 accent-[var(--color-leaf)] shrink-0"
                          aria-label={`Select ${line.product.name}`}
                        />
                        <Link
                          to={`/products/${line.productId}`}
                          className="size-16 rounded-xl overflow-hidden bg-paper border border-onLight/8 shrink-0"
                        >
                          <ProductThumb product={line.product} iconSize={22} />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${line.productId}`}
                            className="font-medium text-sm hover:text-leaf-dim line-clamp-1"
                          >
                            {line.product.name}
                          </Link>
                          <div className="text-xs text-onLight/40 mt-0.5">
                            ₦{line.product.price.toLocaleString()} each
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                dispatch(
                                  setCartQuantity({
                                    productId: line.productId,
                                    quantity: line.quantity - 1,
                                  }),
                                )
                              }
                              className="size-7 rounded-full border border-onLight/15 flex items-center justify-center hover:border-leaf/40"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{line.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                dispatch(
                                  setCartQuantity({
                                    productId: line.productId,
                                    quantity: line.quantity + 1,
                                  }),
                                )
                              }
                              className="size-7 rounded-full border border-onLight/15 flex items-center justify-center hover:border-leaf/40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-sm font-semibold">
                            ₦{(line.product.price * line.quantity).toLocaleString()}
                          </div>
                          <button
                            type="button"
                            onClick={() => dispatch(removeFromCart(line.productId))}
                            className="text-onLight/30 hover:text-coral p-1"
                            aria-label={`Remove ${line.product.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {selectedLines.length === 0 && (
                  <p className="text-sm text-coral mt-4">Select at least one item to continue.</p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 space-y-5"
              >
                <h2 className="font-display text-2xl font-semibold mb-4">Delivery address</h2>
                <Field label="Full name">
                  <Input
                    placeholder="Ada Obi"
                    value={delivery.fullName}
                    onChange={(e) => setDelivery((d) => ({ ...d, fullName: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="Address">
                  <Input
                    placeholder="Street, city, state"
                    value={delivery.address}
                    onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))}
                    required
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    placeholder="+234 800 000 0000"
                    value={delivery.phone}
                    onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                    required
                  />
                </Field>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 space-y-5"
              >
                <h2 className="font-display text-2xl font-semibold mb-2">Payment receipt</h2>
                <p className="text-sm text-onLight/55 mb-4">
                  Pay ₦{total.toLocaleString()} via bank transfer (or your usual method), then upload
                  a clear photo or PDF of the receipt. An admin will review and confirm before the
                  order is completed.
                </p>

                <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-onLight/15 rounded-2xl bg-white cursor-pointer hover:border-leaf/40 transition-colors">
                  {uploading ? (
                    <Loader2 size={28} className="text-leaf animate-spin" />
                  ) : receiptUrl ? (
                    <FileImage size={28} className="text-leaf-dim" />
                  ) : (
                    <UploadCloud size={28} className="text-onLight/35" />
                  )}
                  <span className="text-sm text-onLight/60 text-center max-w-xs">
                    {uploading
                      ? 'Uploading receipt…'
                      : receiptUrl
                        ? receiptName || 'Receipt uploaded — click to replace'
                        : 'Upload payment receipt (image or PDF)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={uploading || loading}
                    onChange={(e) => handleReceipt(e.target.files?.[0] || null)}
                  />
                </label>
                {receiptUrl && (
                  <div className="rounded-xl border border-leaf/20 bg-leaf/5 px-4 py-3 text-xs text-onLight/60 break-all">
                    Saved ·{' '}
                    {receiptUrl.startsWith('http') ? (
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-leaf-dim underline"
                      >
                        View receipt
                      </a>
                    ) : (
                      receiptUrl
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <h3 className="text-sm font-semibold text-onLight/70">Review</h3>
                  {selectedLines.map((c) => (
                    <div
                      key={c.productId}
                      className="flex justify-between text-sm bg-white border border-onLight/10 rounded-lg p-3"
                    >
                      <span>
                        {c.product.name} × {c.quantity}
                      </span>
                      <span>₦{(c.product.price * c.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button
              disabled={
                loading ||
                uploading ||
                (step === 1 && selectedLines.length === 0) ||
                (step === 2 && (!delivery.fullName || !delivery.address || !delivery.phone)) ||
                (step === 3 && !receiptUrl)
              }
              onClick={() => (step < 3 ? setStep(step + 1) : placeOrder())}
            >
              {loading ? 'Submitting…' : step < 3 ? 'Continue' : 'Submit order'}
            </Button>
          </div>
        </div>

        <aside className="bg-white border border-onLight/10 rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-sm mb-4">Order summary</h3>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Selected items</span>
            <span>{selectedCount}</span>
          </div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Lines</span>
            <span>
              {selectedLines.length} of {cartLines.length}
            </span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-onLight/10">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-onLight/40 mt-4 leading-relaxed">
            Upload a receipt, then wait for admin confirmation. Your order is not complete until
            Oscillate confirms payment.
          </p>
        </aside>
        </div>
      </div>
    </div>
  )
}
