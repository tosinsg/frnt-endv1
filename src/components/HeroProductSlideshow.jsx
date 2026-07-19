import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import ProductThumb from '@/components/ProductThumb'
import { cn } from '@/lib/utils'

// A different entrance/exit personality per slide, cycled by index — this is
// what makes consecutive slides feel distinct rather than one repeating loop.
const VARIANTS = [
  {
    initial: { opacity: 0, scale: 0.82 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.12 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
  {
    initial: { opacity: 0, x: 90 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -90 },
    transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] },
  },
  {
    initial: { opacity: 0, y: 70 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -70 },
    transition: { duration: 0.6, ease: [0.34, 1.2, 0.64, 1] },
  },
  {
    initial: { opacity: 0, rotate: -10, scale: 0.9 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 10, scale: 0.9 },
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
  {
    initial: { opacity: 0, filter: 'blur(14px)', scale: 1.06 },
    animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: { opacity: 0, filter: 'blur(14px)', scale: 0.94 },
    transition: { duration: 0.7, ease: 'easeOut' },
  },
]

// Fades the image's own edges into whatever sits behind it — works whether
// the source has real alpha (the hoodies do) or not, so there's never a
// hard rectangular/card outline.
const EDGE_MASK = 'radial-gradient(ellipse 60% 62% at 50% 46%, black 58%, transparent 100%)'

const AUTOPLAY_MS = 3400

export default function HeroProductSlideshow({ products, className = '' }) {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const items = useMemo(() => products.slice(0, 6), [products])

  useEffect(() => {
    if (paused || reduceMotion || items.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, reduceMotion, items.length])

  if (items.length === 0) return null

  const product = items[index]
  const variant = VARIANTS[index % VARIANTS.length]

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col items-center', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => navigate(`/products/${product.id}`)}
        className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 cursor-pointer"
        aria-label={`View ${product.name}`}
      >
        {/* Pedestal glow — grounds the floating product like a studio shot */}
        <div
          className="absolute left-1/2 bottom-4 -translate-x-1/2 w-2/3 h-8 rounded-full bg-onLight/10 blur-xl"
          aria-hidden="true"
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={reduceMotion ? false : variant.initial}
            animate={{ ...variant.animate, scale: paused ? (variant.animate.scale || 1) * 1.04 : variant.animate.scale }}
            exit={reduceMotion ? { opacity: 0 } : variant.exit}
            transition={variant.transition}
            className="absolute inset-0"
            style={{
              maskImage: EDGE_MASK,
              WebkitMaskImage: EDGE_MASK,
            }}
          >
            <ProductThumb product={product} iconSize={64} />
          </motion.div>
        </AnimatePresence>
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={product.id + '-caption'}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="text-center mt-2"
        >
          <div className="text-sm font-medium text-onLight">{product.name}</div>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Star size={11} className="fill-amber text-amber" />
            <span className="text-xs text-onLight/45">{product.rating}</span>
            <span className="text-xs text-leaf-dim font-semibold">₦{product.price.toLocaleString()}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-1.5 mt-4">
        {items.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIndex(i)}
            aria-label={`Show ${p.name}`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-5 bg-leaf' : 'w-1.5 bg-onLight/15 hover:bg-onLight/25',
            )}
          />
        ))}
      </div>
    </motion.div>
  )
}
