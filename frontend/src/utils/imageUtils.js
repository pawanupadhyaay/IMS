/**
 * Unified Image Pipeline - Single Source of Truth
 * Uses ONLY: product.images: string[]
 * 
 * No legacy fallbacks, no mixed contracts, no dual handling
 */

/**
 * Gets the first image URL from product.images array
 * @param {Object} product - Product object
 * @param {string[]} product.images - Array of image URLs
 * @returns {string|null} - First image URL or null
 */
export function getThumbnailUrl(product) {
  if (!product) return null
  
  // Single source of truth: product.images[]
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0]
    // Type-safe check: ensure it's a valid string
    if (typeof firstImage === 'string' && firstImage.trim() !== '') {
      return firstImage
    }
  }
  
  return null
}

/**
 * Gets all valid image URLs from product.images array
 * @param {Object} product - Product object
 * @param {string[]} product.images - Array of image URLs
 * @returns {string[]} - Array of valid image URLs
 */
export function getImageUrls(product) {
  if (!product) return []
  
  // Single source of truth: product.images[]
  if (Array.isArray(product.images)) {
    // Filter and validate: only return valid string URLs
    return product.images.filter(
      (img) => typeof img === 'string' && img.trim() !== ''
    )
  }
  
  return []
}

/**
 * Checks if a value is a valid image URL string
 * @param {any} value - Value to check
 * @returns {boolean} - True if valid string URL
 */
export function isValidImageUrl(value) {
  return typeof value === 'string' && value.trim() !== ''
}

