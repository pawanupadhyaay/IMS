import { useState, useEffect, useMemo } from 'react'
import { useCreateProduct, usePatchProduct, useUpdateProduct } from '../hooks/useProducts'
// Unified image pipeline: use product.images directly
import { getDisplayBrand } from '../utils/brandUtils'
import ImageGallery from './ImageGallery'
import ImageManager from './ImageManager'
import './ProductModal.css'

const ProductModal = ({ product, mode, onClose, onSave, brands = [] }) => {
  const [formData, setFormData] = useState({
    brand: '',
    sku: '',
    category: '',
    inventory: 0,
    price: 0,
    description: '',
    metafields: {
      caseMaterial: '',
      dialColor: '',
      waterResistance: '',
      warrantyPeriod: '',
      movement: '',
      gender: '',
      caseSize: '',
    },
    images: [],
  })
  const [error, setError] = useState('')

  // React Query mutations with optimistic updates
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const patchMutation = usePatchProduct() // Use PATCH for partial updates (optimized)

  useEffect(() => {
    if (product && (mode === 'view' || mode === 'edit')) {
      setFormData({
        brand: product.brand || '',
        sku: product.sku || '',
        category: product.category || '',
        inventory: product.inventory || 0,
        price: product.price || 0,
        description: product.description || '',
        metafields: {
          caseMaterial: product.metafields?.caseMaterial || '',
          dialColor: product.metafields?.dialColor || '',
          waterResistance: product.metafields?.waterResistance || '',
          warrantyPeriod: product.metafields?.warrantyPeriod || '',
          movement: product.metafields?.movement || '',
          gender: product.metafields?.gender || '',
          caseSize: product.metafields?.caseSize || '',
        },
        images: Array.isArray(product.images) ? product.images : [],
      })
    }
  }, [product, mode])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('metafields.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        metafields: {
          ...prev.metafields,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'inventory' || name === 'price' ? parseFloat(value) || 0 : value,
      }))
    }
  }

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }))
  }

  // Calculate only changed fields for PATCH (optimized) - function instead of memo
  const getChangedFields = () => {
    if (!product || mode !== 'edit') return formData
    
    const changed = {}
    // Exclude brand and SKU from edit mode (read-only fields)
    const fields = ['category', 'inventory', 'price', 'description', 'images']
    
    fields.forEach(field => {
      if (field === 'images') {
        const currentImages = Array.isArray(product.images) ? product.images : []
        const newImages = Array.isArray(formData.images) ? formData.images.filter(img => typeof img === 'string' && img.trim() !== '') : []
        if (JSON.stringify(currentImages) !== JSON.stringify(newImages)) {
          changed.images = newImages
        }
      } else if (formData[field] !== product[field]) {
        changed[field] = formData[field]
      }
    })
    
    // Check metafields
    if (product.metafields) {
      const metaChanged = {}
      Object.keys(formData.metafields).forEach(key => {
        if (formData.metafields[key] !== product.metafields?.[key]) {
          metaChanged[key] = formData.metafields[key]
        }
      })
      if (Object.keys(metaChanged).length > 0) {
        changed.metafields = { ...product.metafields, ...metaChanged }
      }
    }
    
    return changed
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'view') {
      onClose()
      return
    }

    setError('')

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(formData)
        // Optimistic: Close modal immediately, React Query handles cache update
        onClose()
      } else if (mode === 'edit') {
        // Use PATCH for partial updates (only changed fields)
        const changedFields = getChangedFields()
        if (Object.keys(changedFields).length === 0) {
          // No changes, just close
          onClose()
          return
        }
        
        await patchMutation.mutateAsync({
          id: product._id,
          data: changedFields
        })
        // Optimistic: Close modal immediately, UI already updated
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to save product')
      // Don't close on error - let user retry
    }
  }

  const loading = createMutation.isLoading || updateMutation.isLoading || patchMutation.isLoading

  const isViewMode = mode === 'view'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mode === 'view' && 'View Product'}
            {mode === 'edit' && 'Edit Product'}
            {mode === 'create' && 'Create Product'}
          </h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand</label>
                {mode === 'create' ? (
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    disabled={isViewMode}
                    required
                    className="form-select"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {getDisplayBrand(brand)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    readOnly
                    disabled
                    className="form-input-readonly"
                  />
                )}
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={isViewMode || mode === 'edit'}
                  readOnly={mode === 'edit'}
                  className={mode === 'edit' ? 'form-input-readonly' : ''}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group">
                <label>Inventory</label>
                <input
                  type="number"
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleChange}
                  disabled={isViewMode}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={isViewMode}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isViewMode}
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Product Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Case Material</label>
                <input
                  type="text"
                  name="metafields.caseMaterial"
                  value={formData.metafields.caseMaterial}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group">
                <label>Dial Color</label>
                <input
                  type="text"
                  name="metafields.dialColor"
                  value={formData.metafields.dialColor}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group">
                <label>Water Resistance</label>
                <input
                  type="text"
                  name="metafields.waterResistance"
                  value={formData.metafields.waterResistance}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group">
                <label>Warranty Period</label>
                <input
                  type="text"
                  name="metafields.warrantyPeriod"
                  value={formData.metafields.warrantyPeriod}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group">
                <label>Movement</label>
                <input
                  type="text"
                  name="metafields.movement"
                  value={formData.metafields.movement}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <input
                  type="text"
                  name="metafields.gender"
                  value={formData.metafields.gender}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group">
                <label>Case Size</label>
                <input
                  type="text"
                  name="metafields.caseSize"
                  value={formData.metafields.caseSize}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Images</h3>
            {isViewMode ? (
              <ImageGallery images={formData.images} product={product} />
            ) : (
              <ImageManager
                images={formData.images}
                onChange={handleImagesChange}
                disabled={isViewMode}
              />
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button type="submit" disabled={loading} className="btn-save">
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal

