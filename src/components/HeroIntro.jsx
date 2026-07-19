import { motion, useReducedMotion } from 'framer-motion'

export default function HeroIntro({ children }) {
  const reduceMotion = useReducedMotion()

  return (
    <div>
      <motion.div
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
        style={{ transformOrigin: 'left' }}
        className="w-12 h-[3px] rounded-full bg-leaf mb-5"
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}
