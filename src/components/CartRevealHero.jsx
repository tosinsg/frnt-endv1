import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Apple, Banana, Carrot, Grape, Citrus } from 'lucide-react'
import cartWebp from '@/assets/cart-empty.webp'
import cartPng from '@/assets/cart-empty.png'

const TRAVEL_DURATION = 1.4
const TRAVEL_DELAY = 0.15
const ARRIVAL = TRAVEL_DELAY + TRAVEL_DURATION

// The cart photo is a 3/4-angle shot with the basket opening roughly in its
// upper-middle area — items are anchored there (not the image's center) so
// they read as coming out of the basket, not floating in front of the whole
// photo. Colors are true-to-life produce colors rather than brand green —
// deliberate, since these represent real groceries, not UI chrome.
const items = [
  { Icon: Apple, color: '#E5484D', x: -60, y: -80, rot: -10 },
  { Icon: Banana, color: '#E0A030', x: 20, y: -105, rot: 8 },
  { Icon: Carrot, color: '#E0692A', x: 80, y: -65, rot: -6 },
  { Icon: Grape, color: '#7C5CBF', x: -15, y: -125, rot: 12 },
  { Icon: Citrus, color: '#3FBF6B', x: -95, y: -35, rot: 4 },
]

// Fixed points along the travel path — each one fades in and shrinks away
// right as the cart would be passing it, reading as a trail left by the
// wheels rather than anything attached to the cart itself.
const TRAIL_MARKS = [
  { left: '-10%', delayFrac: 0.05 },
  { left: '4%', delayFrac: 0.22 },
  { left: '18%', delayFrac: 0.39 },
  { left: '32%', delayFrac: 0.56 },
  { left: '46%', delayFrac: 0.73 },
]

export default function CartRevealHero({ children }) {
  const reduceMotion = useReducedMotion()
  const [arrived, setArrived] = useState(reduceMotion ? true : false)

  return (
    <div className="relative w-full">
      {/* Headline wipes into view left-to-right, in sync with the cart's travel */}
      <motion.div
        initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: TRAVEL_DURATION, delay: TRAVEL_DELAY, ease: [0.65, 0, 0.35, 1] }
        }
      >
        {children}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
        {/* Trailing marks, timed to when the cart would be passing each point */}
        {!reduceMotion && (
          <AnimatePresence>
            {TRAIL_MARKS.map((mark, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2"
                style={{ left: mark.left, marginTop: '38px' }}
                initial={{ opacity: 0, scaleX: 1 }}
                animate={{ opacity: [0, 0.5, 0], scaleX: [1, 0.3] }}
                transition={{
                  duration: 0.5,
                  delay: TRAVEL_DELAY + mark.delayFrac * TRAVEL_DURATION,
                  ease: 'easeOut',
                }}
              >
                <div className="w-8 h-[3px] rounded-full bg-onLight/25 origin-right" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* The cart itself */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          initial={reduceMotion ? false : { left: '-22%' }}
          animate={{ left: '58%' }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: TRAVEL_DURATION, delay: TRAVEL_DELAY, ease: [0.65, 0, 0.35, 1] }
          }
          onAnimationComplete={() => setArrived(true)}
        >
          {/* Tilt wrapper — settles under "weight" once the cart arrives */}
          <motion.div
            animate={{ rotate: arrived ? -7 : 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 9 }}
            className="relative"
          >
            <picture>
              <source srcSet={cartWebp} type="image/webp" />
              <img src={cartPng} alt="" className="w-72 md:w-80 h-auto select-none" draggable={false} />
            </picture>

            {/* Items anchored near the basket opening (upper-middle of the photo) */}
            <div className="absolute" style={{ left: '46%', top: '24%' }}>
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  className="absolute left-0 top-0 size-9 md:size-10 rounded-xl bg-white shadow-md flex items-center justify-center"
                  style={{ '--float-rot': `${item.rot}deg` }}
                  initial={reduceMotion ? false : { x: 0, y: 0, opacity: 0, scale: 0.3 }}
                  animate={{ x: item.x, y: item.y, opacity: 1, scale: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.5, delay: ARRIVAL + i * 0.07, ease: [0.34, 1.56, 0.64, 1] }
                  }
                >
                  <motion.div className={reduceMotion ? '' : 'animate-float'} style={{ animationDelay: `${i * 0.25}s` }}>
                    <item.Icon size={17} style={{ color: item.color }} strokeWidth={1.75} />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
