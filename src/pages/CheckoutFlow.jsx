import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import ProgressBar from '@/components/ui/ProgressBar'
import { initiateCheckout, fetchCart, fetchProducts } from '@/store/slices/catalogSlice'
import { api } from '@/lib/api'

export default function CheckoutFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.catalog.cart)
  const products = useSelector((s) => s.catalog.products)
  const user = useSelector((s) => s.auth.user)
  const [step, setStep] = useState(1)
  const [placed, setPlaced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paystackEnabled, setPaystackEnabled] = useState(false)
  const [delivery, setDelivery] = useState({
    fullName: user?.name || '',
    address: '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCart())
    api.paymentConfig()
      .then((cfg) => setPaystackEnabled(Boolean(cfg?.paystackEnabled)))
      .catch(() => setPaystackEnabled(false))
  }, [dispatch])

  const total = cart.reduce((sum, c) => {
    const p = products.find((p) => p.id === c.productId)
    return sum + (p ? p.price * c.quantity : 0)
  }, 0)

  async function placeOrder() {
    setLoading(true)
    setError('')
    const result = await dispatch(
      initiateCheckout({
        fullName: delivery.fullName,
        address: delivery.address,
        phone: delivery.phone,
      }),
    )
    setLoading(false)
    if (!initiateCheckout.fulfilled.match(result)) {
      setError(result.payload || 'Checkout failed — are you logged in?')
      return
    }

    const data = result.payload
    if (data?.paystackEnabled && data?.authorizationUrl) {
      // Hand off to Paystack hosted page; callback returns to /checkout/callback
      window.location.href = data.authorizationUrl
      return
    }

    // Demo mode (no Paystack keys): order already paid
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
            className="size-16 rounded-full bg-emerald/15 flex items-center justify-center mb-6"
          >
            <Check size={28} className="text-emerald" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-2">Order placed</h1>
          <p className="text-onLight/50 mb-8">
            Demo checkout completed (Paystack not configured). We&apos;ll email a confirmation shortly.
          </p>
          <Button size="lg" onClick={() => navigate('/customer/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-14 grid md:grid-cols-[1fr_320px] gap-12">
        <div className="max-w-lg">
          <ProgressBar step={step} total={3} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
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
            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold mb-4">Payment</h2>
                {paystackEnabled ? (
                  <div className="rounded-2xl border border-onLight/10 bg-white p-5 space-y-3">
                    <div className="flex items-center gap-2 text-leaf font-medium text-sm">
                      <Shield size={16} />
                      Secure checkout with Paystack
                    </div>
                    <p className="text-sm text-onLight/55">
                      You&apos;ll be redirected to Paystack to pay with card, bank, or USSD.
                      Amount: <strong className="text-onLight">₦{total.toLocaleString()}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber/30 bg-amber/5 p-5 space-y-2">
                    <p className="text-sm font-medium text-onLight">Demo payment mode</p>
                    <p className="text-sm text-onLight/55">
                      Paystack keys are not configured on the server. Placing an order will complete
                      without a real charge. Set <code className="text-xs">PAYSTACK_SECRET_KEY</code> to
                      enable live payments.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8">
                <h2 className="font-display text-2xl font-semibold mb-4">Review your order</h2>
                <div className="flex flex-col gap-2">
                  {cart.map((c) => {
                    const p = products.find((p) => p.id === c.productId)
                    if (!p) return null
                    return (
                      <div key={c.productId} className="flex justify-between text-sm bg-white border border-onLight/10 rounded-lg p-3">
                        <span>{p.name} × {c.quantity}</span>
                        <span>₦{(p.price * c.quantity).toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
                {error && <p className="text-sm text-coral mt-4">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            ) : <span />}
            <Button
              disabled={loading || (step === 1 && (!delivery.fullName || !delivery.address || !delivery.phone))}
              onClick={() => (step < 3 ? setStep(step + 1) : placeOrder())}
            >
              {loading
                ? paystackEnabled
                  ? 'Redirecting…'
                  : 'Placing…'
                : step < 3
                  ? 'Continue'
                  : paystackEnabled
                    ? 'Pay with Paystack'
                    : 'Place order'}
            </Button>
          </div>
        </div>

        <aside className="bg-white border border-onLight/10 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-sm mb-4">Order summary</h3>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Items</span><span>{cart.reduce((a, c) => a + c.quantity, 0)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-onLight/10">
            <span>Total</span><span>₦{total.toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
