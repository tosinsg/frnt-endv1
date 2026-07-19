import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductThumb from '@/components/ProductThumb'

// Positioned to sit near where the cart lands (see GroceryCartHero), pulled
// into the true corners so they clear the now much bigger cart + produce pile.
const SLOTS = [
  { top: '5%', right: '1%', delay: 1.9 },
  { bottom: '6%', right: '5%', delay: 2.05 },
]

export default function HeroFloatingCards({ products }) {
  const reduceMotion = useReducedMotion()
  const picks = products.slice(0, 2)

  return (
    <div className="hidden md:block pointer-events-none absolute inset-0">
      {picks.map((p, i) => {
        const slot = SLOTS[i]
        return (
          <motion.div
            key={p.id}
            className="pointer-events-auto absolute"
            style={slot}
            initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { delay: slot.delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={`/products/${p.id}`}
              className="flex items-center gap-2.5 bg-white rounded-2xl shadow-lg shadow-onLight/10 border border-onLight/8 p-2.5 pr-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="size-11 rounded-xl overflow-hidden shrink-0">
                <ProductThumb product={p} iconSize={18} />
              </div>
              <div>
                <div className="text-xs font-medium leading-tight max-w-[110px] truncate">{p.name}</div>
                <div className="text-xs text-leaf-dim font-semibold mt-0.5">₦{p.price.toLocaleString()}</div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
