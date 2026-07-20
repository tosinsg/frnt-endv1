import { useState, useMemo, memo, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Menu,
  X,
  Home,
  LayoutGrid,
  Flame,
  Sparkles,
  TrendingUp,
  Package,
  Settings,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  LogOut,
  Star,
  Heart,
  ChevronRight,
} from 'lucide-react'
import {
  addToCart,
  removeFromCart,
  setCartQuantity,
  fetchProducts,
  fetchCart,
  fetchOrders,
  resetCatalogSession,
} from '@/store/slices/catalogSlice'
import { logout } from '@/store/slices/authSlice'
import { cn } from '@/lib/utils'
import ProductThumb from '@/components/ProductThumb'
import PriceTag, { discountPercent } from '@/components/PriceTag'
import { orderStatusMeta, isAwaitingAdmin } from '@/lib/orderStatus'
import { CATEGORY_TINTS } from '@/lib/categoryTints'
import heroBannerImg from '@/assets/dashboard-hero.png'

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books']
const PER_ROW = 4

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, section: 'home' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid, section: 'categories' },
  { id: 'deals', label: 'Deals', icon: Flame, section: 'deals', badge: 'Hot' },
  { id: 'arrivals', label: 'New Arrivals', icon: Sparkles, section: 'recommended' },
  { id: 'bestsellers', label: 'Best Sellers', icon: TrendingUp, section: 'deals' },
  { id: 'orders', label: 'My Orders', icon: Package, section: 'orders' },
  { id: 'profile', label: 'Account Settings', icon: Settings, href: '/profile' },
]

export default function CustomerDashboard() {
  const user = useSelector((s) => s.auth.user)
  const products = useSelector((s) => s.catalog.products)
  const cart = useSelector((s) => s.catalog.cart)
  const orders = useSelector((s) => s.catalog.orders)
  const catalogStatus = useSelector((s) => s.catalog.status)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeNav, setActiveNav] = useState('home')
  const [mainView, setMainView] = useState('shop') // shop | orders
  const mainScrollRef = useRef(null)

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCart())
    dispatch(fetchOrders())
  }, [dispatch])

  // Lock document scroll — only the center column scrolls
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    if (mainView === 'orders') dispatch(fetchOrders())
  }, [mainView, dispatch])

  const interests = user?.personalizationProfile?.interests || []
  const firstName = user?.name?.split(' ')[0] || 'there'
  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = [...products]
    if (interests.length) {
      list.sort(
        (a, b) =>
          Number(interests.includes(b.category)) - Number(interests.includes(a.category)),
      )
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.vendor?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
    }
    return list
  }, [products, search, interests])

  const dealProducts = useMemo(() => {
    const withDeal = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price)
    const source = withDeal.length >= 4 ? withDeal : filtered
    return source.slice(0, PER_ROW)
  }, [filtered])

  const recommended = useMemo(() => {
    const dealIds = new Set(dealProducts.map((p) => p.id))
    return filtered.filter((p) => !dealIds.has(p.id)).slice(0, PER_ROW)
  }, [filtered, dealProducts])

  const cartLines = useMemo(
    () =>
      cart
        .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) }))
        .filter((c) => c.product),
    [cart, products],
  )
  const cartCount = cart.reduce((sum, c) => sum + (c.quantity || 0), 0)
  const subtotal = cartLines.reduce((sum, c) => sum + c.product.price * c.quantity, 0)
  const discount = cartLines.reduce((sum, c) => {
    const orig = c.product.originalPrice || c.product.price
    return sum + Math.max(0, orig - c.product.price) * c.quantity
  }, 0)
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 2500
  const total = subtotal + shipping
  const waitingCount = orders.filter((o) => isAwaitingAdmin(o.status)).length

  const suggestions = useMemo(
    () =>
      [...products]
        .filter((p) => !cart.some((c) => c.productId === p.id))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 2),
    [products, cart],
  )

  function scrollTo(id) {
    setMainView('shop')
    setActiveNav(id === 'deals' || id === 'bestsellers' ? 'deals' : id)
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      const scroller = mainScrollRef.current
      if (!el || !scroller) return
      const top = el.offsetTop - scroller.offsetTop - 12
      scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    })
  }

  function handleNav(item) {
    setSidebarOpen(false)
    if (item.href) {
      navigate(item.href)
      return
    }
    if (item.section === 'orders') {
      setMainView('orders')
      setActiveNav('orders')
      return
    }
    setMainView('shop')
    scrollTo(item.section)
    setActiveNav(item.id)
  }

  function handleLogout() {
    dispatch(logout())
    dispatch(resetCatalogSession())
    navigate('/')
  }

  return (
    <div id="top" className="h-dvh max-h-dvh overflow-hidden bg-paper flex">
      {/* ---------- LEFT SIDEBAR (fixed, no page scroll) ---------- */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-onLight/8 bg-white h-full overflow-hidden">
        <SidebarContent
          activeNav={activeNav}
          onNav={handleNav}
          onLogout={handleLogout}
        />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-canopy/25 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col lg:hidden shadow-xl overflow-hidden"
            >
              <SidebarContent
                activeNav={activeNav}
                onNav={handleNav}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------- MAIN (only this column scrolls) ---------- */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <header className="shrink-0 z-30 bg-paper/95 backdrop-blur-md border-b border-onLight/8">
          <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-5 lg:pl-8 pr-2 sm:pr-3 lg:pr-4 py-3 sm:py-3.5">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl hover:bg-leaf/10 text-onLight shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="relative flex-1 min-w-0 max-w-xl">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-onLight/35"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setMainView('shop')
                }}
                placeholder="Search for products, brands and more…"
                className="w-full pl-10 pr-9 py-2.5 rounded-full border border-onLight/10 bg-white text-sm outline-none focus:border-leaf/50 focus:ring-2 focus:ring-leaf/15 shadow-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-onLight/30 hover:text-onLight/60"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Far-right cluster: cart (mobile) + profile pinned to extreme right */}
            <div className="ml-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-xl hover:bg-leaf/10 text-onLight/70 xl:hidden"
                aria-label="Open cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-leaf text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <Link
                to="/profile"
                className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full hover:bg-leaf/10 transition-colors border border-transparent hover:border-leaf/15"
                title="Profile"
              >
                <div className="size-8 sm:size-9 rounded-full bg-gradient-to-br from-leaf to-canopy text-white font-display font-semibold text-xs flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <span className="text-sm font-medium text-onLight/80 hidden sm:block max-w-[110px] truncate">
                  {firstName}
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main
          ref={mainScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 lg:px-8 py-5 sm:py-6 pb-16"
        >
          {waitingCount > 0 && mainView === 'shop' && (
            <div className="mb-5 rounded-2xl border border-amber/25 bg-amber/10 px-4 py-3 text-sm text-onLight/70">
              {waitingCount} order{waitingCount > 1 ? 's' : ''} with receipts waiting for admin
              confirmation.
            </div>
          )}

          {mainView === 'orders' ? (
            <OrdersPanel orders={orders} products={products} onBack={() => setMainView('shop')} />
          ) : (
            <>
              {/*
                Ad banner — layout mirrors the NovaShop reference:
                soft gradient card · left copy · model on the right over decorative orbs · dots
                Image is clipped strictly so scale/position never spill outside while scrolling.
              */}
              <section
                id="home"
                className="relative mb-6 rounded-2xl sm:rounded-3xl overflow-hidden isolate min-h-[220px] sm:min-h-[260px] md:min-h-[280px]"
                style={{
                  background:
                    'linear-gradient(135deg, #4fd07a 0%, #3FBF6B 38%, #2E9C55 72%, #247a44 100%)',
                }}
              >
                {/* Soft abstract orbs behind the model (like the purple circles in the ref) */}
                <div
                  className="pointer-events-none absolute right-[8%] top-[12%] size-40 sm:size-52 md:size-60 rounded-full bg-white/15 blur-sm"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute right-[18%] bottom-0 size-32 sm:size-44 rounded-full bg-canopy/20 blur-md"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute right-[2%] top-1/3 size-24 sm:size-32 rounded-full bg-leaf/30 blur-xl"
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-stretch min-h-[220px] sm:min-h-[260px] md:min-h-[280px] overflow-hidden">
                  {/* Left copy */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:pl-12 pr-4 sm:pr-6 relative z-20">
                    <span className="inline-flex w-fit items-center bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-3 sm:mb-4 backdrop-blur-[2px]">
                      New Collection
                    </span>
                    <h1 className="font-display text-2xl sm:text-3xl md:text-[2.35rem] font-bold text-white leading-[1.12] tracking-tight mb-3">
                      Find Your Style,
                      <br />
                      Love Your Look
                      <span className="ml-1" aria-hidden="true">
                        ✨
                      </span>
                    </h1>
                    <p className="text-white/85 text-sm sm:text-[15px] mb-5 sm:mb-6 max-w-[17rem] sm:max-w-xs leading-relaxed">
                      {interests.length
                        ? `Curated around ${interests.slice(0, 2).join(' & ')} — picked for you.`
                        : 'Discover the latest trends in fashion, beauty, and lifestyle.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollTo('deals')}
                      className="inline-flex w-fit items-center gap-1.5 bg-white text-leaf-dim font-semibold text-sm px-6 py-2.5 sm:py-3 rounded-full hover:bg-white/95 transition-colors shadow-sm"
                    >
                      Shop Now <ChevronRight size={16} strokeWidth={2.25} />
                    </button>
                  </div>

                  {/* Right model — clipped box; crop with object-position only (no overflow translate) */}
                  <div className="relative hidden sm:block w-[54%] md:w-[52%] lg:w-[50%] shrink-0 self-stretch overflow-hidden isolate">
                    <img
                      src={heroBannerImg}
                      alt="New collection look"
                      className="absolute inset-0 w-full h-full max-w-none object-cover object-[center_58%] scale-110 origin-center select-none"
                      draggable={false}
                    />
                    {/* Soft edge into text + light green wash over studio black */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(46, 156, 85, 0.55) 0%, rgba(46, 156, 85, 0.12) 22%, transparent 48%), linear-gradient(180deg, transparent 70%, rgba(36, 122, 68, 0.28) 100%)',
                      }}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Carousel dots (decorative, matches ref) */}
                <div
                  className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
                  aria-hidden="true"
                >
                  <span className="size-1.5 rounded-full bg-white" />
                  <span className="size-1.5 rounded-full bg-white/40" />
                  <span className="size-1.5 rounded-full bg-white/40" />
                </div>
              </section>

              {/* Category icons */}
              <section id="categories" className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const tint = CATEGORY_TINTS[cat] || CATEGORY_TINTS.default
                  const Icon = tint.Icon
                  const isInterest = interests.includes(cat)
                  return (
                    <Link
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 group"
                    >
                      <div
                        className={cn(
                          'size-12 sm:size-14 rounded-full flex items-center justify-center transition-transform group-hover:-translate-y-0.5',
                          isInterest ? 'bg-leaf text-white shadow-md shadow-leaf/25' : tint.bg,
                        )}
                      >
                        <Icon
                          size={20}
                          className={isInterest ? 'text-white' : tint.icon}
                          strokeWidth={1.75}
                        />
                      </div>
                      <span className="text-[11px] sm:text-xs font-medium text-onLight/65 group-hover:text-leaf-dim">
                        {cat}
                      </span>
                    </Link>
                  )
                })}
              </section>

              {/* Promo cards */}
              <section id="deals" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                <PromoCard
                  tint="bg-coral/8"
                  title="Flash Sale"
                  sub="Limited time deals"
                  cta="Shop deals"
                  onClick={() => scrollTo('best-deals')}
                />
                <PromoCard
                  tint="bg-leaf/10"
                  title="Free Shipping"
                  sub="On orders over ₦50,000"
                  cta="Learn more"
                  onClick={() => scrollTo('best-deals')}
                />
                <PromoCard
                  tint="bg-amber/10"
                  title="New Arrivals"
                  sub="Check out the latest"
                  cta="Shop now"
                  onClick={() => scrollTo('recommended')}
                />
              </section>

              {catalogStatus === 'loading' && products.length === 0 && (
                <p className="text-sm text-onLight/45 py-10 text-center">Loading products…</p>
              )}
              {catalogStatus === 'failed' && products.length === 0 && (
                <p className="text-sm text-coral py-10 text-center">
                  Could not load products. Is the backend running?
                </p>
              )}

              {search && filtered.length === 0 && products.length > 0 && (
                <p className="text-onLight/40 text-sm py-10 text-center">
                  No products match &ldquo;{search}&rdquo;.
                </p>
              )}

              {/* Best Deals */}
              {dealProducts.length > 0 && (
                <ProductRow
                  id="best-deals"
                  title="Best Deals for You"
                  products={dealProducts}
                  onAdd={(id) => dispatch(addToCart(id))}
                />
              )}

              {/* Recommended */}
              {recommended.length > 0 && (
                <ProductRow
                  id="recommended"
                  title="Recommended for You"
                  products={recommended}
                  onAdd={(id) => dispatch(addToCart(id))}
                />
              )}

              {!search && dealProducts.length === 0 && recommended.length === 0 && products.length === 0 && catalogStatus === 'succeeded' && (
                <p className="text-sm text-onLight/45 py-16 text-center">
                  No products yet. Verified vendors list real items — check back soon.
                </p>
              )}

              {/* Full filtered grid when searching */}
              {search && filtered.length > 0 && (
                <section className="mb-10">
                  <h2 className="font-display text-lg sm:text-xl font-semibold mb-4">
                    Results ({filtered.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filtered.map((p) => (
                      <ProductCard key={p.id} product={p} onAdd={() => dispatch(addToCart(p.id))} />
                    ))}
                  </div>
                </section>
              )}

              {/* Trust strip */}
              <div className="mt-4 mb-2 grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl bg-white border border-onLight/8 p-4 sm:p-5">
                {[
                  { label: 'Secure Payment', sub: '100% secure checkout' },
                  { label: 'Easy Returns', sub: 'Hassle-free policy' },
                  { label: 'Verified Vendors', sub: 'ID-checked sellers' },
                  { label: 'Admin Confirmed', sub: 'Orders reviewed by Oscillate' },
                ].map((t) => (
                  <div key={t.label} className="text-center sm:text-left px-1">
                    <div className="text-xs font-semibold text-onLight/80">{t.label}</div>
                    <div className="text-[11px] text-onLight/40 mt-0.5">{t.sub}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ---------- RIGHT CART (fixed, does not scroll the page) ---------- */}
      <aside className="hidden xl:flex flex-col w-[300px] 2xl:w-80 shrink-0 border-l border-onLight/8 bg-white h-full overflow-hidden">
        <CartPanel
          cartLines={cartLines}
          cartCount={cartCount}
          subtotal={subtotal}
          discount={discount}
          shipping={shipping}
          total={total}
          suggestions={suggestions}
          onAdd={(id) => dispatch(addToCart(id))}
          onSetQty={(productId, quantity) => dispatch(setCartQuantity({ productId, quantity }))}
          onRemove={(id) => dispatch(removeFromCart(id))}
        />
      </aside>

      {/* Mobile / tablet cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-canopy/25 z-40 xl:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white z-50 flex flex-col xl:hidden shadow-2xl"
            >
              <div className="flex justify-end p-3 border-b border-onLight/8">
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-xl text-onLight/50 hover:bg-leaf/10"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>
              <CartPanel
                cartLines={cartLines}
                cartCount={cartCount}
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                total={total}
                suggestions={suggestions}
                onAdd={(id) => dispatch(addToCart(id))}
                onSetQty={(productId, quantity) => dispatch(setCartQuantity({ productId, quantity }))}
                onRemove={(id) => dispatch(removeFromCart(id))}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SidebarContent({ activeNav, onNav, onLogout }) {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="p-5 border-b border-onLight/8 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-xl bg-gradient-to-br from-leaf to-canopy flex items-center justify-center shadow-sm shadow-leaf/20">
            <span className="text-white font-display font-bold text-sm">O</span>
          </div>
          <div>
            <div className="font-display font-semibold text-[15px] text-onLight leading-tight group-hover:text-leaf-dim transition-colors">
              Oscillate
            </div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-leaf-dim font-medium">
              Marketplace
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 min-h-0 overflow-hidden py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNav(item)}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors text-left',
                active
                  ? 'bg-leaf/10 text-leaf-dim border-r-[3px] border-leaf'
                  : 'text-onLight/60 hover:bg-leaf/8 hover:text-onLight/80',
              )}
            >
              <Icon size={17} className={active ? 'text-leaf-dim' : 'text-onLight/40'} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-coral text-white px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-4 space-y-3 border-t border-onLight/8 shrink-0">
        <div className="rounded-2xl bg-gradient-to-br from-canopy to-leaf-dim p-4 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 size-20 rounded-full bg-white/10" />
          <div className="text-xs font-medium opacity-80 mb-1">Special Offer</div>
          <div className="font-display font-bold text-lg leading-snug mb-3 relative z-10">
            Summer Sale
            <br />
            Up to 50% Off
          </div>
          <button
            type="button"
            onClick={() => onNav({ id: 'deals', section: 'deals' })}
            className="inline-block bg-white text-canopy text-xs font-semibold px-4 py-2 rounded-full relative z-10 hover:bg-paper"
          >
            Shop Now
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-onLight/45 hover:text-coral transition-colors"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </div>
  )
}

function PromoCard({ tint, title, sub, cta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full text-left rounded-2xl p-4 sm:p-5 hover:opacity-95 transition-opacity border border-onLight/8',
        tint,
      )}
    >
      <div className="font-display font-semibold text-sm mb-1">{title}</div>
      <div className="text-xs text-onLight/50 mb-3">{sub}</div>
      <span className="text-xs font-semibold text-leaf-dim">{cta} →</span>
    </button>
  )
}

function ProductRow({ id, title, products, onAdd }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold">{title}</h2>
        <Link to="/products" className="text-sm text-leaf-dim hover:underline font-medium">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} onAdd={() => onAdd(p.id)} index={i} />
        ))}
      </div>
    </section>
  )
}

const ProductCard = memo(function ProductCard({ product, onAdd, index = 0 }) {
  const pct = discountPercent(product)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-onLight/8 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-paper">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <ProductThumb product={product} />
        </Link>
        {pct && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-coral rounded-md px-1.5 py-0.5">
            -{pct}%
          </span>
        )}
        <button
          type="button"
          className="absolute top-2 right-2 size-7 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-onLight/35 hover:text-coral transition-colors"
          aria-label="Save"
        >
          <Heart size={13} />
        </button>
      </div>
      <div className="p-2.5 sm:p-3">
        <Link
          to={`/products/${product.id}`}
          className="font-medium text-xs sm:text-sm hover:text-leaf-dim block truncate"
        >
          {product.name}
        </Link>
        <div className="text-[10px] text-onLight/40 mt-0.5 truncate">{product.vendor}</div>
        {product.rating != null && (
          <div className="flex items-center gap-1 mt-1.5 mb-1.5">
            <Star size={10} className="fill-amber text-amber" />
            <span className="text-[10px] text-onLight/45">
              {product.rating}
              {product.reviewCount != null ? ` (${product.reviewCount})` : ''}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mt-1">
          <PriceTag product={product} />
          <button
            type="button"
            onClick={onAdd}
            className="shrink-0 size-7 rounded-full bg-leaf text-white flex items-center justify-center hover:bg-leaf-dim shadow-sm shadow-leaf/20"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  )
})

function CartPanel({
  cartLines,
  cartCount,
  subtotal,
  discount,
  shipping,
  total,
  suggestions,
  onAdd,
  onSetQty,
  onRemove,
}) {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-onLight/8 shrink-0">
        <h2 className="font-display font-semibold text-[15px]">My Cart ({cartCount})</h2>
      </div>

      {/* Only the cart list area scrolls if items overflow — pane itself stays fixed */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4">
        {cartLines.length === 0 ? (
          <div className="text-center mt-12 px-4">
            <div className="size-14 rounded-2xl bg-leaf/10 text-leaf-dim flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={22} />
            </div>
            <p className="text-onLight/40 text-sm">Your cart is empty.</p>
            <p className="text-onLight/30 text-xs mt-1">Add something you actually want.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {cartLines.map((line) => (
              <div
                key={line.productId}
                className="flex gap-3 border border-onLight/8 rounded-xl p-2.5 bg-paper/80"
              >
                <div className="size-14 rounded-lg overflow-hidden shrink-0 bg-white border border-onLight/8">
                  <ProductThumb product={line.product} iconSize={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{line.product.name}</div>
                  <div className="text-xs text-leaf-dim font-semibold mt-0.5">
                    ₦{line.product.price.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => onSetQty(line.productId, line.quantity - 1)}
                      className="size-5 rounded-full border border-onLight/15 flex items-center justify-center hover:bg-white hover:border-leaf/30"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-xs w-4 text-center font-medium">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onAdd(line.productId)}
                      className="size-5 rounded-full border border-onLight/15 flex items-center justify-center hover:bg-white hover:border-leaf/30"
                      aria-label="Increase quantity"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(line.productId)}
                  className="text-onLight/25 hover:text-coral self-start p-0.5"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-8">
            <div className="text-xs font-semibold text-onLight/45 mb-3">You might also like</div>
            <div className="flex flex-col gap-2">
              {suggestions.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <div className="size-10 rounded-lg overflow-hidden shrink-0 bg-paper border border-onLight/8">
                    <ProductThumb product={p} iconSize={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate font-medium">{p.name}</div>
                    <div className="text-xs text-leaf-dim font-semibold">
                      ₦{p.price.toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAdd(p.id)}
                    className="size-6 rounded-full bg-leaf text-white flex items-center justify-center shrink-0 hover:bg-leaf-dim"
                    aria-label={`Add ${p.name}`}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {cartLines.length > 0 && (
        <div className="p-4 border-t border-onLight/8 bg-white shrink-0">
          <div className="space-y-1.5 mb-4 text-sm">
            <div className="flex justify-between text-onLight/55 text-xs">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-coral text-xs">
                <span>Discount</span>
                <span>-₦{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-onLight/55 text-xs">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-leaf-dim font-medium' : ''}>
                {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between font-display font-semibold text-base pt-2 border-t border-onLight/8">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 text-center bg-leaf text-white font-semibold py-3 rounded-full hover:bg-leaf-dim transition-colors shadow-md shadow-leaf/20"
          >
            Checkout ({cartCount}) <ChevronRight size={16} />
          </Link>
        </div>
      )}

      <div className="p-4 pt-0 shrink-0">
        <div className="rounded-2xl bg-gradient-to-br from-canopy to-leaf-dim p-4 text-white text-center">
          <div className="font-display font-semibold text-sm mb-1">Join Oscillate Club</div>
          <p className="text-xs opacity-70 mb-3">Exclusive offers, early access and more</p>
          <button
            type="button"
            className="inline-block bg-white text-canopy text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-paper cursor-default"
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  )
}

function OrdersPanel({ orders, products, onBack }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">My Orders</h1>
          <p className="text-sm text-onLight/45 mt-1">Track status after checkout</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-leaf-dim hover:underline"
        >
          ← Back to shop
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-onLight/8 rounded-2xl py-20 text-center text-sm text-onLight/45">
          No orders yet. Once you check out, they&apos;ll show up here.
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
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
                className="bg-white border border-onLight/8 rounded-2xl p-4 sm:p-5 shadow-sm"
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
                  <span
                    className={cn(
                      'text-xs font-medium rounded-full px-3 py-1.5 shrink-0',
                      meta.className,
                    )}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
