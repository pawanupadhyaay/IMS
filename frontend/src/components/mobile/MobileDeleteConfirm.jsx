import './MobileDeleteConfirm.css'

const MobileDeleteConfirm = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null

  return (
    <div className="mobile-delete-overlay" onClick={onClose}>
      <div className="mobile-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-delete-header">
          <div className="mobile-delete-icon">⚠️</div>
          <h3>Delete Product</h3>
        </div>
        
        <div className="mobile-delete-content">
          <p>
            Are you sure you want to delete <strong>{productName || 'this product'}</strong>?
          </p>
          <p className="mobile-delete-warning">
            This action cannot be undone.
          </p>
        </div>

        <div className="mobile-delete-actions">
          <button
            className="mobile-delete-btn cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="mobile-delete-btn confirm"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileDeleteConfirm

