export function discountPercent(product) {
  if (!product.originalPrice) return null
  return Math.round((1 - product.price / product.originalPrice) * 100)
}

export default function PriceTag({ product, size = 'sm' }) {
  const pct = discountPercent(product)
  const priceClass = size === 'lg' ? 'text-xl font-semibold' : 'text-sm font-semibold'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={priceClass}>₦{product.price.toLocaleString()}</span>
      {product.originalPrice && (
        <span className="text-xs text-onLight/35 line-through">₦{product.originalPrice.toLocaleString()}</span>
      )}
      {pct && (
        <span className="text-[10px] font-semibold text-coral bg-coral/10 rounded-full px-1.5 py-0.5">
          -{pct}%
        </span>
      )}
    </div>
  )
}
