import { useState, useMemo } from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { useIsMobile } from '../hooks/useMediaQuery'
import { AuthContext } from '../context/AuthContext'
import { getDisplayBrand } from '../utils/brandUtils'
import { useProducts, useBrands, useDeleteProduct } from '../hooks/useProducts'
import { useDashboardStats } from '../hooks/useDashboard'
import { exportToCSV } from '../services/exportService'
import InventoryTable from '../components/InventoryTable'
import StatsCards from '../components/StatsCards'
import ProductModal from '../components/ProductModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
// Mobile components
import MobileHeader from '../components/mobile/MobileHeader'
import MobileStatsBar from '../components/mobile/MobileStatsBar'
import MobileSearchBar from '../components/mobile/MobileSearchBar'
import MobileProductList from '../components/mobile/MobileProductList'
import MobileFAB from '../components/mobile/MobileFAB'
import MobileFilterSheet from '../components/mobile/MobileFilterSheet'
import MobileProductModal from '../components/mobile/MobileProductModal'
import MobileActionSheet from '../components/mobile/MobileActionSheet'
import './Dashboard.css'
import './MobileDashboard.css'

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [filters, setFilters] = useState({
    brand: '',
    search: '',
    page: 1,
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [modalMode, setModalMode] = useState('view') // view, edit, create
  // Mobile action sheet
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [actionSheetProduct, setActionSheetProduct] = useState(null)
  // Shared delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteProduct, setDeleteProduct] = useState(null)

  // Debounce search input (500ms)
  const debouncedSearch = useDebounce(filters.search, 500)

  // Build query filters
  const queryFilters = useMemo(() => ({
    page: filters.page,
    limit: 50,
    brand: filters.brand || undefined,
    search: debouncedSearch || undefined,
  }), [filters.page, filters.brand, debouncedSearch])

  // React Query hooks - automatic caching, background refetching
  const { data: productsData, isLoading: productsLoading } = useProducts(queryFilters)
  const { data: brandsData } = useBrands()
  const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErrorObj } = useDashboardStats()
  const deleteProductMutation = useDeleteProduct()

  // Extract data with safe defaults
  const products = productsData?.data || []
  const pagination = productsData?.pagination || { page: 1, limit: 50, total: 0, pages: 0 }
  const brands = brandsData?.data || []
  // Always provide a stats object so KPI cards never disappear (prevents "nothing shows")
  const stats = statsData?.data || {
    totalProducts: 0,
    totalStock: 0,
    totalStoreValue: 0,
    outOfStockCount: 0,
  }
  if (statsError) {
    console.error('Dashboard stats failed:', statsErrorObj)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev
      return {
        ...prev,
        [key]: value,
        page: 1, // Reset to first page on filter change
      }
    })
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      handlePageChange(pagination.page + 1)
    }
  }

  const handleClearFilters = () => {
    setFilters({ brand: '', search: '', page: 1 })
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

  // Unified delete handler - opens confirmation modal
  const handleDeleteClick = (product) => {
    setDeleteProduct(product)
    setShowDeleteConfirm(true)
  }

  // Confirmed delete - calls API and updates UI
  const handleConfirmDelete = async () => {
    if (deleteProduct && deleteProduct._id) {
      try {
        await deleteProductMutation.mutateAsync(deleteProduct._id)
        // React Query automatically updates cache and refetches
        setShowDeleteConfirm(false)
        setDeleteProduct(null)
        // Also close action sheet if open
        setShowActionSheet(false)
        setActionSheetProduct(null)
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteProduct(null)
  }

  // Mobile-specific handlers
  const handleMoreClick = (product) => {
    setActionSheetProduct(product)
    setShowActionSheet(true)
  }

  const handleActionSheetDelete = () => {
    if (actionSheetProduct) {
      handleDeleteClick(actionSheetProduct)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedProduct(null)
    // No need to reload - React Query handles cache updates
  }

  const handleExportCSV = async () => {
    try {
      await exportToCSV({
        brand: filters.brand || undefined,
        search: debouncedSearch || undefined,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    }
  }

  const loading = productsLoading && products.length === 0
  const hasMore = pagination.page < pagination.pages

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="mobile-dashboard">
        <MobileHeader
          user={user}
          onLogout={logout}
          onCreateProduct={handleCreateProduct}
          onExportCSV={handleExportCSV}
        />
        
        <MobileStatsBar stats={stats} />
        
        <MobileSearchBar
          value={filters.search}
          onChange={(value) => handleFilterChange('search', value)}
          onFilterClick={() => setShowFilterSheet(true)}
        />

        <main className="mobile-dashboard-main">
          {loading && products.length === 0 ? (
            <div className="mobile-loading">Loading...</div>
          ) : (
            <MobileProductList
              products={products}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onMoreClick={handleMoreClick}
              loading={productsLoading}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          )}
        </main>

        <MobileFAB
          onCreateProduct={handleCreateProduct}
          onExportCSV={handleExportCSV}
        />

        <MobileFilterSheet
          isOpen={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          brands={brands}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <MobileActionSheet
          isOpen={showActionSheet}
          onClose={() => {
            setShowActionSheet(false)
            setActionSheetProduct(null)
          }}
          onDelete={handleActionSheetDelete}
        />

        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          product={deleteProduct}
        />

        {showModal && (
          <MobileProductModal
            product={selectedProduct}
            mode={modalMode}
            onClose={handleModalClose}
            onSave={handleModalClose}
            brands={brands}
          />
        )}
      </div>
    )
  }

  // Desktop Layout (unchanged)
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Samay Watch IMS</h1>
          <div className="header-actions">
            <button
              onClick={() => navigate('/activity-history')}
              className="btn-activity-history"
            >
              Activity History
            </button>
            <span className="user-info">Welcome, {user?.name}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {loading && !stats && products.length === 0 ? (
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
                      {getDisplayBrand(brand)}
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

            <InventoryTable
              products={products}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              loading={productsLoading}
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
          brands={brands}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        product={deleteProduct}
      />
    </div>
  )
}

export default Dashboard
