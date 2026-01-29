import './MobileActionSheet.css'

const MobileActionSheet = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null

  const handleDelete = () => {
    onClose()
    // Small delay to allow sheet to close smoothly
    setTimeout(() => {
      onDelete()
    }, 200)
  }

  return (
    <div className="mobile-action-sheet-overlay" onClick={onClose}>
      <div className="mobile-action-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-action-sheet-handle"></div>
        <div className="mobile-action-sheet-actions">
          <button
            className="mobile-action-item danger"
            onClick={handleDelete}
          >
            <span className="action-icon">🗑️</span>
            <span className="action-label">Delete</span>
          </button>
        </div>
        <button className="mobile-action-sheet-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default MobileActionSheet

