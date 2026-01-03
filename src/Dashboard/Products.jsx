// Import necessary React hooks and components
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Status styling configuration - defines colors for different product statuses
const statusStyles = {
  "Active": "bg-green-100 text-green-700",        // Green for active products
  "Out of Stock": "bg-red-100 text-red-700"      // Red for out of stock products
};

// Main Products component - manages product inventory display and actions
export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUndoPopup, setShowUndoPopup] = useState(false);
  const [undoTimer, setUndoTimer] = useState(null);
  const [deletedProduct, setDeletedProduct] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Get locally stored products first
      const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      
      // Try to fetch from API (will fail due to CORS)
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/products`, { headers });
      const apiProducts = response.data.data || [];
      
      const transformedApiProducts = apiProducts.map(product => ({
        id: product._id,
        name: product.name || 'N/A',
        category: product.category || 'Uncategorized',
        price: product.price || 0,
        stock: product.stock || 0,
        status: product.stock > 0 ? 'Active' : 'Out of Stock',
        date: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'
      }));
      
      // Combine local and API products
      setProducts([...localProducts, ...transformedApiProducts]);
    } catch (error) {
      console.error('API Error, using local products only:', error);
      // Use only local products if API fails
      const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const transformedLocalProducts = localProducts.map(product => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status,
        date: new Date(product.createdAt).toLocaleDateString()
      }));
      setProducts(transformedLocalProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      const newStock = product.status === 'Active' ? 0 : 100;
      const newStatus = product.status === 'Active' ? 'Out of Stock' : 'Active';
      
      // Update localStorage for local products
      const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const updatedLocalProducts = localProducts.map(p => 
        p._id === id ? { ...p, stock: newStock, status: newStatus } : p
      );
      localStorage.setItem('localProducts', JSON.stringify(updatedLocalProducts));
      
      // Update UI immediately
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, status: newStatus, stock: newStock }
            : p
        )
      );
      
      // Try API update (will likely fail due to CORS)
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.put(`${API_BASE_URL}/products/${id}`, { stock: newStock }, { headers });
      } catch (apiError) {
        console.log('API update failed, but local update succeeded');
      }
      
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const openDeleteModal = (product) => {
    setToDelete(product);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    const productToDelete = toDelete;
    setShowModal(false);
    setToDelete(null);
    
    // Remove from UI immediately
    setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    setDeletedProduct(productToDelete);
    setShowUndoPopup(true);
    
    // Set 4-second timer for permanent deletion
    const timer = setTimeout(async () => {
      await permanentlyDeleteProduct(productToDelete);
      setShowUndoPopup(false);
      setDeletedProduct(null);
    }, 4000);
    
    setUndoTimer(timer);
  };

  const permanentlyDeleteProduct = async (product) => {
    try {
      // Delete from localStorage
      const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const updatedLocalProducts = localProducts.filter(p => p._id !== product.id);
      localStorage.setItem('localProducts', JSON.stringify(updatedLocalProducts));
      
      // Try API delete
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.delete(`${API_BASE_URL}/products/${product.id}`, { headers });
      } catch (apiError) {
        console.log('API delete failed, but local delete succeeded');
      }
    } catch (error) {
      console.error('Error permanently deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    // Find the full product details from localStorage
    const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
    const fullProduct = localProducts.find(p => p._id === product.id);
    
    if (fullProduct) {
      // Store product for editing in localStorage
      localStorage.setItem('editProduct', JSON.stringify(fullProduct));
      // Navigate to add-product page for full editing
      navigate('/dashboard/add-product');
    }
  };

  const undoDelete = () => {
    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);
    }
    
    // Restore product to UI
    if (deletedProduct) {
      setProducts(prev => [...prev, deletedProduct]);
    }
    
    setShowUndoPopup(false);
    setDeletedProduct(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main products content */}
      <main className="flex-1 p-8">
        
        {/* Page header with title and add product button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Products
            </h1>
            <p className="text-gray-500">
              Manage, add, or edit your product listings
            </p>
          </div>
          
          {/* Add new product button */}
          <button 
            onClick={() => {
              localStorage.removeItem('editProduct');
              navigate('/dashboard/add-product');
            }}
            className="px-6 py-2 font-semibold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg shadow"
          >
            + Add Product
          </button>
        </div>

        {/* Products table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="min-w-full text-left">
            
            {/* Table header */}
            <thead>
              <tr className="bg-yellow-200">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Added Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-3 text-center" colSpan={9}>Loading products...</td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3">{p.id.slice(-6)}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">₹{p.price}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusStyles[p.status] || 'bg-gray-100 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className={`w-14 h-7 rounded-full relative outline-none transition-colors ${
                          p.status === "Active" ? "bg-yellow-400" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            p.status === "Active" ? "translate-x-7" : ""
                          }`}
                          style={{ transition: "transform 0.2s" }}
                        />
                        <span className="sr-only">Toggle Availability</span>
                      </button>
                    </td>
                    <td className="p-3">{p.date}</td>
                    <td className="p-3 flex gap-2">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-100 text-red-700 font-medium rounded hover:bg-red-200 text-xs"
                        onClick={() => openDeleteModal(p)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-500 text-center" colSpan={9}>No products found.</td>
                </tr>
              )}
            </tbody>
            
          </table>
        </div>

        {/* Delete confirmation modal */}
        {showModal && toDelete && (
          <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/10 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-xl min-w-[320px]">
              
              {/* Modal header */}
              <h2 className="font-bold text-lg mb-3">
                Confirm Deletion
              </h2>
              
              {/* Confirmation message */}
              <p className="mb-6">
                Do you want to delete <span className="font-semibold text-red-700">{toDelete.name}</span>?
              </p>
              
              {/* Modal action buttons */}
              <div className="flex justify-end gap-4">
                
                {/* Cancel button */}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                
                {/* Delete confirmation button */}
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                >
                  Delete
                </button>
                
              </div>
            </div>
          </div>
        )}

        {/* Undo delete popup */}
        {showUndoPopup && deletedProduct && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-[300px]">
              <div className="flex-1">
                <p className="font-medium">
                  Deleted "{deletedProduct.name}"
                </p>
                <p className="text-sm text-gray-300">
                  This action will be permanent in a few seconds
                </p>
              </div>
              <button
                onClick={undoDelete}
                className="px-4 py-2 bg-yellow-400 text-black font-medium rounded hover:bg-yellow-500 transition"
              >
                Undo
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
