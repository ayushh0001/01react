// Import necessary React hooks and components
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Main AddProduct component - handles new product creation
export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    subcategory: "",
    description: "",
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

  useEffect(() => {
    const editProduct = JSON.parse(localStorage.getItem('editProduct') || 'null');
    if (editProduct) {
      setForm({
        name: editProduct.name || "",
        price: editProduct.price || "",
        stock: editProduct.stock || "",
        category: editProduct.category || "",
        subcategory: editProduct.subcategory || "",
        description: editProduct.description || "",
      });
      if (editProduct.images && editProduct.images.length > 0) {
        setExistingImages(editProduct.images);
      }
    }
  }, []);

  // Category and subcategory mapping
  const categoryMap = {
    "Apparel": ["T-Shirts", "Shirts", "Pants", "Dresses", "Jackets"],
    "Electronics": ["Smartphones", "Laptops", "Headphones", "Cameras", "Accessories"],
    "Accessories": ["Bags", "Watches", "Jewelry", "Sunglasses", "Belts"],
    "Fitness": ["Yoga", "Gym Equipment", "Sports Wear", "Supplements", "Outdoor"],
    "Home & Garden": ["Furniture", "Decor", "Kitchen", "Garden Tools", "Lighting"],
    "Books": ["Fiction", "Non-Fiction", "Educational", "Comics", "Magazines"],
    "Sports": ["Football", "Basketball", "Tennis", "Swimming", "Running"],
    "Other": ["Miscellaneous"]
  };

  // Handle form field changes - updates form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'category' && { subcategory: '' })
    }));
  };

  // Handle multiple image upload with duplicate prevention
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

  // Remove specific image from the selection
  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Handle form submission - creates product and stores locally
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.price || !form.stock || !form.category) {
      setMessage("Please fill in all required fields.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    setLoading(true);
    
    try {
      const editProduct = JSON.parse(localStorage.getItem('editProduct') || 'null');
      
      if (editProduct) {
        // Update existing product
        const updatedProduct = {
          ...editProduct,
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          category: form.category,
          subcategory: form.subcategory,
          description: form.description,
          images: [...existingImages, ...images.map(img => URL.createObjectURL(img))],
          status: parseInt(form.stock) > 0 ? 'Active' : 'Out of Stock'
        };
        
        // Update in localStorage
        const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        const updatedLocalProducts = localProducts.map(p => 
          p._id === editProduct._id ? updatedProduct : p
        );
        localStorage.setItem('localProducts', JSON.stringify(updatedLocalProducts));
        
        setMessage("Product updated successfully! Redirecting to preview...");
      } else {
        // Create new product
        const draftProduct = {
          _id: Date.now().toString(),
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          category: form.category,
          subcategory: form.subcategory,
          description: form.description,
          images: [...existingImages, ...images.map(img => URL.createObjectURL(img))],
          createdAt: new Date().toISOString(),
          status: parseInt(form.stock) > 0 ? 'Active' : 'Out of Stock'
        };
        
        localStorage.setItem('draftProduct', JSON.stringify(draftProduct));
        
        setMessage("Product created! Redirecting to preview...");
      }
      
      // Reset form and images before navigation
      setForm({
        name: "",
        price: "",
        stock: "",
        category: "",
        subcategory: "",
        description: "",
      });
      setImages([]);
      setExistingImages([]);
      localStorage.removeItem('editProduct');
      
      // Navigate to preview page
      navigate('/dashboard/preview');
      
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage("Error adding product. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 px-0 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page header */}
          <h1 className="text-2xl md:text-3xl font-bold mb-1 mt-4">
            Add New Product
          </h1>
          <p className="mb-8 text-gray-500">
            Fill in the Details to add your product
          </p>
          
          {/* Product creation form */}
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-2xl border border-gray-200">
            
            {/* Success/Error message display */}
            {message && (
              <div className={`mb-4 px-4 py-2 rounded font-medium ${
                message.includes('Error') 
                  ? 'text-red-800 bg-red-100 border border-red-300'
                  : 'text-green-800 bg-green-100 border border-green-300'
              }`}>
                {message}
              </div>
            )}

            {/* Product name field */}
            <div className="mb-5">
              <label className="block font-bold mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Price and quantity fields - responsive layout */}
            <div className="mb-5 flex flex-col md:flex-row gap-4">
              
              {/* Price field - numeric input with minimum value */}
              <div className="flex-1">
                <label className="block font-bold mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              
              {/* Stock quantity field - numeric input with minimum value */}
              <div className="flex-1">
                <label className="block font-bold mb-1">
                  Inventory Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  required
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              
            </div>

            {/* Category selection dropdown */}
            <div className="mb-5">
              <label className="block font-bold mb-1">
                Product Category *
              </label>
              <select
                name="category"
                required
                className="w-full border rounded px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {Object.keys(categoryMap).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Subcategory selection dropdown */}
            {form.category && (
              <div className="mb-5">
                <label className="block font-bold mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  className="w-full border rounded px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={form.subcategory}
                  onChange={handleChange}
                >
                  <option value="">Select a subcategory</option>
                  {categoryMap[form.category].map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic category path display */}
            {form.category && (
              <div className="mb-5">
                <span className="block font-bold text-gray-600 mb-2">
                  Category Path:
                </span>
                <span className="block text-gray-800 bg-yellow-50 px-3 py-2 rounded border">
                  {form.category}{form.subcategory ? ` > ${form.subcategory}` : ''}
                </span>
              </div>
            )}

            {/* Product description field - textarea for longer text */}
            <div className="mb-5">
              <label className="block font-bold mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product in detail..."
                className="w-full border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Multiple image upload section */}
            <div className="mb-8">
              <label className="block font-bold mb-1">
                Product Images
              </label>
              
              {/* File upload area with drag-and-drop styling */}
              <label htmlFor="multi-image-upload" className="block cursor-pointer w-full">
                <div className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
                  
                  {/* Upload icon */}
                  <div className="text-2xl mb-2">
                    <span role="img" aria-label="folder">📁</span>
                  </div>
                  
                  {/* Upload instruction text */}
                  <div className="text-base md:text-lg font-bold text-gray-700 mb-2">
                    Click to upload images
                  </div>
                  
                  {/* Hidden file input - accepts multiple images */}
                  <input
                    multiple
                    id="multi-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  
                  {/* Image previews grid */}
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {/* Existing images */}
                    {existingImages.map((imageUrl, idx) => (
                      <div key={`existing-${idx}`} className="relative inline-block">
                        <img
                          src={imageUrl}
                          alt="existing preview"
                          className="w-[100px] h-[100px] object-cover rounded-md shadow border"
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
                    {/* New images */}
                    {images.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative inline-block">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-[100px] h-[100px] object-cover rounded-md shadow border"
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-bold rounded-lg text-lg tracking-wide transition ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-400 hover:bg-yellow-500 text-black'
              }`}
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
            
          </form>
        </div>
      </main>
    </div>
  );
}