import { cn } from '@/lib/utils'

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-onLight/80 mb-1.5">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-onLight/40 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-coral mt-1">{error}</span>}
    </label>
  )
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-11 px-4 rounded-xl border border-onLight/15 bg-white text-sm text-onLight placeholder:text-onLight/35 focus:border-leaf focus:ring-1 focus:ring-leaf outline-none transition-colors',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full h-11 px-4 rounded-xl border border-onLight/15 bg-white text-sm text-onLight focus:border-leaf focus:ring-1 focus:ring-leaf outline-none transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
