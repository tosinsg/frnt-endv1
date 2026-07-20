import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ShoppingBag,
  Plus,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { addToCart, fetchProducts } from '@/store/slices/catalogSlice'
import ProductThumb from '@/components/ProductThumb'
import PriceTag, { discountPercent } from '@/components/PriceTag'
import { cn } from '@/lib/utils'
import { CATEGORY_TINTS } from '@/lib/categoryTints'
import heroBannerImg from '@/assets/dashboard-hero.png'

const BROWSE_CATEGORIES = ['Fashion', 'Electronics', 'Beauty', 'Sports', 'Home', 'Books']

export default function ProductsBrowse() {
  const products = useSelector((s) => s.catalog.products)
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const userRole = useSelector((s) => (s.auth.user?.role || '').toLowerCase())
  const isCustomer = userRole === 'customer'
  const catalogStatus = useSelector((s) => s.catalog.status)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const allProductsRef = useRef(null)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const withImages = useMemo(
    () => products.filter((p) => p.image).sort((a, b) => (b.rating || 0) - (a.rating || 0)),
    [products],
  )

  const floatingCards = useMemo(() => withImages.slice(0, 4), [withImages])

  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (bT !== aT) return bT - aT
        return (b.rating || 0) - (a.rating || 0)
      })
      .slice(0, 8)
  }, [products])

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const aS = a.orderCount || a.salesCount || a.reviewCount || 0
        const bS = b.orderCount || b.salesCount || b.reviewCount || 0
        if (bS !== aS) return bS - aS
        return (b.rating || 0) - (a.rating || 0)
      })
      .slice(0, 6)
  }, [products])

  const categoryCards = useMemo(() => {
    return BROWSE_CATEGORIES.map((cat) => {
      const inCat = products.filter((p) => p.category === cat)
      const cover = inCat.find((p) => p.image) || inCat[0]
      return { category: cat, product: cover, count: inCat.length }
    })
  }, [products])

  const filtered = useMemo(() => {
    if (!category) return products
    return products.filter((p) => p.category === category)
  }, [products, category])

  function handleAddToCart(productId) {
    if (!isAuthenticated) {
      navigate('/auth?intent=customer')
      return
    }
    if (!isCustomer) {
      navigate(
        userRole === 'vendor'
          ? '/vendor/dashboard'
          : userRole === 'admin'
            ? '/admin'
            : '/role-confirmation',
      )
      return
    }
    dispatch(addToCart(productId))
  }

  function scrollToAll() {
    allProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function selectCategory(cat) {
    setParams(cat ? { category: cat } : {})
    requestAnimationFrame(() => {
      allProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* ---------- Hero (reference: Discover Products You'll Love) ---------- */}
      <section className="relative overflow-hidden border-b border-onLight/6">
        <div className="container-page py-10 sm:py-14 md:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            <div className="relative z-10">
              <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-leaf-dim mb-3">
                Trending now
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-[3.25rem] font-semibold text-onLight leading-[1.05] tracking-tight">
                Discover Products
                <br />
                You&apos;ll Love
              </h1>
              <p className="mt-4 text-onLight/55 text-base sm:text-lg max-w-md leading-relaxed">
                Shop the latest trending products curated for modern lifestyles — from verified
                vendors on Oscillate.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={scrollToAll}
                  className="inline-flex items-center gap-1.5 bg-leaf text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-leaf-dim transition-colors shadow-md shadow-leaf/20"
                >
                  Shop Now <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('shop-categories')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }}
                  className="inline-flex items-center gap-1.5 bg-white border border-onLight/12 text-onLight/75 font-semibold text-sm px-6 py-3 rounded-full hover:border-leaf/40 hover:text-leaf-dim transition-colors"
                >
                  Explore Collection
                </button>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {floatingCards.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="size-8 rounded-full border-2 border-white overflow-hidden bg-paper shadow-sm"
                    >
                      <ProductThumb product={p} iconSize={14} />
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-onLight/50">
                  Loved by <span className="font-semibold text-onLight/70">shoppers</span> worldwide
                </p>
              </div>
            </div>

            {/* Floating product collage + hero figure */}
            <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[440px]">
              <div
                className="absolute inset-[8%] rounded-[2rem] bg-gradient-to-br from-leaf/20 via-leaf/10 to-canopy/15"
                aria-hidden="true"
              />
              <div
                className="absolute right-[6%] top-[8%] bottom-[4%] w-[52%] rounded-[1.75rem] overflow-hidden bg-canopy isolate"
                aria-hidden="true"
              >
                <img
                  src={heroBannerImg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-[center_12%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canopy/40 via-transparent to-leaf/10" />
              </div>

              {floatingCards[0] && (
                <FloatingProductCard
                  product={floatingCards[0]}
                  className="absolute left-[2%] top-[6%] w-[42%] sm:w-[38%]"
                  delay={0}
                />
              )}
              {floatingCards[1] && (
                <FloatingProductCard
                  product={floatingCards[1]}
                  className="absolute left-[4%] bottom-[18%] w-[40%] sm:w-[36%]"
                  delay={0.08}
                />
              )}
              {floatingCards[2] && (
                <FloatingProductCard
                  product={floatingCards[2]}
                  className="absolute right-[4%] top-[4%] w-[28%] sm:w-[24%]"
                  delay={0.12}
                />
              )}
              {floatingCards[3] && (
                <FloatingProductCard
                  product={floatingCards[3]}
                  className="absolute right-[2%] bottom-[8%] w-[30%] sm:w-[26%]"
                  delay={0.16}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Trust bar ---------- */}
      <section className="bg-white border-b border-onLight/6">
        <div className="container-page py-5 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: Truck, title: 'Free Shipping', sub: 'On orders over ₦50,000' },
            { icon: ShieldCheck, title: 'Secure Payments', sub: '100% secure checkout' },
            { icon: RotateCcw, title: 'Easy Returns', sub: 'Hassle-free policy' },
            { icon: Headphones, title: '24/7 Support', sub: 'Always here to help' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-leaf/10 text-leaf-dim flex items-center justify-center shrink-0">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm font-semibold text-onLight/85">{title}</div>
                <div className="text-xs text-onLight/40">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Shop by Categories ---------- */}
      <section id="shop-categories" className="container-page py-12 sm:py-14 scroll-mt-20">
        <div className="flex items-end justify-between mb-6 gap-4">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">Shop by Categories</h2>
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className="text-sm font-medium text-leaf-dim hover:underline shrink-0 inline-flex items-center gap-0.5"
          >
            View All Categories <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoryCards.map(({ category: cat, product }) => {
            const tint = CATEGORY_TINTS[cat] || CATEGORY_TINTS.default
            return (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                className={cn(
                  'group text-left rounded-2xl overflow-hidden bg-white border border-onLight/8 hover:border-leaf/35 hover:shadow-md transition-all',
                  category === cat && 'border-leaf ring-2 ring-leaf/20',
                )}
              >
                <div className={cn('aspect-[4/3] relative', !product && tint.bg)}>
                  {product ? (
                    <ProductThumb product={product} iconSize={28} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <tint.Icon size={28} className={tint.icon} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-onLight/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-white text-sm font-semibold drop-shadow">{cat}</div>
                    <div className="text-white/80 text-[11px]">Shop Now</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ---------- New Arrivals ---------- */}
      <ProductCarouselSection
        title="New Arrivals"
        viewAllLabel="View All New Arrivals"
        products={newArrivals}
        onViewAll={scrollToAll}
        onAdd={handleAddToCart}
        badge="New"
      />

      {/* ---------- Best Sellers ---------- */}
      <ProductCarouselSection
        title="Best Sellers"
        viewAllLabel="View All Best Sellers"
        products={bestSellers}
        onViewAll={scrollToAll}
        onAdd={handleAddToCart}
        badge="Bestseller"
        badgeClass="bg-leaf text-white"
        showQuickAdd
      />

      {/* ---------- Promo banners ---------- */}
      <section className="container-page pb-12 sm:pb-14">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[180px] sm:min-h-[200px] bg-gradient-to-br from-coral via-[#f06a3d] to-amber p-6 sm:p-8 flex flex-col justify-center">
            <div className="relative z-10 max-w-[55%]">
              <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                Flash Sale
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 leading-tight">
                Up To 70% Off
              </h3>
              <button
                type="button"
                onClick={scrollToAll}
                className="inline-flex items-center gap-1 bg-white text-coral font-semibold text-sm px-4 py-2 rounded-full hover:bg-paper transition-colors"
              >
                Shop Sale Now <ChevronRight size={14} />
              </button>
            </div>
            {bestSellers[0] && (
              <div className="absolute right-4 bottom-0 w-[42%] h-[85%] pointer-events-none">
                <ProductThumb product={bestSellers[0]} iconSize={40} />
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[180px] sm:min-h-[200px] bg-gradient-to-br from-canopy via-[#1a5c2e] to-leaf-dim p-6 sm:p-8 flex flex-col justify-center">
            <div className="relative z-10 max-w-[55%]">
              <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">
                New Collection
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 mb-2 leading-tight">
                Summer 2026
              </h3>
              <p className="text-white/70 text-sm mb-4 max-w-[14rem]">
                Discover the latest trends and fresh styles.
              </p>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('shop-categories')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}
                className="inline-flex items-center gap-1 bg-white text-canopy font-semibold text-sm px-4 py-2 rounded-full hover:bg-paper transition-colors"
              >
                Shop Collection <ChevronRight size={14} />
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[48%] overflow-hidden isolate">
              <img
                src={heroBannerImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-canopy/80 via-canopy/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Full catalog ---------- */}
      <section ref={allProductsRef} id="all-products" className="bg-white border-t border-onLight/6 scroll-mt-20">
        <div className="container-page py-12 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                {category ? category : 'All Products'}
              </h2>
              <p className="text-onLight/45 text-sm mt-1">
                {category
                  ? `Showing ${filtered.length} item${filtered.length === 1 ? '' : 's'} in ${category}`
                  : 'No account needed — sign up when you\'re ready to buy.'}
              </p>
            </div>
            {category && (
              <button
                type="button"
                onClick={() => setParams({})}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-leaf/10 text-leaf-dim rounded-full px-3 py-1.5 hover:bg-leaf/15"
              >
                {category} <X size={12} />
              </button>
            )}
          </div>

          {catalogStatus === 'loading' && products.length === 0 && (
            <p className="text-sm text-onLight/45 mb-6">Loading products…</p>
          )}
          {catalogStatus === 'failed' && products.length === 0 && (
            <p className="text-sm text-coral mb-6">
              Could not load products. Is the backend running on :8080?
            </p>
          )}
          {filtered.length === 0 && catalogStatus === 'succeeded' && (
            <p className="text-sm text-onLight/45 py-16 text-center">
              No products in this category yet.
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p, i) => (
              <BrowseProductCard
                key={p.id}
                product={p}
                index={i}
                onAdd={() => handleAddToCart(p.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Bottom trust strip ---------- */}
      <section className="border-t border-onLight/6 bg-paper">
        <div className="container-page py-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center sm:text-left">
          {[
            { title: 'Premium Quality', sub: 'Verified vendors only' },
            { title: 'Fast Delivery', sub: 'Quick & reliable shipping' },
            { title: 'Secure Checkout', sub: 'Your data is protected' },
            { title: 'Customer Satisfaction', sub: 'Orders reviewed by Oscillate' },
          ].map((t) => (
            <div key={t.title} className="px-1">
              <div className="text-sm font-semibold text-onLight/80">{t.title}</div>
              <div className="text-xs text-onLight/40 mt-0.5">{t.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FloatingProductCard({ product, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'bg-white rounded-xl sm:rounded-2xl border border-onLight/8 shadow-lg shadow-onLight/5 p-2 sm:p-2.5 z-10',
        className,
      )}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square rounded-lg overflow-hidden bg-paper mb-1.5">
          <ProductThumb product={product} iconSize={22} />
        </div>
        <div className="text-[10px] sm:text-xs font-medium text-onLight/80 line-clamp-1 px-0.5">
          {product.name}
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-leaf-dim px-0.5 mt-0.5">
          ₦{(product.price || 0).toLocaleString()}
        </div>
      </Link>
    </motion.div>
  )
}

function ProductCarouselSection({
  title,
  viewAllLabel,
  products,
  onViewAll,
  onAdd,
  badge,
  badgeClass = 'bg-onLight text-white',
  showQuickAdd = false,
}) {
  const scrollerRef = useRef(null)

  function scroll(dir) {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.min(el.clientWidth * 0.75, 360)
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="container-page pb-10 sm:pb-12">
      <div className="flex items-end justify-between mb-5 gap-3">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewAll}
            className="hidden sm:inline-flex text-sm font-medium text-leaf-dim hover:underline items-center gap-0.5"
          >
            {viewAllLabel} <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="size-9 rounded-full border border-onLight/10 bg-white flex items-center justify-center hover:border-leaf/40 hover:text-leaf-dim transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="size-9 rounded-full border border-onLight/10 bg-white flex items-center justify-center hover:border-leaf/40 hover:text-leaf-dim transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="snap-start shrink-0 w-[46%] sm:w-[30%] lg:w-[22%] min-w-[150px]"
          >
            <BrowseProductCard
              product={p}
              onAdd={() => onAdd(p.id)}
              badge={badge}
              badgeClass={badgeClass}
              showQuickAdd={showQuickAdd}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function BrowseProductCard({
  product,
  onAdd,
  index = 0,
  badge,
  badgeClass = 'bg-onLight text-white',
  showQuickAdd = false,
}) {
  const pct = discountPercent(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.04, 0.28), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-onLight/8 rounded-2xl overflow-hidden group hover:shadow-md hover:border-leaf/25 transition-all h-full flex flex-col"
    >
      <div className="relative aspect-square bg-paper">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <ProductThumb product={product} />
        </Link>
        {(badge || pct) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {badge && (
              <span
                className={cn(
                  'text-[10px] font-bold rounded-md px-1.5 py-0.5 w-fit',
                  badgeClass,
                )}
              >
                {badge}
              </span>
            )}
            {pct && (
              <span className="text-[10px] font-bold text-white bg-coral rounded-md px-1.5 py-0.5 w-fit">
                -{pct}%
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="absolute bottom-2 right-2 size-8 rounded-full bg-leaf text-white flex items-center justify-center shadow-md shadow-leaf/25 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-leaf-dim"
          aria-label={`Add ${product.name} to cart`}
        >
          {showQuickAdd ? <ShoppingBag size={14} /> : <Plus size={15} strokeWidth={2.5} />}
        </button>
      </div>
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
        <Link
          to={`/products/${product.id}`}
          className="font-medium text-xs sm:text-sm hover:text-leaf-dim line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="text-[10px] sm:text-xs text-onLight/40 mt-0.5 truncate">
          {product.vendor}
        </div>
        {product.rating != null && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={11} className="fill-amber text-amber" />
            <span className="text-[10px] text-onLight/45">
              {product.rating}
              {product.reviewCount != null ? ` (${product.reviewCount})` : ''}
            </span>
          </div>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <PriceTag product={product} />
          {showQuickAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="text-[10px] sm:text-xs font-semibold text-leaf-dim hover:bg-leaf/10 rounded-full px-2.5 py-1 transition-colors shrink-0"
            >
              Quick Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
