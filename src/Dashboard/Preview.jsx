// src/Preview.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Preview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

  useEffect(() => {
    fetchLatestProduct();
  }, []);

  const fetchLatestProduct = async () => {
    try {
      // Get draft product from localStorage (not published yet)
      const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
      console.log('Draft product:', draftProduct); // Debug log
      
      if (draftProduct) {
        setProduct({
          id: draftProduct._id,
          name: draftProduct.name,
          price: draftProduct.price,
          category: draftProduct.category,
          subcategory: draftProduct.subcategory,
          description: draftProduct.description || 'No description provided.',
          stock: draftProduct.stock,
          images: draftProduct.images || []
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Store current product data including images for editing
    const editData = {
      ...product,
      images: product.images || []
    };
    localStorage.setItem('editProduct', JSON.stringify(editData));
    navigate('/dashboard/add-product');
  };

  const handlePublish = async () => {
    try {
      const draftProduct = JSON.parse(localStorage.getItem('draftProduct') || 'null');
      
      if (draftProduct) {
        const existingProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        existingProducts.push(draftProduct);
        localStorage.setItem('localProducts', JSON.stringify(existingProducts));
        
        localStorage.removeItem('draftProduct');
        localStorage.removeItem('editProduct');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setShowSuccessPopup(true);
        
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/dashboard/products');
        }, 3000);
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      alert('Error publishing product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
          <Sidebar />
        </div>
        <main className="flex-1 p-4 lg:p-6 flex items-center justify-center">
          <div className="text-lg font-semibold text-gray-600">Loading product...</div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
          <Sidebar />
        </div>
        <main className="flex-1 p-4 lg:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-600 mb-2">No product to preview</div>
            <button 
              onClick={() => navigate('/dashboard/add-product')}
              className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
            >
              Add Product
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
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
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-md p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-gray-100 shadow-sm border"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                    Product Preview
                  </h1>
                  <p className="text-sm text-gray-500">
                    Review the details of your product before publishing.
                  </p>
                </div>
              </div>
            </div>

            {/* Content row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
              {/* Left: main image + thumbnails */}
              <div>
                {/* Main image */}
                <div className="w-full h-48 lg:h-64 rounded-xl lg:rounded-2xl overflow-hidden bg-gray-200 mb-4 cursor-pointer" onClick={() => setShowImageModal(true)}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImageIndex]}
                      alt="Product"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/600x400?text=No+Image"
                      alt="No Image"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2">
                  {product.images && product.images.length > 0 ? (
                    product.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl overflow-hidden cursor-pointer transition-all ${
                          index === selectedImageIndex ? 'border-2 border-yellow-400 scale-105' : 'border-2 border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image}
                          alt={`Thumb ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 text-xl cursor-pointer">
                      +
                    </div>
                  )}
                </div>
              </div>

              {/* Right: details */}
              <div>
                {/* Title + price */}
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl lg:text-2xl font-bold text-[#F59E0B]">
                    ₹{product.price}
                  </span>
                  <span className="text-xs font-semibold text-white bg-green-500 px-2 py-1 rounded-full">
                    In Stock: {product.stock}
                  </span>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    CATEGORY
                  </p>
                  <p className="text-sm text-gray-700">
                    {product.category}{product.subcategory ? ` > ${product.subcategory}` : ''}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    DESCRIPTION
                  </p>
                  <p className="text-sm text-gray-700">
                    {product.description}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center justify-center gap-2 px-4 lg:px-5 py-3 rounded-full bg-yellow-400 text-gray-900 text-sm font-semibold shadow-sm hover:bg-yellow-500"
                  >
                    <span>✏️</span>
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    className="flex items-center justify-center gap-2 px-4 lg:px-5 py-3 rounded-full bg-green-500 text-white text-sm font-semibold shadow-sm hover:bg-green-600"
                  >
                    <span>✅</span>
                    <span>Publish Product</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && product.images && product.images.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowImageModal(false)}>
            <div className="relative max-w-4xl max-h-[90vh] mx-4">
              <img
                src={product.images[selectedImageIndex]}
                alt="Product Full View"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-all"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Product Published!</h3>
              <p className="text-gray-600 mb-6">Your product has been successfully published and is now live in your store.</p>
              <div className="w-full bg-green-500 h-1 rounded-full">
                <div className="bg-green-600 h-1 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
