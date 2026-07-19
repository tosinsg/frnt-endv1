import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import ProductThumb from '@/components/ProductThumb'
import { discountPercent } from '@/components/PriceTag'

const RADIUS = 190
const ROTATION_SECONDS = 26

export default function ProductGlobeCarousel({ products, className = '' }) {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [paused, setPaused] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  const items = useMemo(() => products.slice(0, 6), [products])
  const angleStep = 360 / Math.max(items.length, 1)

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 90 }}
      animate={{ opacity: 1, x: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ perspective: '1400px' }}
    >
      <motion.div
        className="relative mx-auto"
        style={{ width: RADIUS * 2, height: RADIUS * 2.05, transformStyle: 'preserve-3d' }}
        animate={reduceMotion || paused ? {} : { rotateY: 360 }}
        transition={reduceMotion || paused ? {} : { duration: ROTATION_SECONDS, repeat: Infinity, ease: 'linear' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false)
          setHoveredId(null)
        }}
      >
        {items.map((product, i) => {
          const angle = i * angleStep
          const pct = discountPercent(product)
          const isHovered = hoveredId === product.id
          return (
            <div
              key={product.id}
              className="absolute left-1/2 top-1/2"
              style={{
                width: 132,
                height: 168,
                marginLeft: -66,
                marginTop: -84,
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <button
                type="button"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => navigate(`/products/${product.id}`)}
                className="relative w-full h-full rounded-2xl overflow-hidden bg-white border border-onLight/10 shadow-lg shadow-onLight/10 text-left cursor-pointer transition-transform duration-200"
                style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
              >
                <ProductThumb product={product} iconSize={26} />
                {pct && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-coral rounded-md px-1.5 py-0.5">
                    -{pct}%
                  </span>
                )}
                <div
                  className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm px-2.5 py-2 transition-opacity duration-200"
                  style={{ opacity: isHovered ? 1 : 0 }}
                >
                  <div className="text-[11px] font-medium leading-tight truncate">{product.name}</div>
                  <div className="text-[11px] font-semibold text-leaf-dim mt-0.5">
                    &#8358;{product.price.toLocaleString()}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
