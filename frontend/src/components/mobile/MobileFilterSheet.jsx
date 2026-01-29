import { useState } from 'react'
import { getDisplayBrand } from '../../utils/brandUtils'
import './MobileFilterSheet.css'

const MobileFilterSheet = ({ isOpen, onClose, brands, filters, onFilterChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApply = () => {
    onFilterChange('brand', localFilters.brand)
    onFilterChange('search', localFilters.search)
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({ brand: '', search: '' })
    onClearFilters()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="mobile-filter-overlay" onClick={onClose}>
      <div className="mobile-filter-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-filter-header">
          <h2>Filters</h2>
          <button className="mobile-filter-close" onClick={onClose}>×</button>
        </div>

        <div className="mobile-filter-content">
          <div className="mobile-filter-section">
            <label className="mobile-filter-label">Search</label>
            <input
              type="text"
              className="mobile-filter-input"
              placeholder="Search products..."
              value={localFilters.search}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            />
          </div>

          <div className="mobile-filter-section">
            <label className="mobile-filter-label">Brand</label>
            <select
              className="mobile-filter-select"
              value={localFilters.brand}
              onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value })}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {getDisplayBrand(brand)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mobile-filter-actions">
          <button className="mobile-filter-btn clear" onClick={handleClear}>
            Clear All
          </button>
          <button className="mobile-filter-btn apply" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileFilterSheet

