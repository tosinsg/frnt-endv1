import { useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchProducts } from '@/store/slices/catalogSlice'
import { ShieldCheck, Store, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import Button from '@/components/ui/Button'
import HeroIntro from '@/components/HeroIntro'
import HeroProductSlideshow from '@/components/HeroProductSlideshow'
import CategoryShowcase from '@/components/CategoryShowcase'
import TrendingCarousel from '@/components/TrendingCarousel'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import HowItWorks from '@/components/HowItWorks'
import TrustBar from '@/components/TrustBar'
import FlashSaleBanner from '@/components/FlashSaleBanner'
import { CATEGORY_TINTS } from '@/lib/categoryTints'

const stats = [
  { icon: Store, label: 'Verified vendors', value: '480+' },
  { icon: Users, label: 'Shoppers', value: '32,000+' },
  { icon: ShieldCheck, label: 'ID-checked before listing', value: '100%' },
]

const quickCategories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports']

// Timed to land just after HeroIntro's line-draw + headline slide-up
// finishes (0.5s line + 0.3s stagger + 0.6s slide ≈ 0.9s), each subsequent
// block popping in shortly after the last.
const AFTER_INTRO = 0.92

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const products = useSelector((s) => s.catalog.products)
  const carouselProducts = products.filter((p) => p.image)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  // Footer / in-page links use /#section — scroll once the landing sections exist
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.hash, location.pathname])

  const pop = (delay) => ({
    initial: { opacity: 0, y: 14, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  })

  return (
    <div>
      <Navbar />

      {/* Hero — capped to the viewport height left over below the navbar
          (navbar is h-16 = 4rem), so hero + navbar never exceed one screen */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[560px] bg-paper overflow-hidden flex items-center grain-overlay">
        {/* Ambient background — fills the empty space around the copy so the
            hero doesn't read as a flat, empty panel */}
        <div className="absolute inset-0 market-dots" aria-hidden="true" />
        <div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-leaf/15 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-1/4 w-[320px] h-[320px] rounded-full bg-canopy/10 blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 right-1/3 w-[220px] h-[220px] rounded-full bg-amber/8 blur-[80px]"
          aria-hidden="true"
        />

        {/* Both columns live in the same grid, so spacing stays consistent
            at every breakpoint instead of the carousel floating independently */}
        <div className="container-page relative z-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center py-10">
          <div>
            <motion.span
              {...pop(0)}
              className="inline-flex items-center gap-2 text-xs font-medium text-leaf-dim bg-leaf/10 border border-leaf/20 rounded-full px-3 py-1.5 mb-5"
            >
              <ShieldCheck size={13} /> Every vendor verified before they list
            </motion.span>

            <HeroIntro>
              <h1 className="font-display text-4xl md:text-6xl font-semibold text-onLight leading-[1.02] tracking-tight">
                Made by someone.
                <br />
                Found by you.
              </h1>
            </HeroIntro>

            <motion.p {...pop(AFTER_INTRO)} className="mt-5 text-lg text-onLight/60 max-w-md">
              Oscillate Marketing connects independent makers and small vendors with people looking for things
              worth buying — no algorithmic noise, just a feed built around what you actually want.
            </motion.p>

            <motion.div {...pop(AFTER_INTRO + 0.1)} className="mt-7 flex flex-wrap gap-4">
              <Button size="lg" variant="primary" onClick={() => navigate('/products')}>
                View Products
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </motion.div>

            {/* Quick category shortcuts — colorful circular icons, real links */}
            <motion.div {...pop(AFTER_INTRO + 0.2)} className="mt-6 flex flex-wrap gap-4">
              {quickCategories.map((cat) => {
                const tint = CATEGORY_TINTS[cat]
                return (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`size-12 rounded-full flex items-center justify-center border border-onLight/8 group-hover:border-leaf/40 group-hover:-translate-y-0.5 transition-all ${tint.bg}`}
                    >
                      <tint.Icon size={19} className={tint.icon} strokeWidth={1.75} />
                    </div>
                    <span className="text-[11px] text-onLight/55 group-hover:text-leaf-dim">{cat}</span>
                  </Link>
                )
              })}
            </motion.div>

            {/* Marketplace stats bar */}
            <motion.div {...pop(AFTER_INTRO + 0.3)} className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <s.icon size={16} className="text-leaf-dim" />
                  <div>
                    <div className="text-onLight font-semibold text-sm leading-tight">{s.value}</div>
                    <div className="text-onLight/40 text-xs">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Product spotlight — slides in from the right, one product at a time */}
          <HeroProductSlideshow products={carouselProducts} className="hidden md:flex" />
        </div>
      </section>

      <TrustBar />

      {/* Trending — an actual slideshow */}
      <section className="bg-white py-24">
        <div className="container-page">
          <Reveal className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="text-sm font-medium text-leaf-dim">Right now</span>
              <h2 className="font-display text-3xl font-semibold mt-1">Trending on Oscillate</h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-leaf-dim hover:underline">
              Browse all products →
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <TrendingCarousel products={products} />
          </Reveal>
        </div>
      </section>

      <CategoryShowcase />

      <FlashSaleBanner />

      {/* Why Shop With Us */}
      <section id="why-shop" className="bg-paper py-28">
        <div className="container-page grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <span className="text-sm font-medium text-leaf-dim">For customers</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 mb-6 leading-tight">
              Why shop with us
            </h2>
            <p className="text-onLight/60 text-lg max-w-md">
              A feed personalized to your interests and budget from the first day — not months of
              training an algorithm. Real vendors, verified before they ever list a product.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="space-y-5">
              {[
                'Personalized "For You" feed from day one',
                'Every vendor manually verified before listing',
                'Rate the vendor, not just the product',
              ].map((item) => (
                <li key={item} className="flex gap-4 items-start p-5 rounded-2xl bg-white border border-onLight/10">
                  <span className="w-2 h-2 rounded-full bg-leaf mt-2 shrink-0" />
                  <span className="text-onLight/80">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <HowItWorks />

      {/* Why Sell With Us */}
      <section id="why-sell" className="bg-canopy/[0.04] py-28">
        <div className="container-page grid md:grid-cols-2 gap-16 items-center">
          <Reveal className="order-2 md:order-1">
            <ul className="space-y-5">
              {[
                'Transparent, fast eligibility review',
                'Full shop-page customization with templates',
                'Direct feedback through vendor reviews',
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-4 items-start p-5 rounded-2xl bg-white border border-onLight/10"
                >
                  <span className="w-2 h-2 rounded-full bg-canopy mt-2 shrink-0" />
                  <span className="text-onLight/80">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="order-1 md:order-2">
            <span className="text-sm font-medium text-canopy">For vendors</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 mb-6 leading-tight">
              Why sell with us
            </h2>
            <p className="text-onLight/60 text-lg max-w-md">
              Apply once, get reviewed quickly, and sell to an audience that's already looking for
              what you make.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Testimonials — slideshow */}
      <section className="bg-white py-28">
        <div className="container-page">
          <Reveal>
            <TestimonialCarousel />
          </Reveal>
        </div>
      </section>

      {/* Partner With Us */}
      <section id="partner" className="bg-paper py-28">
        <div className="container-page">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="text-sm font-medium text-leaf-dim">For partners</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 mb-6">
              Partner with us
            </h2>
            <p className="text-onLight/60 text-lg mb-8">
              We work with platform partners and investors who want to back a marketplace built
              around trust — verified vendors, curated discovery, and long-term category growth.
            </p>
            <Button size="lg" onClick={() => navigate('/contact')}>
              Start a conversation
            </Button>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
