import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { completePersonalization } from '@/store/slices/authSlice'
import { routeForUser } from '@/lib/authRoutes'
import { cn } from '@/lib/utils'

const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books', 'Sports']
const budgets = ['Under ₦10,000', '₦10,000 – ₦50,000', '₦50,000 – ₦150,000', '₦150,000+']
const styles = [
  { id: 'deals', label: 'Browsing for deals', desc: "Show me what's discounted or trending" },
  { id: 'specific', label: 'Shopping for specific needs', desc: 'I usually know exactly what I want' },
]

export default function CustomerOnboardingQuiz() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [interests, setInterests] = useState([])
  const [budget, setBudget] = useState(null)
  const [style, setStyle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleInterest(cat) {
    setInterests((cur) => (cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat]))
  }

  async function finish(skipped = false) {
    setLoading(true)
    setError('')
    const result = await dispatch(
      completePersonalization(
        skipped
          ? { interests: [], budgetRange: null, shoppingStyle: null }
          : { interests, budgetRange: budget, shoppingStyle: style },
      ),
    )
    setLoading(false)
    if (completePersonalization.fulfilled.match(result)) {
      navigate(routeForUser(result.payload), { replace: true })
    } else {
      setError(result.payload || 'Could not save preferences')
    }
  }

  function next() {
    if (step < 3) setStep(step + 1)
    else finish(false)
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 flex justify-center">
        <div className="w-full max-w-lg">
          <ProgressBar step={step} total={3} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-10"
              >
                <h2 className="font-display text-3xl font-semibold mb-2">What are you into?</h2>
                <p className="text-onLight/50 mb-6 text-sm">Pick as many as you like.</p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleInterest(c)}
                      className={cn(
                        'py-4 rounded-xl border-2 text-sm font-medium transition-colors',
                        interests.includes(c)
                          ? 'border-leaf bg-leaf/5 text-leaf'
                          : 'border-onLight/10 bg-white text-onLight/70 hover:border-onLight/25',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-10"
              >
                <h2 className="font-display text-3xl font-semibold mb-2">What&apos;s your budget?</h2>
                <p className="text-onLight/50 mb-6 text-sm">Typical spend per order.</p>
                <div className="flex flex-col gap-3">
                  {budgets.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      className={cn(
                        'text-left py-4 px-5 rounded-xl border-2 text-sm font-medium transition-colors',
                        budget === b
                          ? 'border-leaf bg-leaf/5 text-leaf'
                          : 'border-onLight/10 bg-white text-onLight/70 hover:border-onLight/25',
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-10"
              >
                <h2 className="font-display text-3xl font-semibold mb-2">How do you usually shop?</h2>
                <p className="text-onLight/50 mb-6 text-sm">Helps us tune your feed.</p>
                <div className="flex flex-col gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        'text-left py-4 px-5 rounded-xl border-2 transition-colors',
                        style === s.id
                          ? 'border-leaf bg-leaf/5'
                          : 'border-onLight/10 bg-white hover:border-onLight/25',
                      )}
                    >
                      <div className="text-sm font-medium">{s.label}</div>
                      <div className="text-xs text-onLight/50 mt-1">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-sm text-coral mt-4">{error}</p>}

          <div className="flex justify-between mt-10">
            <button
              type="button"
              onClick={() => finish(true)}
              className="text-sm text-onLight/45 hover:text-onLight/70"
              disabled={loading}
            >
              Skip for now
            </button>
            <Button onClick={next} disabled={loading}>
              {loading ? 'Saving…' : step < 3 ? 'Next' : 'Finish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
