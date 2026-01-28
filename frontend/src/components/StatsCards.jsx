import './StatsCards.css'

const StatsCards = ({ stats }) => {
  if (!stats) return null

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-label">Total Products</div>
        <div className="stat-value">{stats.totalProducts.toLocaleString()}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Stock</div>
        <div className="stat-value">{stats.totalStock.toLocaleString()}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Store Value</div>
        <div className="stat-value">{formatCurrency(stats.totalStoreValue)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Out of Stock</div>
        <div className="stat-value out-of-stock">
          {stats.outOfStockCount.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default StatsCards

