import { getDisplayBrand } from '../utils/brandUtils'
import './DeleteConfirmModal.css'

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, product }) => {
  if (!isOpen || !product) return null

  const productName = getDisplayBrand(product.brand) || 'Unknown Product'
  const productSKU = product.sku || 'No SKU'

  return (
    <div className="delete-confirm-overlay" onClick={onClose}>
      <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirm-header">
          <div className="delete-confirm-icon">⚠️</div>
          <h3>Delete Product</h3>
        </div>
        
        <div className="delete-confirm-content">
          <p className="delete-confirm-product-info">
            <strong>Product:</strong> {productName}
          </p>
          <p className="delete-confirm-product-info">
            <strong>SKU:</strong> {productSKU}
          </p>
          <p className="delete-confirm-warning">
            This action cannot be undone.
          </p>
        </div>

        <div className="delete-confirm-actions">
          <button
            className="delete-confirm-btn cancel"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="delete-confirm-btn confirm"
            onClick={onConfirm}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal

