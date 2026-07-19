import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { setRegistrationIntent } from '@/store/slices/authSlice'

export default function AuthEntry() {
  const [params] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    // e.g. /auth?intent=customer when the link came from a product page
    const intent = params.get('intent')
    if (intent) dispatch(setRegistrationIntent(intent))
  }, [params, dispatch])

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-24 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <h1 className="font-display text-4xl font-semibold mb-3">Welcome to Oscillate</h1>
          <p className="text-onLight/60 mb-10">
            One account, whichever way you want to use it — as a shopper or as a vendor.
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => navigate('/register')} className="w-full">
              Create an account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full">
              Log in
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
