import { cloudinaryUrl } from '@/lib/cloudinary'
import { CATEGORY_TINTS } from '@/lib/categoryTints'
import { discountPercent } from '@/components/PriceTag'
import { cn } from '@/lib/utils'

export default function ProductThumb({ product, className, iconSize = 32 }) {
  const tint = CATEGORY_TINTS[product.category] || CATEGORY_TINTS.default
  const pct = discountPercent(product)

  // Bundled local assets (e.g. src/assets/products/*) resolve to a URL
  // starting with / or http at build time; short strings like "sample" or
  // "ai/model_plain_sweatshirt" are Cloudinary public IDs instead.
  const isLocalAsset = product.image && (product.image.startsWith('/') || product.image.startsWith('http'))
  const src = product.image
    ? isLocalAsset
      ? product.image
      : cloudinaryUrl(product.image, { width: 600, height: 600, crop: 'fill' })
    : null

  return (
    <div className={cn('relative w-full h-full', className)}>
      {pct && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-semibold text-white bg-coral rounded-md px-1.5 py-0.5">
          -{pct}%
        </span>
      )}
      {src ? (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          className={cn('w-full h-full', isLocalAsset ? 'object-contain p-3' : 'object-cover')}
        />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center', tint.bg)}>
          <tint.Icon size={iconSize} className={tint.icon} strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}
