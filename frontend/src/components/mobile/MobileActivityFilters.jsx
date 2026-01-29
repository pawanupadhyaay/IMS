import { getDisplayBrand } from '../../utils/brandUtils'
import './MobileActivityFilters.css'

const MobileActivityFilters = ({
  isOpen,
  onClose,
  brands,
  admins,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  if (!isOpen) return null

  const handleFilterChange = (key, value) => {
    onFilterChange(key, value)
  }

  const handleClear = () => {
    onClearFilters()
    onClose()
  }

  return (
    <div className="mobile-filters-overlay" onClick={onClose}>
      <div className="mobile-filters-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-filters-handle"></div>
        <div className="mobile-filters-header">
          <h3>Filters</h3>
          <button onClick={onClose} className="mobile-filters-close">×</button>
        </div>

        <div className="mobile-filters-content">
          <div className="mobile-filter-group">
            <label>Brand</label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="mobile-filter-select"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {getDisplayBrand(brand)}
                </option>
              ))}
            </select>
          </div>

          <div className="mobile-filter-group">
            <label>Action</label>
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              className="mobile-filter-select"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Created</option>
              <option value="UPDATE">Updated</option>
              <option value="DELETE">Deleted</option>
            </select>
          </div>

          <div className="mobile-filter-group">
            <label>Admin</label>
            <select
              value={filters.adminId}
              onChange={(e) => handleFilterChange('adminId', e.target.value)}
              className="mobile-filter-select"
            >
              <option value="">All Admins</option>
              {admins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mobile-filters-footer">
          <button onClick={handleClear} className="mobile-filter-btn-clear">
            Clear Filters
          </button>
          <button onClick={onClose} className="mobile-filter-btn-apply">
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileActivityFilters

