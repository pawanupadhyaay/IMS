import { useState } from 'react'
import './MobileSearchBar.css'

const MobileSearchBar = ({ value, onChange, onFilterClick }) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`mobile-search-bar ${isFocused ? 'focused' : ''}`}>
      <div className="mobile-search-input-wrapper">
        <span className="mobile-search-icon">🔍</span>
        <input
          type="text"
          className="mobile-search-input"
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <button
        className="mobile-filter-btn"
        onClick={onFilterClick}
        aria-label="Open filters"
      >
        <span className="filter-icon">⚙️</span>
      </button>
    </div>
  )
}

export default MobileSearchBar

