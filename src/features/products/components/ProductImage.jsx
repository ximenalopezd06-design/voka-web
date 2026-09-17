import { Package } from 'lucide-react'

export function ProductImage({ product, size = 'medium' }) {
  const image = product.imagen
  const isAsset = typeof image === 'string' && (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/'))

  return (
    <div className={`catalog-product-image catalog-product-image--${size} product-image--${product.color ?? 'pink'}`}>
      {isAsset ? <img src={image} alt="" /> : image ? <span>{image}</span> : <Package aria-hidden="true" />}
    </div>
  )
}
