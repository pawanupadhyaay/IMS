import { memo, useState } from 'react'
import { isValidImageUrl } from '../utils/imageUtils'
import './ImageGallery.css'

const ImageGallery = memo(({ product, images, onRemove, editable = false }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Unified image pipeline: use ONLY product.images[] or images prop
  // Priority: product.images > images prop
  const productImages = product && Array.isArray(product.images) ? product.images.filter(img => typeof img === 'string' && img.trim() !== '') : []
  const propImages = Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.trim() !== '') : []
  const validImages = productImages.length > 0 ? productImages : propImages
  
  if (!validImages || validImages.length === 0) {
    return (
      <div className="image-gallery-empty">
        <div className="empty-icon">📷</div>
        <div className="empty-text">No images</div>
      </div>
    )
  }

  // Ensure selectedIndex is within bounds
  const safeIndex = Math.min(selectedIndex, validImages.length - 1)
  const currentImage = validImages[safeIndex]
  const imageUrl = isValidImageUrl(currentImage) ? currentImage : null

  return (
    <div className="image-gallery">
      <div className="image-gallery-main">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Product image ${safeIndex + 1}`}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'
            }}
            className="image-gallery-main-img"
          />
        ) : (
          <div className="image-gallery-empty">
            <div className="empty-icon">📷</div>
            <div className="empty-text">Invalid image</div>
          </div>
        )}
        {validImages.length > 1 && (
          <>
            <button
              className="image-gallery-nav image-gallery-prev"
              onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1))}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="image-gallery-nav image-gallery-next"
              onClick={() => setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0))}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="image-gallery-counter">
              {safeIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>
      {validImages.length > 1 && (
        <div className="image-gallery-thumbnails">
          {validImages.map((img, index) => {
            const url = isValidImageUrl(img) ? img : null
            if (!url) return null
            return (
              <div
                key={index}
                className={`image-gallery-thumb ${safeIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext fill="%23999" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E?%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

ImageGallery.displayName = 'ImageGallery'

export default ImageGallery

