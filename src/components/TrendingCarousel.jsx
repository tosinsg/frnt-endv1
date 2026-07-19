import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import { cn } from '@/lib/utils'

const PER_SLIDE = { base: 1, sm: 2, lg: 4 }

export default function TrendingCarousel({ products, autoplayMs = 4200 }) {
  const perSlide = PER_SLIDE.lg
  const slideCount = Math.max(1, Math.ceil(products.length / perSlide))
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const go = useCallback(
    (next) => {
      setDirection(next > index || (index === slideCount - 1 && next === 0) ? 1 : -1)
      setIndex(((next % slideCount) + slideCount) % slideCount)
    },
    [index, slideCount],
  )

  useEffect(() => {
    if (paused || slideCount <= 1) return
    const id = setInterval(() => go(index + 1), autoplayMs)
    return () => clearInterval(id)
  }, [index, paused, slideCount, autoplayMs, go])

  const slice = products.slice(index * perSlide, index * perSlide + perSlide)

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {slice.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="block bg-paper border border-onLight/10 rounded-2xl overflow-hidden hover:border-leaf/40 transition-colors"
              >
                <div className="aspect-square">
                  <ProductThumb product={p} iconSize={30} />
                </div>
                <div className="p-4">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star size={12} className="fill-amber text-amber" />
                    <span className="text-xs text-onLight/45">{p.rating} · {p.vendor}</span>
                  </div>
                  <div className="mt-2">
                    <PriceTag product={p} />
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {slideCount > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-1.5">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-6 bg-leaf' : 'w-1.5 bg-onLight/15 hover:bg-onLight/25',
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous"
              className="p-2 rounded-full border border-onLight/10 hover:border-leaf/40 hover:text-leaf-dim transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next"
              className="p-2 rounded-full border border-onLight/10 hover:border-leaf/40 hover:text-leaf-dim transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
