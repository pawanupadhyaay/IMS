import { useState, useEffect, useCallback } from 'react'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getDashboardStats } from '../services/dashboardService'
import { getProducts, getBrands, deleteProduct } from '../services/productService'
import { exportToCSV } from '../services/exportService'
import InventoryTable from '../components/InventoryTable'
import StatsCards from '../components/StatsCards'
import ProductModal from '../components/ProductModal'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext)
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [brandsLoaded, setBrandsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    brand: '',
    search: '',
    page: 1,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // view, edit, create
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  // Debounce filter changes to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500) // 500ms debounce for better UX

    return () => clearTimeout(timer)
  }, [filters])

  // Load brands only once on component mount
  useEffect(() => {
    loadBrands()
    loadStats()
  }, [])

  // Load products when filters change
  useEffect(() => {
    if (debouncedFilters.page > 0) { // Only load if we have valid filters
      loadProducts()
    }
  }, [debouncedFilters])

  const loadBrands = async () => {
    try {
      const brandsData = await getBrands()
      setBrands(brandsData.data)
      setBrandsLoaded(true)
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getDashboardStats()
      setStats(statsData.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Build query params - only include non-empty values
      const params = {
        page: debouncedFilters.page,
        limit: 50,
      }

      // Only add search if it has a value
      if (debouncedFilters.search && debouncedFilters.search.trim()) {
        params.search = debouncedFilters.search.trim()
      }

      // Only add brand filter if search is not active
      if (!debouncedFilters.search && debouncedFilters.brand && debouncedFilters.brand.trim()) {
        params.brand = debouncedFilters.brand.trim()
      }

      console.log('Loading products with params:', params)

      const productsData = await getProducts(params)

      setProducts(productsData.data)
      setPagination(productsData.pagination)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to first page on filter change (except for page changes)
    }))
  }, [])

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id)
      // Reload all data to keep stats updated
      loadStats()
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedProduct(null)
    // Reload all data after modal operations to keep stats current
    loadStats()
    loadBrands()
    loadProducts()
  }

  const handleExportCSV = async () => {
    try {
      await exportToCSV({
        brand: filters.brand || undefined,
        search: filters.search || undefined,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-container">
          {/* Logo Section */}
          <div className="logo-section">
            <Link to="/dashboard" className="logo-link">
              <div className="logo">
                <div className="logo-icon">⏰</div>
                <div className="logo-text">
                  <h1>Samay</h1>
                  <span>Watch IMS</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Section */}
          <nav className="header-nav">
            <Link to="/dashboard" className="nav-link active">
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
            <Link to="/history" className="nav-link">
              <span className="nav-icon">📋</span>
              Histories
            </Link>
          </nav>

          {/* User Section */}
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="user-details">
                <span className="welcome-text">Welcome back</span>
                <span className="user-name">{user?.name}</span>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={logout} className="logout-button">
                <span className="logout-icon">🚪</span>
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="mobile-menu-toggle">
            <button className="menu-toggle-btn">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {loading && !stats ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <StatsCards stats={stats} />
            
            <div className="dashboard-controls">
              <div className="controls-left">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="brand-filter"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div className="controls-right">
                <button onClick={handleCreateProduct} className="btn-primary">
                  + Add Product
                </button>
                <button onClick={handleExportCSV} className="btn-secondary">
                  Export CSV
                </button>
              </div>
            </div>

            {/* Brand Info Display */}
            {filters.brand && (
              <div className="brand-info-display">
                <h3>Total products in {filters.brand} Watches: {pagination.total}</h3>
              </div>
            )}

            <InventoryTable
              products={products}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              loading={loading}
              pagination={pagination}
            />

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
                  disabled={pagination.page === pagination.pages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <ProductModal
          product={selectedProduct}
          mode={modalMode}
          onClose={handleModalClose}
          onSave={handleModalClose}
        />
      )}
    </div>
  )
}

export default Dashboard

