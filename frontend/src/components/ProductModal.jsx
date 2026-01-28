import { useState, useEffect } from 'react'
import { createProduct, updateProduct, getBrands } from '../services/productService'
import api from '../services/api'
import './ProductModal.css'

const ProductModal = ({ product, mode, onClose, onSave }) => {
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
    image: { url: '', altText: '' },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [brands, setBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(true)

  // Load brands when modal opens
  useEffect(() => {
    const loadBrandsList = async () => {
      setBrandsLoading(true)
      try {
        const brandsData = await getBrands()
        if (brandsData && brandsData.data && Array.isArray(brandsData.data)) {
          setBrands(brandsData.data)
        } else {
          setBrands([])
        }
      } catch (error) {
        console.error('Error loading brands:', error)
        setBrands([])
      } finally {
        setBrandsLoading(false)
      }
    }
    loadBrandsList()
  }, [])

  useEffect(() => {
    if (product && (mode === 'view' || mode === 'edit')) {
      console.log('Loading product for edit:', product._id, 'Images:', product.images);
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
        images: (product.images || []).map(img => {
          if (!img || !img.url) return null
          // Add null safety for url string operations
          const url = typeof img.url === 'string' ? img.url : String(img.url || '')
          if (!url) return null
          
          return {
            ...img,
            url: url.startsWith('http') ? url : `http://localhost:5000${url}`
          }
        }).filter(Boolean),
        image: product.image || { url: '', altText: '' },
      })
    }
  }, [product, mode])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (!name) return // Safety check
    
    if (name.startsWith('metafields.')) {
      const parts = name.split('.')
      const field = parts && parts.length > 1 ? parts[1] : null
      if (!field) return // Safety check
      
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

  const handleInventoryIncrement = () => {
    setFormData((prev) => ({
      ...prev,
      inventory: (prev.inventory || 0) + 1,
    }))
  }

  const handleInventoryDecrement = () => {
    setFormData((prev) => ({
      ...prev,
      inventory: Math.max(0, (prev.inventory || 0) - 1),
    }))
  }

  const handleInventoryChange = (e) => {
    const value = e.target.value
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value) || 0)
    setFormData((prev) => ({
      ...prev,
      inventory: numValue,
    }))
  }

  const handleImageUrlChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        url: e.target.value,
      },
    }))
  }

  const handleAddImageUrl = () => {
    if (!formData.newImageUrl) return;

    // Basic URL validation
    try {
      new URL(formData.newImageUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    // Check if URL is already added
    const existingUrls = formData.images?.map(img => img.url) || [];
    if (existingUrls.includes(formData.newImageUrl)) {
      alert('This URL is already added');
      return;
    }

    const newImage = {
      url: formData.newImageUrl,
      altText: `Image ${formData.images.length + 1}`,
    };

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), newImage],
      newImageUrl: '',
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Performance check: Warn for large files
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const largeFiles = files.filter(file => file.size > maxFileSize);

    if (largeFiles.length > 0) {
      alert(`Some files are too large. Maximum size allowed is 5MB per file.`);
      return;
    }

    // Show loading state
    setLoading(true);

    try {
      const formDataUpload = new FormData();
      files.forEach(file => {
        // Compress images if they're too large (optional optimization)
        if (file.size > 1024 * 1024) { // 1MB
          console.log(`Large file detected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }
        formDataUpload.append('images', file);
      });

      console.log('Uploading files:', files.map(f => ({ name: f.name, size: f.size })));

      const response = await api.post('/products/upload-images', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('Upload response:', response);

      if (response.data.success) {
        console.log('Images uploaded successfully:', response.data.data);
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...response.data.data],
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code
      });

      if (error.code === 'ECONNABORTED') {
        alert('Upload timed out. Please try with smaller files or check your connection.');
      } else if (error.response?.status === 413) {
        alert('File too large. Please choose smaller images (max 5MB each).');
      } else if (error.response?.status === 415) {
        alert('Invalid file type. Please upload only image files (PNG, JPG, JPEG, GIF, WebP).');
      } else {
        alert(`Failed to upload images: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'view') {
      onClose()
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.brand || !formData.sku || !formData.category) {
        throw new Error('Please fill in all required fields (Brand, SKU, Category)');
      }

      // Prepare form data for submission (only JSON data, no files)
      const submitData = {
        brand: formData.brand,
        sku: formData.sku,
        category: formData.category,
        inventory: formData.inventory,
        price: formData.price,
        description: formData.description,
        metafields: formData.metafields,
        images: formData.images || [],
        image: formData.image,
      };

      console.log('Submitting product data:', submitData);

      if (mode === 'create') {
        const response = await createProduct(submitData);
        console.log('Product created:', response);
      } else if (mode === 'edit') {
        const response = await updateProduct(product._id, submitData);
        console.log('Product updated:', response);
      }
      onSave()
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'

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
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  disabled={isViewMode || isEditMode}
                  className="brand-select"
                >
                  <option value="">{brandsLoading ? 'Loading brands...' : 'Select Brand'}</option>
                  {!brandsLoading && Array.isArray(brands) && brands.length > 0 && (
                    brands.map((brand, index) => {
                      // Extract first word from brand name (e.g., "casio watch" -> "casio")
                      // Add comprehensive null safety
                      if (!brand) return null
                      if (typeof brand !== 'string') {
                        // Try to convert to string if possible
                        const brandStr = String(brand).trim()
                        if (!brandStr) return null
                        const displayName = brandStr.split(' ')[0]?.trim() || brandStr
                        return (
                          <option key={`brand-${index}`} value={brandStr}>
                            {displayName}
                          </option>
                        )
                      }
                      
                      const brandStr = brand.trim()
                      if (!brandStr) return null
                      
                      // Safe split with optional chaining
                      const displayName = brandStr.split(' ')[0]?.trim() || brandStr
                      
                      return (
                        <option key={brandStr} value={brandStr}>
                          {displayName}
                        </option>
                      )
                    }).filter(Boolean)
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={isViewMode || isEditMode}
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
                <div className="inventory-control">
                  <button
                    type="button"
                    className="inventory-btn decrement-btn"
                    onClick={handleInventoryDecrement}
                    disabled={isViewMode || (formData.inventory || 0) <= 0}
                    aria-label="Decrease inventory"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    name="inventory"
                    value={formData.inventory || 0}
                    onChange={handleInventoryChange}
                    disabled={isViewMode}
                    min="0"
                    className="inventory-input"
                    aria-label="Inventory quantity"
                  />
                  <button
                    type="button"
                    className="inventory-btn increment-btn"
                    onClick={handleInventoryIncrement}
                    disabled={isViewMode}
                    aria-label="Increase inventory"
                  >
                    +
                  </button>
                </div>
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
            <h3>Product Images</h3>
            <div className="image-upload-section">
              {/* URL Input */}
              <div className="form-group">
                <label>Add Image URL</label>
                <div className="url-input-group">
                  <input
                    type="url"
                    value={formData.newImageUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, newImageUrl: e.target.value }))}
                    disabled={isViewMode}
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={isViewMode || !formData.newImageUrl}
                    className="btn-add-url"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label>Upload Images from Computer</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isViewMode}
                  className="file-input"
                />
              </div>

              {/* Image Gallery */}
              {formData.images && formData.images.length > 0 && (
                <div className="image-gallery">
                  <h4>Product Images ({formData.images.length})</h4>
                  <div className="image-grid">
                    {formData.images.slice(0, 20).map((image, index) => (
                      <div key={index} className="image-item">
                        {console.log('Rendering image:', index, image.url)}
                        <img
                          src={image.url.startsWith('http') ? image.url : `http://localhost:5000${image.url}`}
                          alt={image.altText || `Product image ${index + 1}`}
                          loading="lazy"
                          onError={(e) => {
                            console.log('Image failed to load:', image.url, 'Full URL:', image.url.startsWith('http') ? image.url : `http://localhost:5000${image.url}`);
                            e.target.style.display = 'none';
                            // Show a placeholder or error indicator
                            const parent = e.target.parentElement;
                            if (!parent.querySelector('.image-error')) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'image-error';
                              errorDiv.textContent = 'Image not found';
                              errorDiv.style.cssText = `
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                color: #dc3545;
                                font-size: 12px;
                                font-weight: 500;
                                text-align: center;
                              `;
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="remove-image-btn"
                            title="Remove image"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.images.length > 20 && (
                      <div className="image-item more-images">
                        <div className="more-images-overlay">
                          +{formData.images.length - 20} more
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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

