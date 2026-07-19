import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Reveal from '@/components/Reveal'
import { CATEGORY_TINTS } from '@/lib/categoryTints'

const categories = [
  { name: 'Electronics', count: '120+ items' },
  { name: 'Fashion', count: '340+ items' },
  { name: 'Home', count: '210+ items' },
  { name: 'Beauty', count: '95+ items' },
  { name: 'Sports', count: '60+ items' },
]

export default function CategoryShowcase() {
  return (
    <section className="bg-white py-24">
      <div className="container-page">
        <Reveal className="mb-10">
          <span className="text-sm font-medium text-leaf-dim">Explore</span>
          <h2 className="font-display text-3xl font-semibold mt-1">Shop by category</h2>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => {
            const tint = CATEGORY_TINTS[cat.name]
            return (
              <Reveal key={cat.name} delay={i * 0.06}>
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className={`relative rounded-2xl aspect-[4/5] p-5 flex flex-col justify-between overflow-hidden ${tint.bg}`}
                  >
                    <tint.Icon size={26} className={tint.icon} strokeWidth={1.5} />
                    <div>
                      <div className="font-semibold text-sm text-onLight">{cat.name}</div>
                      <div className="text-xs text-onLight/45 mt-0.5">{cat.count}</div>
                    </div>
                  </motion.div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
