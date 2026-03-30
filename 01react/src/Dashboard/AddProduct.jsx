// Import necessary React hooks and components
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from '../utils/api'; // shared axios instance — auth interceptor + withCredentials
import { useNavigate, useLocation } from 'react-router-dom';
import { getSizeChartForCategory, categoryNeedsSize } from '../utils/categoryConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Level labels: first dropdown is "Category", then "Subcategory", then
// "Sub-subcategory", then "Level 4", "Level 5" … for unlimited depth.
// ─────────────────────────────────────────────────────────────────────────────
const getLevelLabel = (index) => {
  const labels = ['Product Category', 'Subcategory', 'Sub-subcategory'];
  return labels[index] ?? `Level ${index + 1} Category`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main AddProduct component
// ─────────────────────────────────────────────────────────────────────────────
export default function AddProduct() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Size chart state
  const [sizeQuantities, setSizeQuantities] = useState({});
  const [currentSizeChart, setCurrentSizeChart] = useState(null);

  // Auto-calculate total quantity from size quantities
  useEffect(() => {
    if (currentSizeChart && Object.keys(sizeQuantities).length > 0) {
      const total = Object.values(sizeQuantities).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
      setForm(prev => ({ ...prev, stock: String(total) }));
    }
  }, [sizeQuantities, currentSizeChart]);

  // ── Dynamic Category State ─────────────────────────────────────────────────
  // categoryLevels is an array of levels. Each level:
  //   { options: [{ _id, name, hasChildren }], selected: { id, name, hasChildren } | null }
  //
  // Example with 3 levels selected:
  //   [
  //     { options: [Fashion, Electronics, …], selected: { id:'...', name:'Fashion', hasChildren:true } },
  //     { options: [Men, Women, …],           selected: { id:'...', name:'Men',     hasChildren:true } },
  //     { options: [T-Shirts, Shirts, …],     selected: { id:'...', name:'T-Shirts',hasChildren:false} },
  //   ]
  const [categoryLevels, setCategoryLevels] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [catLoadMsg, setCatLoadMsg] = useState(''); // shows friendly message during cold-start

  // ── Pre-fill form when editing or returning from preview ────────────────────
  useEffect(() => {
    // Clear old draft data on mount if user is not authenticated or it's stale
    const clearStaleData = () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        // User not logged in, clear all draft data
        localStorage.removeItem('draftProduct');
        localStorage.removeItem('editProduct');
        sessionStorage.removeItem('draftImageMetadata');
        sessionStorage.removeItem('draftImagePreviews');
        console.log('[AddProduct] Cleared stale draft data (user not authenticated)');
        return true;
      }
      return false;
    };

    if (clearStaleData()) {
      return;
    }

    const restoreCategoryPath = async (categoryPath) => {
      try {
        // Parse category path if it's a string
        const path = typeof categoryPath === 'string' ? JSON.parse(categoryPath) : categoryPath;
        
        if (!Array.isArray(path) || path.length === 0) {
          console.log('[AddProduct] No category path to restore');
          return;
        }

        console.log('[AddProduct] Restoring category path:', path);

        // Fetch root categories first
        const rootRes = await API.get('/categories/root', { timeout: 35000 });
        const rootOptions = Array.isArray(rootRes.data) ? rootRes.data : (rootRes.data?.data ?? []);
        
        if (rootOptions.length === 0) {
          console.error('[AddProduct] No root categories available');
          return;
        }

        // Build the levels array by fetching children at each level
        const levels = [];
        
        for (let i = 0; i < path.length; i++) {
          const categoryId = path[i].id;
          const categoryName = path[i].name;
          
          if (i === 0) {
            // Root level
            const selected = rootOptions.find(opt => opt._id === categoryId || opt.name === categoryName);
            if (selected) {
              levels.push({
                options: rootOptions.map(cat => ({
                  _id: cat._id || cat.id,
                  name: cat.name,
                  hasChildren: cat.hasChildren ?? cat.has_children ?? false
                })),
                selected: {
                  _id: selected._id || selected.id,
                  name: selected.name,
                  hasChildren: selected.hasChildren ?? selected.has_children ?? false
                }
              });
            }
          } else {
            // Child levels - fetch children of previous level
            const parentId = path[i - 1].id;
            try {
              const childRes = await API.get(`/categories/${parentId}/children`, { timeout: 35000 });
              const childOptions = Array.isArray(childRes.data) ? childRes.data : (childRes.data?.data ?? []);
              
              const selected = childOptions.find(opt => opt._id === categoryId || opt.name === categoryName);
              if (selected) {
                levels.push({
                  options: childOptions.map(cat => ({
                    _id: cat._id || cat.id,
                    name: cat.name,
                    hasChildren: cat.hasChildren ?? cat.has_children ?? false
                  })),
                  selected: {
                    _id: selected._id || selected.id,
                    name: selected.name,
                    hasChildren: selected.hasChildren ?? selected.has_children ?? false
                  }
                });
              }
            } catch (err) {
              console.error(`[AddProduct] Failed to fetch children for level ${i}:`, err);
              break;
            }
          }
        }

        // Check if the last selected category has children - if so, fetch them
        if (levels.length > 0) {
          const lastLevel = levels[levels.length - 1];
          if (lastLevel.selected && lastLevel.selected.hasChildren) {
            try {
              const childRes = await API.get(`/categories/${lastLevel.selected._id}/children`, { timeout: 35000 });
              const childOptions = Array.isArray(childRes.data) ? childRes.data : (childRes.data?.data ?? []);
              
              if (childOptions.length > 0) {
                levels.push({
                  options: childOptions.map(cat => ({
                    _id: cat._id || cat.id,
                    name: cat.name,
                    hasChildren: cat.hasChildren ?? cat.has_children ?? false
                  })),
                  selected: null
                });
              }
            } catch (err) {
              console.error('[AddProduct] Failed to fetch final children:', err);
            }
          }
        }

        console.log('[AddProduct] Restored category levels:', levels);
        setCategoryLevels(levels);
        
      } catch (err) {
        console.error('[AddProduct] Error restoring category path:', err);
      }
    };

    // Check for draft product first (coming back from preview)
    const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
    if (draftProduct) {
      console.log('[AddProduct] Restoring draft from preview:', draftProduct);
      setForm({
        name: draftProduct.name || '',
        price: String(draftProduct.price || ''),
        stock: String(draftProduct.stock || ''),
        description: draftProduct.description || '',
      });
      
      // Restore images - keep them as existing images (URLs)
      if (draftProduct.imageData && draftProduct.imageData.length > 0) {
        // Show base64 images as existing images
        const previewUrls = draftProduct.imageData.map(img => img.dataUrl);
        setExistingImages(previewUrls);
      } else if (draftProduct.existingImages && draftProduct.existingImages.length > 0) {
        setExistingImages(draftProduct.existingImages);
      }
      
      // Restore size quantities
      if (draftProduct.sizeQuantities) {
        setSizeQuantities(draftProduct.sizeQuantities);
      }
      
      // Restore category selection
      if (draftProduct.categoryPath) {
        restoreCategoryPath(draftProduct.categoryPath);
      }
      
      return;
    }
    
    // Check for edit product (coming from Products page)
    const editProduct = JSON.parse(localStorage.getItem('editProduct') || 'null');
    if (editProduct) {
      console.log('[AddProduct] Loading product for editing:', editProduct);
      console.log('[AddProduct] Edit product images:', editProduct.images);
      console.log('[AddProduct] Images type:', typeof editProduct.images);
      console.log('[AddProduct] Is array?:', Array.isArray(editProduct.images));
      
      setForm({
        name: editProduct.productName || editProduct.name || '',
        price: String(editProduct.price || ''),
        stock: String(editProduct.quantity ?? editProduct.stock ?? ''),
        description: editProduct.description || '',
      });
      
      // Handle images - they might be a JSON string or an array
      let imagesToSet = [];
      if (editProduct.images) {
        if (typeof editProduct.images === 'string') {
          try {
            imagesToSet = JSON.parse(editProduct.images);
            console.log('[AddProduct] Parsed images from string:', imagesToSet);
          } catch (e) {
            console.error('[AddProduct] Failed to parse images string:', e);
          }
        } else if (Array.isArray(editProduct.images)) {
          imagesToSet = editProduct.images;
        }
      }
      
      if (Array.isArray(imagesToSet) && imagesToSet.length > 0) {
        console.log('[AddProduct] Setting existing images:', imagesToSet);
        console.log('[AddProduct] Number of images:', imagesToSet.length);
        console.log('[AddProduct] First image URL:', imagesToSet[0]);
        setExistingImages(imagesToSet);
      } else {
        console.log('[AddProduct] No images found in edit product');
        console.log('[AddProduct] editProduct.images value:', editProduct.images);
      }
      
      // Restore size quantities for edit
      if (editProduct.sizeQuantities) {
        setSizeQuantities(editProduct.sizeQuantities);
      } else if (editProduct.size_quantities) {
        // Handle snake_case from database
        setSizeQuantities(editProduct.size_quantities);
      }
      
      // Restore category selection for edit
      if (editProduct.categoryPath || editProduct.category_path) {
        restoreCategoryPath(editProduct.categoryPath || editProduct.category_path);
      }
    }
  }, []);

  // ── Separate effect to handle cleanup on page refresh ────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Check if user is authenticated
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        // User not logged in, clear all draft data
        localStorage.removeItem('draftProduct');
        localStorage.removeItem('editProduct');
        sessionStorage.removeItem('draftImageMetadata');
        sessionStorage.removeItem('draftImagePreviews');
        console.log('[AddProduct] Cleared draft data on page unload (user not authenticated)');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // ── Fetch root categories on mount (or on manual retry) ────────────────────
  const fetchRootCategories = async () => {
    setCatLoading(true);
    setCatError('');
    setCatLoadMsg('Loading categories…');
    try {
      console.log('[Categories] Fetching root categories from /categories/root');
      const res = await API.get('/categories/root', { timeout: 35000 });
      console.log('[Categories] Root response:', res.data);

      let options = Array.isArray(res.data) ? res.data : 
                    Array.isArray(res.data?.data) ? res.data.data :
                    Array.isArray(res.data?.categories) ? res.data.categories : [];

      // Normalize: ensure hasChildren field exists
      options = options.map(cat => ({
        _id: cat._id || cat.id,
        name: cat.name,
        hasChildren: cat.hasChildren ?? cat.has_children ?? (cat.children && cat.children.length > 0) ?? true
      }));

      if (options.length === 0) {
        setCatError('No categories returned. Please try again or contact support.');
        setCategoryLevels([]);
        return;
      }

      console.log(`[Categories] Loaded ${options.length} root categories:`, options);
      setCategoryLevels([{ options, selected: null }]);
      setCatLoadMsg('');
    } catch (err) {
      console.error('[Categories] Failed to fetch root categories:', err);
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout');
      setCatError(
        isTimeout
          ? 'Server is waking up (cold start). Please click Retry in a few seconds.'
          : 'Failed to load categories. Check your connection and click Retry.'
      );
      setCatLoadMsg('');
      setCategoryLevels([]);
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch root categories if we don't have a draft or edit product with categories
    const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
    const editProduct = JSON.parse(localStorage.getItem('editProduct') || 'null');
    
    const hasCategoryPath = draftProduct?.categoryPath || editProduct?.categoryPath || editProduct?.category_path;
    
    if (!hasCategoryPath) {
      // No category path to restore, fetch root categories normally
      fetchRootCategories();
    }
  }, []);


  // ── Handle selection at any level ─────────────────────────────────────────
  const handleLevelChange = async (levelIndex, value) => {
    if (!value) {
      // Reset to this level if empty selection
      setCategoryLevels(prev => prev.slice(0, levelIndex + 1).map((l, i) =>
        i === levelIndex ? { ...l, selected: null } : l
      ));
      return;
    }

    const level = categoryLevels[levelIndex];
    const chosen = level.options.find(o => o._id === value) ?? null;

    console.log(`[Categories] Level ${levelIndex} changed to:`, chosen);

    // Slice off everything AFTER this level
    const newLevels = categoryLevels.slice(0, levelIndex + 1).map((l, i) =>
      i === levelIndex ? { ...l, selected: chosen } : l
    );

    // Try to fetch children
    if (chosen) {
      try {
        console.log(`[Categories] Fetching children for "${chosen.name}" (${chosen._id})`);
        const res = await API.get(`/categories/${chosen._id}/children`, { timeout: 35000 });
        console.log('[Categories] Children response:', res.data);

        let children = Array.isArray(res.data) ? res.data :
                       Array.isArray(res.data?.data) ? res.data.data :
                       Array.isArray(res.data?.categories) ? res.data.categories :
                       Array.isArray(res.data?.children) ? res.data.children : [];

        // Normalize children
        children = children.map(cat => ({
          _id: cat._id || cat.id,
          name: cat.name,
          hasChildren: cat.hasChildren ?? cat.has_children ?? (cat.children && cat.children.length > 0) ?? false
        }));

        if (children.length > 0) {
          console.log(`[Categories] Found ${children.length} children:`, children);
          newLevels.push({ options: children, selected: null });
        } else {
          console.log(`[Categories] No children for "${chosen.name}" — leaf node`);
        }
      } catch (err) {
        console.error(`[Categories] Failed to fetch children:`, err);
        if (err.response?.status !== 404) {
          const isTimeout = err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout');
          setMessage(isTimeout
            ? `Server is slow. Try selecting "${chosen.name}" again.`
            : `Error loading subcategories. Please try again.`);
          setTimeout(() => setMessage(''), 4000);
        }
      }
    }

    setCategoryLevels(newLevels);
    
    // Update size chart based on selected category
    // Check the chosen category AND walk up the path to find a size chart
    if (chosen) {
      let sizeChart = getSizeChartForCategory(chosen.name);
      // If no match on leaf, check parent levels
      if (!sizeChart) {
        for (let i = newLevels.length - 1; i >= 0; i--) {
          if (newLevels[i].selected) {
            sizeChart = getSizeChartForCategory(newLevels[i].selected.name);
            if (sizeChart) break;
          }
        }
      }
      setCurrentSizeChart(sizeChart);
      if (sizeChart) {
        setSizeQuantities({});
      }
    }
  };

  // ── Derived helpers for submit ─────────────────────────────────────────────
  // The "deepest" selected category is the last level that has a selection
  const getDeepestSelected = () => {
    for (let i = categoryLevels.length - 1; i >= 0; i--) {
      if (categoryLevels[i].selected) return categoryLevels[i].selected;
    }
    return null;
  };

  // Build the full path array [ { id, name }, … ] → JSON stringified
  const buildCategoryPath = () => {
    const path = categoryLevels
      .filter(l => l.selected)
      .map(l => ({ id: l.selected._id, name: l.selected.name }));
    return JSON.stringify(path);
  };

  // Breadcrumb display string: "Fashion > Men > T-Shirts"
  const categoryPathLabel = categoryLevels
    .filter(l => l.selected)
    .map(l => l.selected.name)
    .join(' > ');

  // Reset all category selections (keeps root options intact)
  const resetCategories = () => {
    setCategoryLevels(prev =>
      prev.length > 0 ? [{ options: prev[0].options, selected: null }] : []
    );
  };

  // ── Form field changes ─────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ── Image handling ─────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev =>
      prev.concat(
        files.filter(
          newFile => !prev.some(img =>
            img.name === newFile.name && img.size === newFile.size
          )
        )
      )
    );
  };

  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const deepest = getDeepestSelected();
    const editProduct = JSON.parse(localStorage.getItem('editProduct') || 'null');

    if (!form.name || !form.price || !form.stock || !deepest) {
      setMessage("Please fill in all required fields including at least one category.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Validate size selection if required
    if (currentSizeChart && currentSizeChart.required) {
      const sizesWithQuantity = Object.entries(sizeQuantities).filter(([size, qty]) => qty > 0);
      if (sizesWithQuantity.length === 0) {
        setMessage(`Please add at least one ${currentSizeChart.label.toLowerCase()} with quantity for this product.`);
        setTimeout(() => setMessage(""), 3000);
        return;
      }
    }

    if (images.length === 0 && existingImages.length === 0) {
      setMessage("Please upload at least one product image.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Check image sizes to prevent localStorage quota exceeded
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB per image
    const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB total
    const totalSize = images.reduce((sum, file) => sum + file.size, 0);
    
    const oversizedImages = images.filter(file => file.size > MAX_IMAGE_SIZE);
    if (oversizedImages.length > 0) {
      setMessage(`Some images are too large (max 2MB each). Please compress: ${oversizedImages.map(f => f.name).join(', ')}`);
      setTimeout(() => setMessage(""), 5000);
      return;
    }
    
    if (totalSize > MAX_TOTAL_SIZE) {
      setMessage(`Total image size (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds 5MB limit. Please use fewer or smaller images.`);
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    // Convert NEW images to base64 for storage (only if there are new images)
    let imageData = [];
    if (images.length > 0) {
      const imageDataPromises = images.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: reader.result
            });
          };
          reader.readAsDataURL(file);
        });
      });
      imageData = await Promise.all(imageDataPromises);
    }

    try {
      // Save draft to localStorage and navigate to Preview page
      const draftProduct = {
        _id: editProduct?._id, // Include product ID if editing
        isEdit: !!editProduct, // Flag to indicate edit mode
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description,
        categoryId: deepest._id,
        deepestCategoryName: deepest.name,
        categoryPath: buildCategoryPath(),
        categoryPathLabel: categoryPathLabel,
        imageData: imageData, // Base64 encoded NEW images
        existingImages: existingImages, // MinIO URLs for existing images
        sizeQuantities: currentSizeChart ? sizeQuantities : {}, // Size-specific quantities
        sizeChartType: currentSizeChart?.type || null // Size chart type for reference
      };

      console.log('[AddProduct] Saving draft product:', draftProduct);
      console.log('[AddProduct] Existing images:', existingImages);
      console.log('[AddProduct] New image data:', imageData);

      localStorage.setItem('draftProduct', JSON.stringify(draftProduct));
      setMessage("Redirecting to preview...");

      setTimeout(() => {
        navigate('/dashboard/preview');
      }, 500);
      
    } catch (error) {
      console.error('[AddProduct] Error saving draft:', error);
      if (error.name === 'QuotaExceededError') {
        setMessage("Images are too large for preview. Please use smaller images (max 2MB each) or fewer images.");
      } else {
        setMessage("Error saving draft. Please try again.");
      }
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white">

      {/* Sidebar navigation */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-8">
        <div className="max-w-4xl mx-auto">

          {/* Page header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-sm border"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">Add New Product</h1>
              <p className="mb-4 lg:mb-8 text-gray-500 text-sm lg:text-base">
                Fill in the details to add your product
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 lg:p-10 rounded-xl border-2 border-yellow-400">

            {/* Success / Error message */}
            {message && (
              <div className={`mb-4 px-4 py-2 rounded font-medium ${message.toLowerCase().includes('error') || message.toLowerCase().includes('please')
                ? 'text-red-800 bg-red-100 border border-red-300'
                : 'text-green-800 bg-green-100 border border-green-300'
                }`}>
                {message}
              </div>
            )}

            {/* Product Name */}
            <div className="mb-5">
              <label className="block font-bold mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Price + Stock */}
            <div className="mb-5 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-bold mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="flex-1">
                <label className="block font-bold mb-1">
                  Inventory Quantity *
                  {currentSizeChart && (
                    <span className="ml-2 text-xs font-normal text-blue-600">(Auto-calculated from sizes)</span>
                  )}
                </label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  required
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  readOnly={currentSizeChart !== null}
                  className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand ${
                    currentSizeChart ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* ── DYNAMIC INFINITE-DEPTH CATEGORY SECTION ── */}

            {/* Error fetching categories — shows Retry button */}
            {catError && (
              <div className="mb-4 px-4 py-3 rounded bg-red-50 border border-red-300 text-red-700 text-sm flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="flex-1">⚠️ {catError}</span>
                <button
                  type="button"
                  onClick={fetchRootCategories}
                  disabled={catLoading}
                  className="shrink-0 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                >
                  {catLoading ? 'Retrying…' : '🔄 Retry'}
                </button>
              </div>
            )}

            {/* Loading spinner while fetching root categories */}
            {catLoading && categoryLevels.length === 0 && (
              <div className="mb-5 flex items-center gap-3 text-yellow-700 bg-orange-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm">
                <svg className="animate-spin h-5 w-5 text-brand shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{catLoadMsg || 'Loading categories… This may take up to 30 seconds if the server is waking up.'}</span>
              </div>
            )}

            {/* Render one dropdown per level — new ones appear automatically */}
            {categoryLevels.map((level, index) => (
              <div key={index} className="mb-5">
                <label className="block font-bold mb-1">
                  {getLevelLabel(index)}
                  {index === 0 && ' *'}
                </label>
                <select
                  required={index === 0}
                  disabled={catLoading && index === 0}
                  value={level.selected?._id ?? ''}
                  onChange={(e) => handleLevelChange(index, e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-100"
                >
                  <option value="">
                    {catLoading && index === 0
                      ? 'Loading categories…'
                      : `Select ${getLevelLabel(index).toLowerCase()}`}
                  </option>
                  {level.options.map(opt => (
                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                  ))}
                </select>
              </div>
            ))}

            {/* Category path breadcrumb */}
            {categoryPathLabel && (
              <div className="mb-5">
                <span className="block font-bold text-gray-600 mb-2">Selected Path:</span>
                <span className="flex items-center gap-1 flex-wrap text-gray-800 bg-orange-50 px-3 py-2 rounded border text-sm">
                  {categoryLevels
                    .filter(l => l.selected)
                    .map((l, i, arr) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded font-medium">
                          {l.selected.name}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="text-gray-400 font-bold">›</span>
                        )}
                      </span>
                    ))}
                </span>
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <label className="block font-bold mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product in detail..."
                className="w-full border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Size Chart Selection */}
            {currentSizeChart && (
              <div className="mb-5">
                <label className="block font-bold mb-2">
                  {currentSizeChart.label} & Quantity
                  {currentSizeChart.required && ' *'}
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Enter quantity for each available size:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentSizeChart.sizes.map((size) => (
                      <div
                        key={size}
                        className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-3 hover:border-yellow-400 transition-all"
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
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                        <span className="text-xs text-gray-500 w-8">qty</span>
                      </div>
                    ))}
                  </div>
                  {Object.entries(sizeQuantities).filter(([size, qty]) => qty > 0).length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <div className="text-sm text-green-700 font-medium mb-1">
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
                      <div className="text-xs text-green-600 mt-1">
                        Total: {Object.values(sizeQuantities).reduce((sum, qty) => sum + (qty || 0), 0)} units
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block font-bold mb-1">Product Images</label>
              <label htmlFor="multi-image-upload" className="block cursor-pointer w-full">
                <div className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
                  <div className="text-2xl mb-2">
                    <span role="img" aria-label="folder">📁</span>
                  </div>
                  <div className="text-base md:text-lg font-bold text-gray-700 mb-2">
                    Click to upload images
                  </div>
                  <input
                    multiple
                    id="multi-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {existingImages.map((imageUrl, idx) => (
                      <div key={`existing-${idx}`} className="relative inline-block">
                        <img
                          src={imageUrl}
                          alt="existing preview"
                          className="w-[100px] h-[100px] object-contain rounded-md shadow border bg-white"
                          onError={(e) => {
                            console.error('Failed to load existing image:', imageUrl);
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <button
                          type="button"
                          title="Remove image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExistingImages(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {images.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative inline-block">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-[100px] h-[100px] object-contain rounded-md shadow border bg-white"
                        />
                        <button
                          type="button"
                          title="Remove image"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold rounded-lg text-lg tracking-wide transition ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand hover:bg-brand text-black'
                }`}
            >
              {loading ? 'Processing...' : 'Preview Product'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}