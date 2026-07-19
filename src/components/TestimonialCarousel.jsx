import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

const testimonials = [
  { quote: "Found a leather tote I still get compliments on, from a vendor I'd never have discovered anywhere else.", author: 'Ijeoma A.', role: 'Customer since 2025' },
  { quote: "Applied on a Tuesday, verified by Thursday. Didn't expect a marketplace to move that fast.", author: 'Kunle O.', role: 'Vendor, Everstock Electronics' },
  { quote: "The feed actually reflects what I search for — no wading through things I'll never buy.", author: 'Chiamaka N.', role: 'Customer since 2026' },
]

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      className="max-w-2xl mx-auto text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Quote size={28} className="text-leaf/40 mx-auto mb-6" strokeWidth={1.5} />
      <div className="min-h-[140px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xl md:text-2xl font-display text-onLight leading-snug">
              "{testimonials[index].quote}"
            </p>
            <p className="text-sm text-onLight/45 mt-5">
              {testimonials[index].author} · {testimonials[index].role}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-1.5 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-6 bg-leaf' : 'w-1.5 bg-onLight/15 hover:bg-onLight/25',
            )}
          />
        ))}
      </div>
    </div>
  )
}
