import { memo } from 'react'
import { getDisplayBrand } from '../../utils/brandUtils'
import './MobileActivityCard.css'

const MobileActivityCard = memo(({ log }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getActionConfig = (actionType) => {
    const config = {
      CREATE: { label: 'Created', className: 'action-created', icon: '✓' },
      UPDATE: { label: 'Updated', className: 'action-updated', icon: '✎' },
      DELETE: { label: 'Deleted', className: 'action-deleted', icon: '×' },
    }
    return config[actionType] || { label: actionType, className: 'action-default', icon: '•' }
  }

  const action = getActionConfig(log.actionType)

  return (
    <div className="mobile-activity-card">
      <div className="mobile-activity-badge">
        <span className={`action-badge ${action.className}`}>
          <span className="badge-icon">{action.icon}</span>
          {action.label}
        </span>
      </div>
      
      <div className="mobile-activity-content">
        <div className="activity-brand">{getDisplayBrand(log.brand) || 'No Brand'}</div>
        <div className="activity-sku">SKU: {log.sku || 'No SKU'}</div>
        <div className="activity-admin">
          By: {log.adminName || 'Unknown'}
        </div>
        <div className="activity-timestamp">
          {formatDate(log.createdAt)}
        </div>
      </div>
    </div>
  )
})

MobileActivityCard.displayName = 'MobileActivityCard'

export default MobileActivityCard

