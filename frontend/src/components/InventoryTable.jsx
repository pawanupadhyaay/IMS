import { memo } from 'react'
import { FixedSizeList as List } from 'react-window'
import ProductThumbnail from './ProductThumbnail'
import { getDisplayBrand } from '../utils/brandUtils'
import './InventoryTable.css'

const InventoryTable = memo(({ products, onView, onEdit, onDelete, loading }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Memoized row component for performance
  const Row = memo(({ index, style }) => {
    const product = products[index]
    if (!product) return null
    
    const totalValue = (product.inventory || 0) * (product.price || 0)

    return (
      <div style={style} className="table-row">
        <div className="table-cell image">
          <ProductThumbnail
            product={product}
            alt={product.brand || 'Product'}
            size={44}
            onClick={() => onView(product)}
          />
        </div>
        <div className="table-cell brand">{getDisplayBrand(product.brand) || '-'}</div>
        <div className="table-cell sku">{product.sku || '-'}</div>
        <div className="table-cell category">{product.category || '-'}</div>
        <div className="table-cell inventory">
          <span className={product.inventory === 0 ? 'out-of-stock' : ''}>
            {product.inventory || 0}
          </span>
        </div>
        <div className="table-cell price">{formatCurrency(product.price || 0)}</div>
        <div className="table-cell total-value">{formatCurrency(totalValue)}</div>
        <div className="table-cell actions">
          <button
            onClick={() => onView(product)}
            className="action-btn view-btn"
            title="View"
          >
            View
          </button>
          <button
            onClick={() => onEdit(product)}
            className="action-btn edit-btn"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className="action-btn delete-btn"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    )
  })

  if (loading && products.length === 0) {
    return (
      <div className="table-container">
        <div className="loading-message">Loading products...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-message">No products found</div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="table-cell image">Image</div>
        <div className="table-cell brand">Brand</div>
        <div className="table-cell sku">SKU</div>
        <div className="table-cell category">Category</div>
        <div className="table-cell inventory">Inventory</div>
        <div className="table-cell price">Price</div>
        <div className="table-cell total-value">Total Value</div>
        <div className="table-cell actions">Actions</div>
      </div>
      <div className="table-body">
        <List
          height={Math.min(600, products.length * 50)}
          itemCount={products.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  )
})

InventoryTable.displayName = 'InventoryTable'

export default InventoryTable

