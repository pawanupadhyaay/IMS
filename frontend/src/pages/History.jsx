import { useState, useEffect, useMemo } from 'react'
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import './History.css'

const History = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    brand: '',
    action: '',
    adminId: '',
    search: '',
    page: 1,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // Memoize filters to prevent unnecessary API calls
  const debouncedFilters = useMemo(() => {
    return filters
  }, [filters.brand, filters.action, filters.adminId, filters.search, filters.page])

  useEffect(() => {
    loadData()
  }, [debouncedFilters])

  const loadData = async () => {
    setLoading(true)
    try {
      const [historyData, adminsData] = await Promise.all([
        api.get('/history', { params: debouncedFilters }),
        api.get('/history/admins'),
      ])

      setLogs(historyData.data.data)
      setPagination(historyData.data.pagination)
      setAdmins(adminsData.data.data)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadge = (action) => {
    const badges = {
      CREATE: { text: 'Created', color: '#10b981', icon: '➕' },
      UPDATE: { text: 'Updated', color: '#f59e0b', icon: '✏️' },
      DELETE: { text: 'Deleted', color: '#ef4444', icon: '🗑️' },
    }
    return badges[action] || { text: action, color: '#6b7280', icon: '📝' }
  }

  return (
    <div className="history-page">
      <div className="history-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/dashboard" className="breadcrumb-link">
            <span className="breadcrumb-icon">🏠</span>
            Dashboard
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Activity History</span>
        </nav>

        {/* Header with Back Button */}
        <div className="history-header">
          <div className="header-top">
            <button onClick={() => navigate('/dashboard')} className="back-button">
              <span className="back-icon">←</span>
              <span className="back-text">Back to Dashboard</span>
            </button>
          </div>
          <div className="header-content">
            <h1>Activity History</h1>
            <p>Track all product operations and changes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="history-filters">
          <div className="filters-grid">
            <input
              type="text"
              placeholder="Search by Brand or SKU..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="filter-select"
            >
              <option value="">All Brands</option>
              {[...new Set(logs.map(log => log.brand).filter(Boolean))].map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="filter-select"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
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
          </div>
        </div>

        {/* History Table */}
        <div className="history-table-wrapper">
          {loading ? (
            <div className="loading-state">Loading history...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No history records found</p>
            </div>
          ) : (
            <>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Brand Name</th>
                    <th>SKU</th>
                    <th>Action</th>
                    <th>Admin</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const badge = getActionBadge(log.action)
                    return (
                      <tr key={log._id}>
                        <td className="brand-cell">
                          <strong>{log.brand || 'N/A'}</strong>
                        </td>
                        <td className="sku-cell">{log.sku || 'N/A'}</td>
                        <td>
                          <span
                            className="action-badge"
                            style={{ backgroundColor: badge.color }}
                          >
                            {badge.icon} {badge.text}
                          </span>
                        </td>
                        <td className="admin-cell">
                          <div className="admin-info">
                            <div className="admin-name">{log.adminName}</div>
                            <div className="admin-email">{log.adminEmail}</div>
                          </div>
                        </td>
                        <td className="timestamp-cell">{formatDate(log.timestamp)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="pagination-btn prev"
                  >
                    ← Previous
                  </button>
                  <div className="pagination-info">
                    Page <strong>{pagination.page}</strong> of{' '}
                    <strong>{pagination.pages}</strong>
                    <span className="total-count">({pagination.total} total)</span>
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                    className="pagination-btn next"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default History
