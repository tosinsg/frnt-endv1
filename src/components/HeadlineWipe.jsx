import { motion, useReducedMotion } from 'framer-motion'

// Keep in sync with GroceryCartHero.jsx's TRAVEL_DELAY / TRAVEL_DURATION —
// two separate elements timed to match rather than sharing one value.
export const TRAVEL_DURATION = 1.4
export const TRAVEL_DELAY = 0.15

export default function HeadlineWipe({ children }) {
  const reduceMotion = useReducedMotion()

  return (
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
  )
}
