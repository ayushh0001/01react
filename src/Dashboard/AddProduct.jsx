import React, { useState } from "react";
import Sidebar from "./Sidebar";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // IMAGE Upload logic
  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImages(prev =>
      prev.concat(
        files.filter(
          newFile => !prev.some(img => img.name === newFile.name && img.size === newFile.size)
        )
      )
    );
  };

  const handleRemoveImage = idx => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setMessage("Product added successfully!");
    setTimeout(() => setMessage(""), 2000);
    setForm({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
    });
    setImages([]);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 px-0 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 mt-4">Add New Product</h1>
          <p className="mb-8 text-gray-500">Fill in the Details to add your product</p>
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-2xl border border-gray-200">
            {message && (
              <div className="mb-4 text-green-800 bg-green-100 border border-green-300 px-4 py-2 rounded font-medium">
                {message}
              </div>
            )}

            {/* Product Name */}
            <div className="mb-5">
              <label className="block font-bold mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Price & Quantity */}
            <div className="mb-5 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-bold mb-1">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex-1">
                <label className="block font-bold mb-1">Inventory Quantity</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="block font-bold mb-1">Product Category</label>
              <select
                name="category"
                className="w-full border rounded px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                <option>Apparel</option>
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Fitness</option>
                <option>Other</option>
              </select>
            </div>

            {/* Path (Optional) */}
            <div className="mb-5">
              <span className="block font-bold text-gray-600 mb-2">Selected Category Path:</span>
              <span className="block text-gray-800">Apparel / T-Shirts</span>
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block font-bold mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product in detail..."
                className="w-full border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Product Images (MULTI) */}
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
                  {/* Previews */}
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {images.map((file, idx) => (
                      <div key={idx} className="relative inline-block">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-[100px] h-[100px] object-cover rounded-md shadow border"
                        />
                        <button
                          type="button"
                          title="Remove image"
                          onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md hover:bg-red-700"
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg text-lg tracking-wide transition"
            >
              Add Product
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
