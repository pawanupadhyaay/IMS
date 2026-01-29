import { useRef, useEffect } from 'react'
import './MobileStatsBar.css'

const MobileStatsBar = ({ stats }) => {
  const scrollContainer = useRef(null)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (!stats) return null

  return (
    <div className="mobile-stats-bar-container">
      <div className="mobile-stats-bar" ref={scrollContainer}>
        <div className="mobile-stat-card">
          <div className="mobile-stat-label">Products</div>
          <div className="mobile-stat-value">{stats.totalProducts?.toLocaleString() || 0}</div>
        </div>
        <div className="mobile-stat-card">
          <div className="mobile-stat-label">Stock</div>
          <div className="mobile-stat-value">{stats.totalStock?.toLocaleString() || 0}</div>
        </div>
        <div className="mobile-stat-card">
          <div className="mobile-stat-label">Value</div>
          <div className="mobile-stat-value">{formatCurrency(stats.totalStoreValue || 0)}</div>
        </div>
        <div className="mobile-stat-card">
          <div className="mobile-stat-label">Out</div>
          <div className={`mobile-stat-value ${stats.outOfStockCount > 0 ? 'out-of-stock' : ''}`}>
            {stats.outOfStockCount?.toLocaleString() || 0}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileStatsBar

