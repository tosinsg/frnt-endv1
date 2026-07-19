import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import cartWebp from '@/assets/cart-full.webp'
import cartPng from '@/assets/cart-full.png'
import { TRAVEL_DURATION, TRAVEL_DELAY } from '@/components/HeadlineWipe'

// Fixed points along the travel path — each fades in and shrinks away right
// as the cart would be passing it, reading as a trail left by the wheels.
const TRAIL_MARKS = [
  { left: '2%', delayFrac: 0.05 },
  { left: '16%', delayFrac: 0.2 },
  { left: '30%', delayFrac: 0.35 },
  { left: '44%', delayFrac: 0.5 },
  { left: '56%', delayFrac: 0.65 },
]

export default function GroceryCartHero() {
  const reduceMotion = useReducedMotion()
  const [arrived, setArrived] = useState(reduceMotion ? true : false)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {!reduceMotion && (
        <AnimatePresence>
          {TRAIL_MARKS.map((mark, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2"
              style={{ left: mark.left, marginTop: '110px' }}
              initial={{ opacity: 0, scaleX: 1 }}
              animate={{ opacity: [0, 0.45, 0], scaleX: [1, 0.3] }}
              transition={{
                duration: 0.55,
                delay: TRAVEL_DELAY + mark.delayFrac * TRAVEL_DURATION,
                ease: 'easeOut',
              }}
            >
              <div className="w-12 h-[3px] rounded-full bg-onLight/20 origin-right" />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* The cart — groceries and the flying tomato are already part of the photo */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 right-[2%] sm:right-[3%] md:right-[4%] w-[300px] sm:w-[380px] md:w-[440px] lg:w-[500px]"
        initial={reduceMotion ? false : { x: '-210%' }}
        animate={{ x: '0%' }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: TRAVEL_DURATION, delay: TRAVEL_DELAY, ease: [0.65, 0, 0.35, 1] }
        }
        onAnimationComplete={() => setArrived(true)}
      >
        <motion.div
          animate={{ rotate: arrived ? -6 : 0 }}
          transition={{ type: 'spring', stiffness: 130, damping: 9 }}
        >
          <picture>
            <source srcSet={cartWebp} type="image/webp" />
            <img src={cartPng} alt="" className="w-full h-auto select-none" draggable={false} />
          </picture>
        </motion.div>
      </motion.div>
    </div>
  )
}
