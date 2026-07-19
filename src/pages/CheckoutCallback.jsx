import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Check, XCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import PageLoader from '@/components/PageLoader'
import { verifyPayment } from '@/store/slices/catalogSlice'

export default function CheckoutCallback() {
  const [params] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const reference = params.get('reference') || params.get('trxref')
  const [status, setStatus] = useState(reference ? 'loading' : 'error')
  const [message, setMessage] = useState(reference ? '' : 'Missing payment reference.')

  useEffect(() => {
    if (!reference) return
    let cancelled = false
    ;(async () => {
      const result = await dispatch(verifyPayment(reference))
      if (cancelled) return
      if (verifyPayment.fulfilled.match(result)) {
        setStatus('success')
        setMessage(
          'Payment received. Your order is waiting for admin confirmation before fulfillment starts.',
        )
      } else {
        setStatus('error')
        setMessage(result.payload || 'Payment verification failed.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reference, dispatch])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="py-24">
          <PageLoader />
          <p className="text-center text-onLight/50 text-sm mt-4">Confirming your payment…</p>
        </div>
      </div>
    )
  }

  const ok = status === 'success'

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-24 text-center flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`size-16 rounded-full flex items-center justify-center mb-6 ${
            ok ? 'bg-emerald/15' : 'bg-coral/15'
          }`}
        >
          {ok ? (
            <Check size={28} className="text-emerald" />
          ) : (
            <XCircle size={28} className="text-coral" />
          )}
        </motion.div>
        <h1 className="font-display text-3xl font-semibold mb-2">
          {ok ? 'Payment received' : 'Payment issue'}
        </h1>
        <p className="text-onLight/50 mb-8 max-w-md">{message}</p>
        <div className="flex gap-3">
          <Button size="lg" onClick={() => navigate('/customer/dashboard')}>
            Dashboard
          </Button>
          {!ok && (
            <Button size="lg" variant="outline" onClick={() => navigate('/checkout')}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
