import { memo, useState } from 'react'
import { isValidImageUrl } from '../utils/imageUtils'
import './ProductThumbnail.css'

const ProductThumbnail = memo(({ 
  product, // Accept product object directly
  alt = 'Product', 
  size = 44, 
  onClick,
  className = '' 
}) => {
  // Unified image pipeline: use ONLY product.images[0]
  const url = product && Array.isArray(product.images) && product.images.length > 0 
    ? (typeof product.images[0] === 'string' ? product.images[0] : null)
    : null
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  const hasImage = isValidImageUrl(url)

  return (
    <div 
      className={`product-thumbnail ${className} ${onClick ? 'clickable' : ''}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View ${alt}` : undefined}
    >
      {!hasImage || imageError ? (
        <div className="product-thumbnail-placeholder">
          <span className="placeholder-icon">📦</span>
        </div>
      ) : (
        <>
          {!imageLoaded && (
            <div className="product-thumbnail-skeleton">
              <div className="skeleton-shimmer"></div>
            </div>
          )}
          <img
            src={url}
            alt={alt}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`product-thumbnail-img ${imageLoaded ? 'loaded' : ''}`}
            style={{ width: `${size}px`, height: `${size}px` }}
          />
        </>
      )}
    </div>
  )
})

ProductThumbnail.displayName = 'ProductThumbnail'

export default ProductThumbnail

