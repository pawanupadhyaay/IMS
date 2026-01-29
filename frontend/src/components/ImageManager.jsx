import { memo, useState } from 'react'
import { isValidImageUrl } from '../utils/imageUtils'
import './ImageManager.css'

const ImageManager = memo(({ images = [], onChange, disabled = false }) => {
  const [newImageUrl, setNewImageUrl] = useState('')

  // Ensure images is always an array of valid strings
  const validImages = Array.isArray(images) 
    ? images.filter(img => isValidImageUrl(img))
    : []

  const handleAddImage = () => {
    // newImageUrl is always string from input, but add safety check
    if (typeof newImageUrl !== 'string') return
    
    const url = newImageUrl.trim()
    if (!url) return

    // Basic URL validation
    try {
      new URL(url)
      if (onChange) {
        onChange([...validImages, url])
      }
      setNewImageUrl('')
    } catch (e) {
      alert('Please enter a valid URL')
    }
  }

  const handleRemoveImage = (index) => {
    if (onChange) {
      onChange(validImages.filter((_, i) => i !== index))
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddImage()
    }
  }

  return (
    <div className="image-manager">
      <div className="image-manager-input-group">
        <input
          type="text"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Paste image URL here"
          disabled={disabled}
          className="image-manager-input"
        />
        <button
          type="button"
          onClick={handleAddImage}
          disabled={disabled || !newImageUrl.trim()}
          className="image-manager-add-btn"
        >
          Add Image
        </button>
      </div>

      {validImages.length > 0 && (
        <div className="image-manager-grid">
          {validImages.map((url, index) => {
            if (!isValidImageUrl(url)) return null
            return (
              <div key={index} className="image-manager-item">
                <div className="image-manager-thumb">
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23ddd" width="120" height="120"/%3E%3Ctext fill="%23999" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="image-manager-remove"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

ImageManager.displayName = 'ImageManager'

export default ImageManager

