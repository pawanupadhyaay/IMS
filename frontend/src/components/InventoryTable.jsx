import { useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import './InventoryTable.css'

const InventoryTable = ({ products, onView, onEdit, onDelete, loading, pagination }) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  })

  const handleDeleteClick = (productId, productName) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    })
  }

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(deleteModal.productId)
      setDeleteModal({ isOpen: false, productId: null, productName: '' })
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' })
  }
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get product image URL (first image from images array or single image)
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0 && product.images[0].url) {
      return product.images[0].url.startsWith('http') 
        ? product.images[0].url 
        : `http://localhost:5000${product.images[0].url}`
    }
    if (product.image && product.image.url) {
      return product.image.url.startsWith('http')
        ? product.image.url
        : `http://localhost:5000${product.image.url}`
    }
    return null
  }

  const Row = ({ index, style }) => {
    const product = products[index]
    const totalValue = (product.inventory || 0) * (product.price || 0)
    // Calculate serial number: (current page - 1) * limit + row index + 1
    const serialNumber = ((pagination?.page || 1) - 1) * (pagination?.limit || 50) + index + 1
    const productImage = getProductImage(product)

    return (
      <div style={style} className="table-row">
        <div className="table-cell serial-no">{serialNumber}</div>
        <div className="table-cell image-cell">
          {productImage ? (
            <div className="product-thumbnail">
              <img
                src={productImage}
                alt={product.brand || 'Product'}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="thumbnail-placeholder" style={{ display: 'none' }}>
                <span className="placeholder-icon">📷</span>
              </div>
            </div>
          ) : (
            <div className="product-thumbnail">
              <div className="thumbnail-placeholder">
                <span className="placeholder-icon">📷</span>
              </div>
            </div>
          )}
        </div>
        <div className="table-cell brand">{product.brand || '-'}</div>
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
            onClick={() => handleDeleteClick(product._id, product.brand + ' ' + product.sku)}
            className="action-btn delete-btn"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

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
        <div className="table-cell serial-no">S.No.</div>
        <div className="table-cell image-cell">Image</div>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-icon">⚠️</div>
              <h2>Delete Product</h2>
            </div>

            <div className="delete-modal-body">
              <p className="delete-warning">
                Are you sure you want to delete this product?
              </p>
              <div className="product-info">
                <strong>{deleteModal.productName}</strong>
              </div>
              <p className="delete-note">
                This action cannot be undone. The product and all its data will be permanently removed.
              </p>
            </div>

            <div className="delete-modal-actions">
              <button
                onClick={handleDeleteCancel}
                className="btn-cancel"
                disabled={false}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-delete"
                disabled={false}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryTable

