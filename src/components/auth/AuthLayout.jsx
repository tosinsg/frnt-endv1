/**
 * AuthLayout
 * ----------
 * Shared shell for login, register, OTP, role confirmation, and auth entry.
 *
 * Layout (inspired by the split-card reference, site colors):
 *   - Page uses the same paper background as the rest of the app
 *   - White card: form on the left, product/vendor reviews on the right
 *   - Soft leaf accents only (no dark/black panels, no social logins)
 *
 * Props:
 *   title      — page heading
 *   subtitle   — short helper text under the heading
 *   footer     — optional line under the form (e.g. "Already have an account?")
 *   wide       — true for multi-column forms (register / role pick)
 *   children   — form fields / actions
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthReviewsPanel from './AuthReviewsPanel'
import { cn } from '@/lib/utils'

export default function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  wide = false,
  className,
}) {
  return (
    // Full-height page, same paper tone as landing / dashboards
    <div className="min-h-dvh bg-paper flex flex-col">
      {/* Top bar — light, matches site branding */}
      <header className="border-b border-onLight/8 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" aria-label="Oscillate home">
            <div className="size-8 rounded-lg bg-leaf/15 text-leaf-dim flex items-center justify-center">
              <span className="font-display font-bold text-sm text-leaf">O</span>
            </div>
            <span className="font-display font-semibold text-onLight tracking-tight group-hover:text-leaf-dim transition-colors">
              Oscillate
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.14em] text-leaf-dim font-medium ml-0.5">
              Marketplace
            </span>
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-onLight/55 hover:text-leaf-dim transition-colors"
          >
            Browse products
          </Link>
        </div>
      </header>

      {/* Centered split card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'w-full bg-white rounded-2xl sm:rounded-3xl border border-onLight/10 shadow-lg shadow-onLight/5 overflow-hidden',
            'grid md:grid-cols-2',
            wide ? 'max-w-5xl' : 'max-w-4xl',
            className,
          )}
        >
          {/* —— Left: form —— */}
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center min-w-0 order-1">
            {(title || subtitle) && (
              <div className="mb-6 sm:mb-8">
                {title && (
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold text-onLight tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-2 text-sm text-onLight/50 leading-relaxed max-w-md">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Page-specific form content */}
            <div className="w-full">{children}</div>

            {footer && (
              <div className="mt-6 text-center text-sm text-onLight/50">{footer}</div>
            )}
          </div>

          {/* —— Right: reviews (desktop). On mobile, sits under the form. —— */}
          <div className="order-2 p-4 sm:p-5 md:p-6 md:min-h-[440px] bg-paper/50 border-t md:border-t-0 md:border-l border-onLight/8">
            <AuthReviewsPanel />
          </div>
        </motion.div>
      </main>
    </div>
  )
}
