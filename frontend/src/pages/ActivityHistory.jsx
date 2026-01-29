import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useActivityLogs, useActivityLogAdmins } from '../hooks/useActivityLogs'
import { useBrands } from '../hooks/useProducts'
import { useDebounce } from '../hooks/useDebounce'
import { getDisplayBrand } from '../utils/brandUtils'
import ActivityHistoryTable from '../components/ActivityHistoryTable'
import MobileActivityHistory from '../components/mobile/MobileActivityHistory'
import './ActivityHistory.css'

const ActivityHistory = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    actionType: '',
    adminId: '',
    page: 1,
  })

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 500)

  // Build query filters
  const queryFilters = useMemo(() => ({
    page: filters.page,
    limit: 50,
    brand: filters.brand || undefined,
    actionType: filters.actionType || undefined,
    adminId: filters.adminId || undefined,
    search: debouncedSearch || undefined,
  }), [filters.page, filters.brand, filters.actionType, filters.adminId, debouncedSearch])

  // React Query hooks
  const { data: logsData, isLoading } = useActivityLogs(queryFilters)
  const { data: brandsData } = useBrands()
  const { data: adminsData } = useActivityLogAdmins()

  // Extract data with safe defaults
  const logs = logsData?.data || []
  const pagination = logsData?.pagination || { page: 1, limit: 50, total: 0, pages: 0 }
  const brands = brandsData?.data || []
  const admins = adminsData?.data || []

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      actionType: '',
      adminId: '',
      page: 1,
    })
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileActivityHistory
        logs={logs}
        pagination={pagination}
        brands={brands}
        admins={admins}
        filters={filters}
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
        onBack={() => navigate('/dashboard')}
      />
    )
  }

  // Desktop Layout
  return (
    <div className="activity-history-page">
      <div className="activity-history-header">
        <div className="breadcrumb">
          <button onClick={() => navigate('/dashboard')} className="breadcrumb-link">
            Dashboard
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Activity History</span>
        </div>
        <div className="page-title-section">
          <h1>Activity History</h1>
          <p className="page-subtitle">Track all product operations and changes</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
      </div>

      <div className="activity-history-filters">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by Brand or SKU..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input search-input"
          />
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {getDisplayBrand(brand)}
              </option>
            ))}
          </select>
          <select
            value={filters.actionType}
            onChange={(e) => handleFilterChange('actionType', e.target.value)}
            className="filter-select"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Created</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
          </select>
          <select
            value={filters.adminId}
            onChange={(e) => handleFilterChange('adminId', e.target.value)}
            className="filter-select"
          >
            <option value="">All Admins</option>
            {admins.map((admin) => (
              <option key={admin._id} value={admin._id}>
                {admin.name}
              </option>
            ))}
          </select>
          <button onClick={handleClearFilters} className="btn-clear-filters">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="activity-history-content">
        {isLoading && logs.length === 0 ? (
          <div className="loading-message">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-message">No activity logs found</div>
        ) : (
          <>
            <ActivityHistoryTable logs={logs} />
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ActivityHistory

