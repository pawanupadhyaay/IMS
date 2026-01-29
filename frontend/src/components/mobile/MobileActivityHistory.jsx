import { useState } from 'react'
import MobileActivityHeader from './MobileActivityHeader'
import MobileActivityFilters from './MobileActivityFilters'
import MobileActivityCardList from './MobileActivityCardList'
import './MobileActivityHistory.css'

const MobileActivityHistory = ({
  logs,
  pagination,
  brands,
  admins,
  filters,
  isLoading,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onBack,
}) => {
  const [showFilters, setShowFilters] = useState(false)

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      onPageChange(pagination.page + 1)
    }
  }

  return (
    <div className="mobile-activity-history">
      <MobileActivityHeader onBack={onBack} />

      <MobileActivityFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        brands={brands}
        admins={admins}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      <div className="mobile-activity-search">
        <input
          type="text"
          placeholder="Search by Brand or SKU..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="mobile-search-input"
        />
        <button
          className="mobile-filter-btn"
          onClick={() => setShowFilters(true)}
          aria-label="Filters"
        >
          ⚙️
        </button>
      </div>

      <main className="mobile-activity-main">
        {isLoading && logs.length === 0 ? (
          <div className="mobile-loading">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="mobile-empty">No activity logs found</div>
        ) : (
          <MobileActivityCardList
            logs={logs}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            hasMore={pagination.page < pagination.pages}
          />
        )}
      </main>
    </div>
  )
}

export default MobileActivityHistory

