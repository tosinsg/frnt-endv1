import { useState, useMemo, memo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { addToCart, fetchProducts, fetchCart, fetchOrders } from '@/store/slices/catalogSlice'
import { cn } from '@/lib/utils'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import { orderStatusMeta, isAwaitingAdmin } from '@/lib/orderStatus'

const tabs = ['For You', 'Cart', 'Orders']

export default function CustomerDashboard() {
  const user = useSelector((s) => s.auth.user)
  const products = useSelector((s) => s.catalog.products)
  const cart = useSelector((s) => s.catalog.cart)
  const orders = useSelector((s) => s.catalog.orders)
  const dispatch = useDispatch()
  const [tab, setTab] = useState('For You')

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCart())
    dispatch(fetchOrders())
  }, [dispatch])

  // Refresh orders when opening the Orders tab (catch admin confirmations)
  useEffect(() => {
    if (tab === 'Orders') {
      dispatch(fetchOrders())
    }
  }, [tab, dispatch])

  const interests = user?.personalizationProfile?.interests || []

  const feed = useMemo(() => {
    if (!interests.length) return products
    return [...products].sort(
      (a, b) => Number(interests.includes(b.category)) - Number(interests.includes(a.category)),
    )
  }, [products, interests])

  const waitingCount = orders.filter((o) => isAwaitingAdmin(o.status)).length

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Hey{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-onLight/50 text-sm mt-1">
              {interests.length ? `Curated around ${interests.join(', ')}` : 'Your personalized feed'}
            </p>
          </div>
        </div>

        {waitingCount > 0 && (
          <div className="mb-6 rounded-2xl border border-amber/25 bg-amber/10 px-4 py-3 text-sm text-onLight/70">
            {waitingCount} order{waitingCount > 1 ? 's' : ''} paid and waiting for admin confirmation.
            You&apos;ll see status update to <strong>Confirmed</strong> once Oscillate reviews them.
          </div>
        )}

        <div className="flex gap-2 mb-8 border-b border-onLight/10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t ? 'border-leaf text-leaf' : 'border-transparent text-onLight/45 hover:text-onLight/70',
              )}
            >
              {t} {t === 'Cart' && cart.length > 0 && `(${cart.length})`}
              {t === 'Orders' && waitingCount > 0 && (
                <span className="ml-1 text-[10px] bg-amber text-white rounded-full px-1.5 py-0.5">
                  {waitingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'For You' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {feed.length === 0 && (
                <p className="text-sm text-onLight/45 col-span-full">
                  No products yet. Verified vendors list real items — check back soon.
                </p>
              )}
              {feed.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={() => dispatch(addToCart(p.id))} />
              ))}
            </motion.div>
          )}

          {tab === 'Cart' && (
            <motion.div key="cart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {cart.length === 0 ? (
                <EmptyState text="Your cart is empty. Add something you actually want." />
              ) : (
                <div className="flex flex-col gap-3 max-w-xl">
                  {cart.map((c) => {
                    const p = products.find((p) => p.id === c.productId)
                    if (!p) return null
                    return (
                      <div key={c.productId} className="flex justify-between items-center bg-white border border-onLight/10 rounded-xl p-4">
                        <div>
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-onLight/45">Qty {c.quantity}</div>
                        </div>
                        <div className="text-sm font-medium">₦{(p.price * c.quantity).toLocaleString()}</div>
                      </div>
                    )
                  })}
                  <Link to="/checkout" className="text-center bg-leaf text-white rounded-full py-3 mt-3 text-sm font-medium">
                    Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'Orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {orders.length === 0 ? (
                <EmptyState text="No orders yet. Once you check out, they'll show up here." />
              ) : (
                <div className="flex flex-col gap-3 max-w-xl">
                  {orders.map((o) => {
                    const first = o.items?.[0]
                    const title =
                      first?.productName ||
                      products.find((p) => p.id === first?.productId)?.name ||
                      `Order ${o.id}`
                    const qty = o.items?.reduce((s, i) => s + i.quantity, 0) || 0
                    const meta = orderStatusMeta(o.status)
                    return (
                      <div
                        key={o.id}
                        className="bg-white border border-onLight/10 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="font-medium text-sm">
                              {title}
                              {o.items?.length > 1 ? ` +${o.items.length - 1}` : ''}
                            </div>
                            <div className="text-xs text-onLight/45 mt-0.5">
                              Qty {qty} · ₦{(o.total || 0).toLocaleString()} ·{' '}
                              {o.placedAt ? new Date(o.placedAt).toLocaleDateString() : ''}
                            </div>
                            {meta.description && (
                              <p className="text-xs text-onLight/50 mt-2">{meta.description}</p>
                            )}
                          </div>
                          <span className={cn('text-xs font-medium rounded-full px-3 py-1.5 shrink-0', meta.className)}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const ProductCard = memo(function ProductCard({ product, onAdd }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white border border-onLight/10 rounded-2xl overflow-hidden group"
    >
      <Link to={`/products/${product.id}`} className="block aspect-[4/3]">
        <ProductThumb product={product} />
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="font-medium text-sm hover:text-leaf">
          {product.name}
        </Link>
        <div className="text-xs text-onLight/45 mt-0.5">{product.vendor}</div>
        <div className="flex items-center justify-between mt-3 gap-2">
          <PriceTag product={product} />
          <button
            onClick={onAdd}
            className="shrink-0 text-xs font-medium bg-ink text-white rounded-full px-3 py-1.5 hover:bg-black"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  )
})

function EmptyState({ text }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-onLight/45 text-sm">
      {text}
    </motion.div>
  )
}
