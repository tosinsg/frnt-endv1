import { Link } from 'react-router-dom'

const linkClass = 'text-onLight/60 hover:text-leaf-dim transition-colors'

export default function Footer() {
  return (
    <footer className="bg-canopy/[0.04] border-t border-onLight/8 mt-32">
      <div className="container-page py-14 flex flex-col md:flex-row justify-between gap-10 text-sm">
        <div>
          <Link
            to="/"
            className="group inline-flex items-baseline gap-1.5 mb-2"
            aria-label="Oscillate Marketplace home"
          >
            <span className="font-display text-lg font-semibold tracking-tight text-onLight leading-none group-hover:text-leaf-dim transition-colors">
              Oscillate
            </span>
            <span className="font-display text-[0.65rem] font-medium tracking-[0.18em] uppercase text-leaf-dim leading-none">
              Marketplace
            </span>
          </Link>
          <p className="max-w-xs text-onLight/50 mt-2">
            A marketplace built for the people who make things, and the people who love finding them.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-14 gap-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-onLight/35 mb-1">Company</span>
            <Link to="/#why-shop" className={linkClass}>Why shop with us</Link>
            <Link to="/#why-sell" className={linkClass}>Why sell with us</Link>
            <Link to="/#partner" className={linkClass}>Partner with us</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-onLight/35 mb-1">Explore</span>
            <Link to="/products" className={linkClass}>Browse products</Link>
            <Link to="/auth" className={linkClass}>Get started</Link>
            <Link to="/contact" className={linkClass}>Start a conversation</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-onLight/35 mb-1">Legal</span>
            <Link to="/terms" className={linkClass}>Terms & Privacy</Link>
          </div>
        </div>
      </div>
      <div className="container-page py-6 border-t border-onLight/8 text-xs text-onLight/35">
        © {new Date().getFullYear()} Oscillate Marketplace. All rights reserved.
      </div>
    </footer>
  )
}
