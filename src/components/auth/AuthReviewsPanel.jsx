/**
 * AuthReviewsPanel
 * ----------------
 * Right-side carousel for auth pages. Shows product/vendor style reviews.
 *
 * Data strategy (kept light):
 *   1. Prefer real product reviews from the catalog store when present
 *   2. Else build short quotes from product ratings already loaded
 *   3. Else use a small static fallback so the panel never looks empty
 *
 * Does NOT call social logins or heavy APIs beyond optional product fetch.
 */

import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { fetchProducts } from '@/store/slices/catalogSlice'
import ProductThumb from '@/components/ProductThumb'
import { cn } from '@/lib/utils'

/** Static slides if the catalog has no products/reviews yet */
const FALLBACK_SLIDES = [
  {
    id: 'fallback-1',
    kind: 'product',
    quote: 'Quality matched the listing. Delivery was smooth and the seller responded quickly.',
    author: 'Ada O.',
    context: 'Product review · Fashion',
    rating: 5,
  },
  {
    id: 'fallback-2',
    kind: 'vendor',
    quote: 'This vendor is reliable — careful packaging and the product arrived as described.',
    author: 'Chidi M.',
    context: 'Vendor review · Electronics',
    rating: 5,
  },
  {
    id: 'fallback-3',
    kind: 'product',
    quote: 'Easy to find what I wanted. Checkout with a receipt was clear and fair.',
    author: 'Funke A.',
    context: 'Product review · Home',
    rating: 4,
  },
]

/** Build a stable list of slides from Redux catalog data */
function buildSlides(products, productReviews) {
  const slides = []

  // Real product reviews (if any were already in the store)
  productReviews.slice(0, 6).forEach((r) => {
    const product = products.find((p) => p.id === r.productId)
    slides.push({
      id: `review-${r.id || r.productId}-${r.author}`,
      kind: 'product',
      quote: r.comment || 'Great product on Oscillate.',
      author: r.author || 'Shopper',
      context: product ? `Product · ${product.name}` : 'Product review',
      rating: r.rating || 5,
      product,
    })
  })

  // Catalog ratings as lightweight “review” cards
  if (slides.length < 2) {
    products
      .filter((p) => p.rating)
      .slice(0, 4)
      .forEach((p) => {
        slides.push({
          id: `product-${p.id}`,
          kind: 'product',
          quote: `Shoppers rate ${p.name} highly from ${p.vendor || 'verified vendors'} on Oscillate.`,
          author: 'Oscillate shopper',
          context: `Product · ${p.category || 'Marketplace'}`,
          rating: Math.round(p.rating) || 5,
          product: p,
        })
      })
  }

  // Vendor-flavoured cards from product vendor names
  if (slides.length < 3) {
    const vendors = [...new Set(products.map((p) => p.vendor).filter(Boolean))].slice(0, 2)
    vendors.forEach((name, i) => {
      slides.push({
        id: `vendor-${i}-${name}`,
        kind: 'vendor',
        quote: `${name} is a verified seller on Oscillate — shoppers trust their listings.`,
        author: 'Community',
        context: `Vendor review · ${name}`,
        rating: 5,
      })
    })
  }

  return slides.length ? slides : FALLBACK_SLIDES
}

export default function AuthReviewsPanel() {
  const dispatch = useDispatch()
  const products = useSelector((s) => s.catalog.products)
  const productReviews = useSelector((s) => s.catalog.productReviews)
  const [index, setIndex] = useState(0)

  // Warm public catalog once (cached in the store; cheap if already loaded)
  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const slides = useMemo(
    () => buildSlides(products, productReviews),
    [products, productReviews],
  )

  // Keep index valid when the slide list shrinks
  useEffect(() => {
    if (index >= slides.length) setIndex(0)
  }, [index, slides.length])

  const slide = slides[index] || slides[0]
  const canNavigate = slides.length > 1

  function go(delta) {
    setIndex((i) => (i + delta + slides.length) % slides.length)
  }

  return (
    // Soft leaf panel — readable, site-themed (not dark/black)
    <div className="relative h-full min-h-[240px] md:min-h-full rounded-2xl overflow-hidden bg-gradient-to-br from-leaf/20 via-leaf/10 to-canopy/15 border border-leaf/10">
      <div className="relative z-10 flex flex-col h-full p-5 sm:p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[11px] font-medium text-leaf-dim bg-white/80 rounded-full px-3 py-1 border border-leaf/15">
            Product reviews
          </span>
          <span className="text-[11px] font-medium text-leaf-dim bg-white/80 rounded-full px-3 py-1 border border-leaf/15">
            Vendor reviews
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Optional product chip */}
            {slide.product && (
              <div className="mb-4 flex items-center gap-3 bg-white border border-onLight/8 rounded-xl p-2 max-w-[230px] shadow-sm">
                <div className="size-11 rounded-lg overflow-hidden bg-paper shrink-0">
                  <ProductThumb product={slide.product} iconSize={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-onLight text-xs font-semibold line-clamp-2">
                    {slide.product.name}
                  </div>
                  <div className="text-onLight/45 text-[10px] mt-0.5 truncate">
                    {slide.product.vendor}
                  </div>
                </div>
              </div>
            )}

            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={cn(
                    i < (slide.rating || 5) ? 'fill-amber text-amber' : 'text-onLight/15',
                  )}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-onLight text-base sm:text-lg font-medium leading-snug tracking-tight max-w-sm">
              “{slide.quote}”
            </p>

            <div className="mt-4">
              <div className="text-onLight text-sm font-semibold">{slide.author}</div>
              <div className="text-onLight/50 text-xs mt-0.5">{slide.context}</div>
              <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-leaf-dim bg-leaf/10 rounded-full px-2 py-0.5">
                {slide.kind === 'vendor' ? 'Vendor' : 'Product'}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls */}
        {canNavigate && (
          <div className="flex items-center gap-2 mt-6 self-end">
            <button
              type="button"
              onClick={() => go(-1)}
              className="size-9 rounded-full bg-white border border-onLight/10 text-onLight/60 hover:text-leaf-dim hover:border-leaf/30 flex items-center justify-center transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="size-9 rounded-full bg-white border border-onLight/10 text-onLight/60 hover:text-leaf-dim hover:border-leaf/30 flex items-center justify-center transition-colors"
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
