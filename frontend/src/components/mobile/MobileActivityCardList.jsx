import { memo } from 'react'
import MobileActivityCard from './MobileActivityCard'
import './MobileActivityCardList.css'

const MobileActivityCardList = memo(({ logs, isLoading, onLoadMore, hasMore }) => {
  if (logs.length === 0) {
    return (
      <div className="mobile-activity-empty">
        <div className="empty-icon">📋</div>
        <div className="empty-text">No activity logs</div>
      </div>
    )
  }

  return (
    <div className="mobile-activity-card-list">
      {logs.map((log) => (
        <MobileActivityCard key={log._id} log={log} />
      ))}
      
      {hasMore && (
        <div className="mobile-load-more-container">
          <button
            className="mobile-load-more-btn"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
})

MobileActivityCardList.displayName = 'MobileActivityCardList'

export default MobileActivityCardList

