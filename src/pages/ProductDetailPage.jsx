import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import {
  addToCart,
  addVendorReview,
  addProductReview,
  fetchProduct,
  fetchProductReviews,
  fetchVendorReviews,
} from '@/store/slices/catalogSlice'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const product = useSelector(
    (s) => s.catalog.products.find((p) => p.id === id) || s.catalog.currentProduct,
  )
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const vendorReviews = useSelector((s) =>
    s.catalog.vendorReviews.filter((r) => r.vendorId === product?.vendorId),
  )
  const productReviews = useSelector((s) =>
    s.catalog.productReviews.filter((r) => r.productId === id),
  )
  const [tab, setTab] = useState('product')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      dispatch(fetchProduct(id)),
      dispatch(fetchProductReviews(id)),
    ]).finally(() => setLoading(false))
  }, [dispatch, id])

  useEffect(() => {
    if (product?.vendorId) {
      dispatch(fetchVendorReviews(product.vendorId))
    }
  }, [dispatch, product?.vendorId])

  async function submitVendorReview(e) {
    e.preventDefault()
    if (!isAuthenticated) {
      setError('Log in to leave a review.')
      return
    }
    setError('')
    await dispatch(
      addVendorReview({ vendorId: product.vendorId, rating, comment, orderId: 'n/a' }),
    )
    setComment('')
  }

  async function submitProductReview(e) {
    e.preventDefault()
    if (!isAuthenticated) {
      setError('Log in to leave a review.')
      return
    }
    setError('')
    await dispatch(addProductReview({ productId: product.id, rating, comment }))
    setComment('')
  }

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center text-onLight/50">Loading…</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center text-onLight/50">Product not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-3xl overflow-hidden"
          >
            <ProductThumb product={product} iconSize={72} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-medium text-leaf">{product.category}</span>
            <h1 className="font-display text-3xl font-semibold mt-2 mb-2">{product.name}</h1>
            <Link to="#" className="text-sm text-onLight/50 hover:text-leaf">
              Sold by {product.vendor}
            </Link>
            <div className="flex items-center gap-1 mt-3 mb-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={16}
                  className={n <= Math.round(product.rating) ? 'fill-amber text-amber' : 'text-onLight/20'}
                />
              ))}
              <span className="text-xs text-onLight/40 ml-1">{product.rating}</span>
            </div>
            <p className="text-onLight/65 mb-8 max-w-md">{product.description}</p>
            <div className="flex items-center gap-6">
              <PriceTag product={product} size="lg" />
              <Button
                size="lg"
                onClick={() => {
                  if (!isAuthenticated) {
                    setError('Log in to add items to your cart.')
                    return
                  }
                  dispatch(addToCart(product.id))
                }}
              >
                Add to cart
              </Button>
            </div>
            {error && <p className="text-sm text-coral mt-4">{error}</p>}
          </motion.div>
        </div>

        <div className="mt-16 border-b border-onLight/10 flex gap-6">
          {['product', 'vendor'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 -mb-px',
                tab === t ? 'border-leaf text-leaf' : 'border-transparent text-onLight/45',
              )}
            >
              {t === 'product' ? 'Product reviews' : 'Vendor reviews'}
            </button>
          ))}
        </div>

        <div className="pt-8 max-w-xl">
          {tab === 'product' && (
            <div className="flex flex-col gap-6">
              {productReviews.length === 0 && (
                <p className="text-sm text-onLight/45">No product reviews yet — be the first.</p>
              )}
              {productReviews.map((r) => (
                <div key={r.id} className="bg-white border border-onLight/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{r.author}</span>
                    <span className="text-xs text-amber">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm text-onLight/65">{r.comment}</p>
                </div>
              ))}
              <form onSubmit={submitProductReview} className="space-y-3 pt-4 border-t border-onLight/10">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)}>
                      <Star size={18} className={n <= rating ? 'fill-amber text-amber' : 'text-onLight/20'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="Write a review…"
                  className="w-full px-4 py-3 rounded-xl border border-onLight/15 text-sm outline-none focus:border-leaf"
                />
                <Button type="submit">Submit review</Button>
              </form>
            </div>
          )}
          {tab === 'vendor' && (
            <div className="flex flex-col gap-6">
              {vendorReviews.length === 0 && (
                <p className="text-sm text-onLight/45">No vendor reviews yet.</p>
              )}
              {vendorReviews.map((r) => (
                <div key={r.id} className="bg-white border border-onLight/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-onLight/40">Order {r.orderId}</span>
                    <span className="text-xs text-amber">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm text-onLight/65">{r.comment}</p>
                </div>
              ))}
              <form onSubmit={submitVendorReview} className="space-y-3 pt-4 border-t border-onLight/10">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)}>
                      <Star size={18} className={n <= rating ? 'fill-amber text-amber' : 'text-onLight/20'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="How was the seller?"
                  className="w-full px-4 py-3 rounded-xl border border-onLight/15 text-sm outline-none focus:border-leaf"
                />
                <Button type="submit">Submit vendor review</Button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
