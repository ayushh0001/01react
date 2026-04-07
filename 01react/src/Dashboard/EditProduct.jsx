import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import API from '../utils/api';
import { getSizeChartForCategory } from '../utils/categoryConfig';

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: ''
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]); // Track images to delete
  const [newImages, setNewImages] = useState([]);
  
  // Size quantities state
  const [sizeQuantities, setSizeQuantities] = useState({});
  const [currentSizeChart, setCurrentSizeChart] = useState(null);

  // Auto-calculate total quantity from size quantities
  useEffect(() => {
    if (currentSizeChart && Object.keys(sizeQuantities).length > 0) {
      const total = Object.values(sizeQuantities).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
      setForm(prev => ({ ...prev, stock: String(total) }));
    }
  }, [sizeQuantities, currentSizeChart]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/products/${productId}`);
      const productData = response.data.product;
      
      setProduct(productData);
      setForm({
        name: productData.product_name || '',
        price: String(productData.price || ''),
        stock: String(productData.quantity || ''),
        description: productData.description || ''
      });
      
      // Handle images - parse if string, use if array
      let images = [];
      if (productData.images) {
        if (typeof productData.images === 'string') {
          try {
            images = JSON.parse(productData.images);
          } catch (e) {
            console.error('Failed to parse images:', e);
          }
        } else if (Array.isArray(productData.images)) {
          images = productData.images;
        }
      }
      
      // Create image objects with IDs for tracking
      const imageObjects = images.map((url, index) => ({
        id: `existing-${index}`,
        url: url,
        isExisting: true
      }));
      
      setExistingImages(imageObjects);
      
      // Load size quantities if available
      if (productData.size_quantities) {
        const sizes = typeof productData.size_quantities === 'string' 
          ? JSON.parse(productData.size_quantities)
          : productData.size_quantities;
        setSizeQuantities(sizes);
      }
      
      // Determine size chart from category
      const categoryName = productData.deepest_category_name || '';
      if (categoryName) {
        const sizeChart = getSizeChartForCategory(categoryName);
        setCurrentSizeChart(sizeChart);
      }
      
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
      navigate('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    setImagesToDelete(prev => [...prev, imageToRemove.url]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.price || !form.stock) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate size quantities if required
    if (currentSizeChart && currentSizeChart.required) {
      const sizesWithQuantity = Object.entries(sizeQuantities).filter(([size, qty]) => qty > 0);
      if (sizesWithQuantity.length === 0) {
        alert(`Please add at least one ${currentSizeChart.label.toLowerCase()} with quantity for this product.`);
        return;
      }
    }

    setSaving(true);
    
    try {
      
      // Step 1: Update product details
      const updatePayload = {
        productName: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.stock),
        inStock: parseInt(form.stock) > 0,
        categoryId: product.category_id,
        deepestCategoryName: product.deepest_category_name || '',
        categoryPath: typeof product.category_path === 'string' 
          ? product.category_path 
          : JSON.stringify(product.category_path || []),
        sizeQuantities: currentSizeChart ? sizeQuantities : {}
      };
      
      await API.put(`/products/${productId}`, updatePayload);

      // Step 2: Delete removed images from database
      if (imagesToDelete.length > 0) {
        
        // Get all product images to find their IDs
        const response = await API.get(`/products/${productId}`);
        const currentProduct = response.data.product;
        let currentImages = [];
        
        if (currentProduct.images) {
          if (typeof currentProduct.images === 'string') {
            try {
              currentImages = JSON.parse(currentProduct.images);
            } catch (e) {
              currentImages = [];
            }
          } else if (Array.isArray(currentProduct.images)) {
            currentImages = currentProduct.images;
          }
        }
        
        // Find image IDs from product_images table
        // Note: We need to query the database to get image IDs
        // For now, we'll skip this step as we need the image ID from the database
      }

      // Step 3: Upload new images
      if (newImages.length > 0) {
        
        const formData = new FormData();
        newImages.forEach((file) => {
          formData.append('images', file);
        });

        await API.post(`/products/${productId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      alert('Product updated successfully!');
      navigate('/dashboard/products');
      
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
          <Sidebar />
        </div>
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading product...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white shadow-sm border"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Edit Product
                </h1>
                <p className="text-gray-600">Update your product details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            
            {/* Product Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                  {currentSizeChart && (
                    <span className="ml-2 text-xs font-normal text-blue-600">(Auto-calculated from sizes)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  readOnly={currentSizeChart !== null}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    currentSizeChart ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Size Chart Selection */}
            {currentSizeChart && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {currentSizeChart.label} & Quantity
                  {currentSizeChart.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Enter quantity for each available size:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentSizeChart.sizes.map((size) => (
                      <div
                        key={size}
                        className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-all"
                      >
                        <label className="font-semibold text-sm w-16 text-gray-700">
                          {size}:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={sizeQuantities[size] || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setSizeQuantities(prev => ({
                              ...prev,
                              [size]: value
                            }));
                          }}
                          placeholder="0"
                          className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="text-xs text-gray-500 w-8">qty</span>
                      </div>
                    ))}
                  </div>
                  {Object.entries(sizeQuantities).filter(([size, qty]) => qty > 0).length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <div className="text-sm text-green-700 font-medium mb-2">
                        ✓ Sizes configured:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(sizeQuantities)
                          .filter(([size, qty]) => qty > 0)
                          .map(([size, qty]) => (
                            <span key={size} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                              {size}: {qty} units
                            </span>
                          ))}
                      </div>
                      <div className="text-xs text-green-600 mt-2 font-semibold">
                        Total: {Object.values(sizeQuantities).reduce((sum, qty) => sum + (qty || 0), 0)} units
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
                rows="4"
              />
            </div>

            {/* Images */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Images
              </label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">Current Images ({existingImages.length}):</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((image, idx) => (
                      <div key={image.id} className="relative">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
                          <img
                            src={image.url}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              console.error('Failed to load image:', image.url);
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">New Images to Upload ({newImages.length}):</p>
                  <div className="flex flex-wrap gap-3">
                    {newImages.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-400 bg-white shadow-sm">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${idx + 1}`}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <label className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg border-2 border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add More Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">You can upload multiple images at once (max 5MB each)</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/products')}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
