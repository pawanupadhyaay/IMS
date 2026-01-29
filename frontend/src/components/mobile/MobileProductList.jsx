import { memo, useCallback } from 'react'
import MobileProductCard from './MobileProductCard'
import './MobileProductList.css'

const MobileProductList = memo(({ products, onView, onEdit, onMoreClick, loading, onLoadMore, hasMore }) => {
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore])

  if (loading && products.length === 0) {
    return (
      <div className="mobile-product-list-loading">
        <div className="loading-spinner"></div>
        <div>Loading products...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="mobile-product-list-empty">
        <div className="empty-icon">📦</div>
        <div className="empty-message">No products found</div>
      </div>
    )
  }

  return (
    <div className="mobile-product-list">
      {products.map((product) => (
        <MobileProductCard
          key={product._id}
          product={product}
          onView={onView}
          onEdit={onEdit}
          onMoreClick={onMoreClick}
        />
      ))}
      
      {hasMore && (
        <div className="mobile-load-more-container">
          <button
            className="mobile-load-more-btn"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
})

MobileProductList.displayName = 'MobileProductList'

export default MobileProductList

