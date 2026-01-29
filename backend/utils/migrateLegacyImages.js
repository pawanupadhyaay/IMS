const { Product } = require('../models/Product')

/**
 * Lazy migration: Migrate legacy image fields to product.images[]
 * This runs in background (non-blocking) after product fetch
 * 
 * Migration strategy:
 * - If product.images is empty/undefined
 * - Check legacy fields: imageUrl → image.url
 * - Populate images array
 * - Persist in background
 * 
 * @param {Object} product - Product document (Mongoose document or plain object)
 * @returns {Promise<void>} - Resolves when migration is queued (not when complete)
 */
const migrateLegacyImages = async (product) => {
  // Run in background without blocking the response
  setImmediate(async () => {
    try {
      // Skip if product doesn't exist or already has images
      if (!product || !product._id) return
      
      // Skip if images array already exists and has content
      if (Array.isArray(product.images) && product.images.length > 0) {
        return // Already migrated
      }

      let migratedImages = []

      // Priority 1: Check imageUrl (legacy string field)
      if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
        migratedImages = [product.imageUrl.trim()]
      }
      // Priority 2: Check image.url (legacy object field)
      else if (product.image?.url && typeof product.image.url === 'string' && product.image.url.trim() !== '') {
        migratedImages = [product.image.url.trim()]
      }

      // Only update if we found legacy images to migrate
      if (migratedImages.length > 0) {
        // Persist migration to database (non-blocking background operation)
        await Product.updateOne(
          { _id: product._id },
          { $set: { images: migratedImages } }
        )
        
        console.log(`Migrated legacy images for product ${product._id}:`, migratedImages)
      }
    } catch (error) {
      // Silent failure - don't break API responses
      console.error('Error migrating legacy images:', error.message)
    }
  })
}

/**
 * Migrate legacy images inline (for immediate use in response)
 * This populates the product object for the current request
 * without persisting to DB (persistence happens in background)
 * 
 * @param {Object} product - Product document or plain object
 * @returns {Object} - Product with images array populated
 */
const migrateLegacyImagesInline = (product) => {
  if (!product) return product

  // Skip if images array already exists and has content
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product // Already has images
  }

  let migratedImages = []

  // Priority 1: Check imageUrl (legacy string field)
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
    migratedImages = [product.imageUrl.trim()]
  }
  // Priority 2: Check image.url (legacy object field)
  else if (product.image?.url && typeof product.image.url === 'string' && product.image.url.trim() !== '') {
    migratedImages = [product.image.url.trim()]
  }

  // Return product with images populated (for immediate response)
  // Background migration will persist this to DB
  return {
    ...product,
    images: migratedImages.length > 0 ? migratedImages : (product.images || [])
  }
}

module.exports = {
  migrateLegacyImages,
  migrateLegacyImagesInline,
}

