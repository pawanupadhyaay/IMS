import { useState, useEffect, useMemo } from 'react'
import { useCreateProduct, usePatchProduct } from '../../hooks/useProducts'
// Unified image pipeline: use product.images directly
import { getDisplayBrand } from '../../utils/brandUtils'
import ImageGallery from '../ImageGallery'
import ImageManager from '../ImageManager'
import './MobileProductModal.css'

const MobileProductModal = ({ product, mode, onClose, onSave, brands = [] }) => {
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
  const [activeSection, setActiveSection] = useState('basic')

  const createMutation = useCreateProduct()
  const patchMutation = usePatchProduct()

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
        onClose()
      } else if (mode === 'edit') {
        const changedFields = getChangedFields()
        if (Object.keys(changedFields).length === 0) {
          onClose()
          return
        }
        await patchMutation.mutateAsync({
          id: product._id,
          data: changedFields
        })
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to save product')
    }
  }

  const loading = createMutation.isLoading || patchMutation.isLoading
  const isViewMode = mode === 'view'

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <h2>
            {mode === 'view' && 'View Product'}
            {mode === 'edit' && 'Edit Product'}
            {mode === 'create' && 'Create Product'}
          </h2>
          <button onClick={onClose} className="mobile-modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="mobile-modal-form">
          {error && <div className="mobile-error-message">{error}</div>}

          {/* Section Tabs */}
          <div className="mobile-modal-tabs">
            <button
              type="button"
              className={`mobile-tab ${activeSection === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveSection('basic')}
            >
              Basic
            </button>
            <button
              type="button"
              className={`mobile-tab ${activeSection === 'details' ? 'active' : ''}`}
              onClick={() => setActiveSection('details')}
            >
              Details
            </button>
            <button
              type="button"
              className={`mobile-tab ${activeSection === 'image' ? 'active' : ''}`}
              onClick={() => setActiveSection('image')}
            >
              Image
            </button>
          </div>

          <div className="mobile-modal-body">
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="mobile-form-section">
                <div className="mobile-form-group">
                  <label>Brand</label>
                  {mode === 'create' ? (
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      className="mobile-form-select"
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
                      className="mobile-form-input mobile-form-input-readonly"
                    />
                  )}
                </div>
                <div className="mobile-form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    disabled={isViewMode || mode === 'edit'}
                    readOnly={mode === 'edit'}
                    className={`mobile-form-input ${mode === 'edit' ? 'mobile-form-input-readonly' : ''}`}
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
                <div className="mobile-form-row">
                  <div className="mobile-form-group">
                    <label>Inventory</label>
                    <input
                      type="number"
                      name="inventory"
                      value={formData.inventory}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="0"
                      className="mobile-form-input"
                    />
                  </div>
                  <div className="mobile-form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="0"
                      step="0.01"
                      className="mobile-form-input"
                    />
                  </div>
                </div>
                <div className="mobile-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isViewMode}
                    rows="4"
                    className="mobile-form-textarea"
                  />
                </div>
              </div>
            )}

            {/* Product Details Section */}
            {activeSection === 'details' && (
              <div className="mobile-form-section">
                <div className="mobile-form-group">
                  <label>Case Material</label>
                  <input
                    type="text"
                    name="metafields.caseMaterial"
                    value={formData.metafields.caseMaterial}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Dial Color</label>
                  <input
                    type="text"
                    name="metafields.dialColor"
                    value={formData.metafields.dialColor}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Water Resistance</label>
                  <input
                    type="text"
                    name="metafields.waterResistance"
                    value={formData.metafields.waterResistance}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Warranty Period</label>
                  <input
                    type="text"
                    name="metafields.warrantyPeriod"
                    value={formData.metafields.warrantyPeriod}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Movement</label>
                  <input
                    type="text"
                    name="metafields.movement"
                    value={formData.metafields.movement}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Gender</label>
                  <input
                    type="text"
                    name="metafields.gender"
                    value={formData.metafields.gender}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Case Size</label>
                  <input
                    type="text"
                    name="metafields.caseSize"
                    value={formData.metafields.caseSize}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mobile-form-input"
                  />
                </div>
              </div>
            )}

            {/* Image Section */}
            {activeSection === 'image' && (
              <div className="mobile-form-section">
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
            )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="mobile-modal-footer">
            <button type="button" onClick={onClose} className="mobile-modal-btn cancel">
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button type="submit" disabled={loading} className="mobile-modal-btn save">
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default MobileProductModal

