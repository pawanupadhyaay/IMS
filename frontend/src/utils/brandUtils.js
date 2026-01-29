/**
 * Brand Display Utility
 * 
 * Global rule: Display only the first word of brand name in UI
 * Full brand name remains in DB and API responses
 * 
 * Examples:
 * "Alexandre Christie" → "Alexandre"
 * "Michael Kors" → "Michael"
 * "Tommy Hilfiger" → "Tommy"
 * "Rolex" → "Rolex"
 * 
 * @param {string} brand - Full brand name from product/log
 * @returns {string} - First word of brand name for display
 */
export function getDisplayBrand(brand) {
  if (!brand || typeof brand !== 'string') {
    return ''
  }
  
  // Get first word (split by whitespace, take first element)
  const firstWord = brand.trim().split(/\s+/)[0]
  return firstWord || ''
}

