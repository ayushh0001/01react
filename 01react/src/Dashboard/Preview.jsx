import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Preview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestProduct();
  }, []);

  const fetchLatestProduct = async () => {
    try {
      // Get draft product from localStorage (not published yet)
      const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
      
      if (draftProduct) {
        // Create preview URLs from base64 data OR existing MinIO URLs
        let imageUrls = [];
        
        // Priority 1: Use existing images (MinIO URLs) if available
        if (draftProduct.existingImages && draftProduct.existingImages.length > 0) {
          imageUrls = draftProduct.existingImages;
        }
        // Priority 2: Use base64 imageData if available
        else if (draftProduct.imageData && draftProduct.imageData.length > 0) {
          imageUrls = draftProduct.imageData.map(img => img.dataUrl);
        }

        setProduct({
          name: draftProduct.name,
          price: draftProduct.price,
          stock: draftProduct.stock,
          description: draftProduct.description || 'No description provided.',
          categoryId: draftProduct.categoryId,
          deepestCategoryName: draftProduct.deepestCategoryName,
          categoryPath: draftProduct.categoryPath,
          categoryPathLabel: draftProduct.categoryPathLabel,
          images: imageUrls,
          imageData: draftProduct.imageData, // Keep for publishing
          existingImages: draftProduct.existingImages || [],
          sizeQuantities: draftProduct.sizeQuantities || {}
        });
      } else {
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Go back to AddProduct page - draft is already in localStorage
    navigate('/dashboard/add-product');
  };

  const handlePublish = async () => {
    if (publishing) return;
    
    setPublishing(true);
    
    try {
      const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
      
      if (!draftProduct) {
        alert('No product data found. Please go back and fill the form.');
        navigate('/dashboard/add-product');
        return;
      }

      const isEdit = draftProduct.isEdit && draftProduct._id;

      if (isEdit) {
        // ── UPDATE EXISTING PRODUCT ──

        const payload = {
          productName: draftProduct.name,
          description: draftProduct.description || '',
          categoryId: draftProduct.categoryId,
          deepestCategoryName: draftProduct.deepestCategoryName,
          categoryPath: draftProduct.categoryPath,
          price: parseFloat(draftProduct.price),
          quantity: parseInt(draftProduct.stock),
          inStock: parseInt(draftProduct.stock) > 0,
          sizeQuantities: draftProduct.sizeQuantities || {}
        };

        await API.put(`/products/${draftProduct._id}`, payload);

      } else {
        // ── CREATE NEW PRODUCT ──

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append("productName", draftProduct.name);
        formData.append("description", draftProduct.description || '');
        formData.append("categoryId", draftProduct.categoryId);
        formData.append("deepestCategoryName", draftProduct.deepestCategoryName);
        formData.append("categoryPath", draftProduct.categoryPath);
        formData.append("price", parseFloat(draftProduct.price));
        formData.append("quantity", parseInt(draftProduct.stock));
        formData.append("sizeQuantities", JSON.stringify(draftProduct.sizeQuantities || {}));

        // Convert base64 images back to File objects
        if (draftProduct.imageData && draftProduct.imageData.length > 0) {
          
          for (let i = 0; i < draftProduct.imageData.length; i++) {
            const imgData = draftProduct.imageData[i];
            try {
              
              // Convert base64 to Blob
              const response = await fetch(imgData.dataUrl);
              const blob = await response.blob();
              
              // Create File from Blob with correct type
              const file = new File([blob], imgData.name, { 
                type: imgData.type || blob.type || 'image/jpeg'
              });
              
              formData.append("images", file);
            } catch (err) {
              console.error('[Preview] Failed to convert image:', imgData.name, err);
            }
          }
        } else {
          console.warn('[Preview] No imageData found in draft product!');
        }

        // Log FormData contents
        for (let pair of formData.entries()) {
          if (pair[1] instanceof File) {
          } else {
          }
        }

        // POST to create product - Let browser set Content-Type with boundary
        const response = await API.post('/products/addProduct', formData, {
          headers: {
            'Content-Type': undefined // Let browser set multipart/form-data with boundary
          }
        });
      }

      // Clear draft from localStorage
      localStorage.removeItem('draftProduct');
      localStorage.removeItem('editProduct');
      
      // Clear any session storage related to images
      sessionStorage.removeItem('draftImageMetadata');
      sessionStorage.removeItem('draftImagePreviews');

      // Show success popup
      setShowSuccessPopup(true);

      // Redirect to products page after 2 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/dashboard/products');
      }, 2000);

    } catch (error) {
      console.error('[Preview] Error publishing product:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Error publishing product';
      alert(`Error: ${errorMessage}`);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
          <Sidebar />
        </div>
        <main className="flex-1 p-4 lg:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading product preview...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
          <Sidebar />
        </div>
        <main className="flex-1 p-4 lg:p-6 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-200 max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">No Product to Preview</h3>
            <p className="text-gray-600 mb-6">Please add a product first to see the preview.</p>
            <button 
              onClick={() => navigate('/dashboard/add-product')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Add Product
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white shadow-sm border border-amber-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Product Preview
                </h1>
                <p className="text-sm lg:text-base text-gray-600">
                  Review your product details before publishing to your store
                </p>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border-2 border-amber-200 overflow-hidden">
            
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              
              {/* Left: Image Gallery */}
              <div className="bg-gray-50 p-6 lg:p-8">
                {/* Main Image - Always white background */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md mb-4 bg-white border-2 border-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center p-6 bg-white">
                      <img
                        src={product.images[selectedImageIndex]}
                        alt="Product"
                        className="max-w-full max-h-full w-auto h-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => setShowImageModal(true)}
                        onError={(e) => {
                          console.error('Image failed to load:', product.images[selectedImageIndex]);
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-white"><div class="text-center text-gray-400"><svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm font-medium">Image Error</p></div></div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium">No Image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {product.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 bg-white border-2 ${
                          index === selectedImageIndex 
                            ? 'border-blue-500 ring-2 ring-blue-300 scale-105 shadow-lg' 
                            : 'border-gray-200 hover:border-blue-300 hover:scale-105 shadow-sm'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <div className="w-full h-full flex items-center justify-center p-2 bg-white">
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                            onError={(e) => {
                              console.error('Thumbnail failed to load:', image);
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-white text-gray-400 text-xs font-medium">Error</div>';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Details */}
              <div className="p-6 lg:p-8 flex flex-col">
                
                {/* Product Name */}
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h2>

                {/* Price & Stock Badge */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 mb-1">PRICE</p>
                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs font-semibold text-gray-500 mb-2">STOCK</p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-md">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {product.stock} Units
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Category
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    <span className="text-sm font-semibold text-blue-900">
                      {product.categoryPathLabel || product.deepestCategoryName}
                    </span>
                  </div>
                </div>

                {/* Size Quantities */}
                {product.sizeQuantities && Object.keys(product.sizeQuantities).length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                      Available Sizes & Stock
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(product.sizeQuantities)
                          .filter(([size, qty]) => qty > 0)
                          .map(([size, qty]) => (
                            <div key={size} className="flex items-center justify-between bg-white border border-green-300 rounded-lg px-3 py-2">
                              <span className="font-semibold text-sm text-gray-700">{size}</span>
                              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                                {qty} units
                              </span>
                            </div>
                          ))}
                      </div>
                      <div className="mt-3 text-xs text-green-700 font-medium">
                        Total: {Object.values(product.sizeQuantities).reduce((sum, qty) => sum + (qty || 0), 0)} units across {Object.entries(product.sizeQuantities).filter(([_, qty]) => qty > 0).length} sizes
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-8 flex-1">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {product.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mt-auto">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold shadow-lg transition-all duration-200 ${
                      publishing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
                    } text-white`}
                  >
                    {publishing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Publish Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && product.images && product.images.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setShowImageModal(false)}>
            <div className="relative max-w-5xl w-full">
              <div className="bg-white rounded-xl p-4 shadow-2xl">
                <img
                  src={product.images[selectedImageIndex]}
                  alt="Product Full View"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-4 -right-4 bg-white hover:bg-gray-100 text-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg transition-all"
              >
                ×
              </button>
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1);
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg transition-all"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg transition-all"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 lg:p-10 max-w-md mx-4 text-center shadow-2xl transform animate-scaleIn">
              
              {/* Success Icon */}
              <div className="relative mx-auto mb-6">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                🎉 Product Published!
              </h3>
              <p className="text-base lg:text-lg text-gray-600 mb-6 leading-relaxed">
                Your product has been successfully published and is now live in your store.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full animate-progressBar"></div>
              </div>

              {/* Redirect Message */}
              <p className="text-sm text-gray-500">
                Redirecting to products page...
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-progressBar {
          animation: progressBar 2s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
