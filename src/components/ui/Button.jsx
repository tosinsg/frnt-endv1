import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-leaf text-onDark shadow-md shadow-leaf/25 hover:bg-leaf-dim hover:shadow-lg hover:shadow-leaf/30',
  dark: 'bg-ink text-onDark shadow-md shadow-ink/20 hover:bg-black hover:shadow-lg',
  outline: 'border border-onLight/20 text-onLight hover:border-onLight/40 hover:bg-onLight/[0.03]',
  outlineDark: 'border border-onDark/25 text-onDark hover:border-onDark/50',
  ghost: 'text-onLight hover:bg-onLight/5',
}

const sizes = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

const MotionSlot = { button: motion.button, a: motion.a, div: motion.div }

export default function Button({
  as = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  // Single motion element instead of a motion.div wrapper around a plain
  // element — halves the DOM nodes this component produces across the app.
  const Comp = MotionSlot[as] || motion.button
  return (
    <Comp
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'tween', duration: 0.12, ease: 'easeOut' }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,box-shadow,border-color] duration-150 disabled:opacity-40 disabled:pointer-events-none will-change-transform',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
