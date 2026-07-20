import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingBag, User2 } from 'lucide-react'
import Button from './ui/Button'
import { cn } from '@/lib/utils'
import { logout, becomeVendor } from '@/store/slices/authSlice'
import { resetCatalogSession } from '@/store/slices/catalogSlice'
import { routeForUser } from '@/lib/authRoutes'

export default function Navbar() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, status } = useSelector((s) => s.auth)
  const cartCount = useSelector((s) => s.catalog.cart.reduce((a, c) => a + c.quantity, 0))
  const navigate = useNavigate()

  const role = (user?.role || '').toLowerCase()
  const isCustomer = role === 'customer'
  const isVendor = role === 'vendor'
  const isAdmin = role === 'admin'
  const busy = status === 'loading'

  async function handleSellOnOscillate() {
    if (!isAuthenticated) {
      navigate('/auth?intent=vendor')
      return
    }
    if (isVendor) {
      navigate(routeForUser(user))
      return
    }
    if (isAdmin) return

    // Soft intent only — stays customer until eligibility is submitted
    const result = await dispatch(becomeVendor())
    if (becomeVendor.fulfilled.match(result)) {
      navigate('/onboarding/vendor')
    }
  }

  function handleCart() {
    if (!isAuthenticated) {
      navigate('/auth?intent=customer')
      return
    }
    if (isCustomer) {
      navigate('/checkout')
      return
    }
    navigate(routeForUser(user))
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/95 border-b border-onLight/8">
      <nav className="container-page flex items-center justify-between h-16">
        <Link
          to={isAuthenticated && user ? routeForUser(user) : '/'}
          className="group flex items-baseline gap-1.5 shrink-0 min-w-0"
          aria-label="Oscillate Marketplace home"
        >
          <span className="font-display text-xl sm:text-[1.35rem] font-semibold tracking-tight text-onLight leading-none group-hover:text-leaf-dim transition-colors">
            Oscillate
          </span>
          <span className="font-display text-[0.65rem] sm:text-xs font-medium tracking-[0.18em] uppercase text-leaf-dim leading-none">
            Marketplace
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/products"
            className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
          >
            Browse
          </Link>
          {isVendor && (
            <Link
              to="/vendor/dashboard"
              className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
            >
              Vendor Dashboard
            </Link>
          )}
          {isCustomer && (
            <Link
              to="/customer/dashboard"
              className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
            >
              For You
            </Link>
          )}
          {!isVendor && !isAdmin && (
            <button
              type="button"
              onClick={handleSellOnOscillate}
              disabled={busy}
              className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors disabled:opacity-50"
            >
              Sell on Oscillate
            </button>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {(isCustomer || !isAuthenticated) && (
            <button
              onClick={handleCart}
              className="relative p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={19} className="text-onLight/70" strokeWidth={1.75} />
              {isCustomer && cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-leaf text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
                aria-label="Profile"
              >
                <User2 size={19} className="text-onLight/70" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => {
                  dispatch(logout())
                  dispatch(resetCatalogSession())
                  navigate('/')
                }}
                className="text-xs text-onLight/50 hover:text-onLight px-2 py-1.5"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="md" variant="outline" onClick={() => navigate('/login')} className={cn('ml-1.5')}>
                Log in
              </Button>
              <Button size="md" variant="primary" onClick={() => navigate('/auth')} className={cn('ml-1.5')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
