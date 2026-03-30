// Import necessary React hooks and components
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from '../utils/api'; // shared axios instance — has auth interceptor + withCredentials
import { useNavigate } from 'react-router-dom';

// Status styling configuration - defines colors for different product statuses
const statusStyles = {
  "Active": "bg-green-100 text-green-700",        // Green for active products
  "Out of Stock": "bg-red-100 text-red-700"      // Red for out of stock products
};

// Main Products component - manages product inventory display and actions
export default function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null); // tracks which toggle is in-flight
  const [toggleError, setToggleError] = useState('');  // inline error for toggle failures
  
  // Undo delete functionality
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteTimer, setDeleteTimer] = useState(null);
  const [countdown, setCountdown] = useState(5);
  
  const navigate = useNavigate();

  // All API requests use the shared API instance which:
  //   1. Proxies through Vite (/api → Render backend)
  //   2. Sends cookies automatically via withCredentials: true
  //   3. Attaches Bearer token from localStorage via request interceptor

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Helper: safely extract a plain display string from any category shape ──
  // The API now returns category_display which is pre-processed on the backend
  const safeCategory = (product) => {
    // Use the pre-processed category_display from backend
    if (product.category_display) {
      return product.category_display;
    }
    
    // Fallback: Try categoryPath first (most descriptive breadcrumb)
    let cp = product.categoryPath;
    if (cp) {
      // If it's already an array of objects, join their names
      if (Array.isArray(cp)) {
        return cp.map(c => (typeof c === 'object' ? c.name : c)).join(' > ') || 'Uncategorized';
      }
      // If it's a JSON string, try to parse it
      if (typeof cp === 'string') {
        try {
          const parsed = JSON.parse(cp);
          if (Array.isArray(parsed)) {
            return parsed.map(c => (typeof c === 'object' ? c.name : c)).join(' > ') || 'Uncategorized';
          }
          return String(cp); // valid non-array JSON string
        } catch {
          return String(cp); // plain string like "Fashion"
        }
      }
      // If it's an object with a name key
      if (typeof cp === 'object' && cp.name) return String(cp.name);
    }

    // Fallback: deepestCategoryName
    let dcn = product.deepestCategoryName;
    if (dcn) {
      if (typeof dcn === 'object' && dcn.name) return String(dcn.name);
      return String(dcn);
    }

    return 'Uncategorized';
  };

  const fetchProducts = async () => {
    try {
      // ── GET PRODUCTS FROM BACKEND (GET /api/v1/products) ──
      // API instance sends auth cookie + Bearer token automatically
      const response = await API.get('/products');

      const serverProducts = response.data.products || [];

      // Transform backend products to match what the UI expects.
      // IMPORTANT: Use _id (MongoDB ObjectId) as the primary id — DELETE/PUT/GET :id
      // endpoints all expect _id, NOT the productId display field.
      const transformed = serverProducts.map((product) => ({
        id: product.id || product._id || product.productId,       // id first — used in API URLs
        displayId: product.id || product._id || product.productId, // for the truncated UI column
        name: String(product.product_name || product.productName || product.name || 'N/A'),
        category: safeCategory(product),       // always a safe string now
        categoryId: product.category_id || product.categoryId || '',  // needed for toggle PUT payload
        categoryPath: typeof product.category_path === 'string'
          ? product.category_path
          : (typeof product.categoryPath === 'string' ? product.categoryPath : JSON.stringify(product.category_path || product.categoryPath || [])),
        deepestCategoryName: product.deepest_category_name || product.deepestCategoryName || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.quantity ?? product.stock ?? 0,
        status: (product.in_stock || product.inStock || (product.quantity > 0)) ? 'Active' : 'Out of Stock',
        date: product.created_at ? new Date(product.created_at).toLocaleDateString() : (product.timeStamp ? new Date(product.timeStamp).toLocaleDateString() : 'N/A'),
        originalStock: product.quantity ?? product.stock ?? 0,
        images: product.images || []
      }));

      setProducts(transformed);
    } catch (error) {
      console.error('Error loading products from server:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    if (togglingId === id) return; // prevent double-click
    setTogglingId(id);
    setToggleError('');
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const newStatus = product.status === 'Active' ? 'Out of Stock' : 'Active';
      // When going Out of Stock → quantity 0; when going Active → restore originalStock (min 1)
      const newStock = newStatus === 'Active'
        ? Math.max((product.originalStock || product.stock || 0), 1)
        : 0;

      // Build the PUT payload directly from local product data —
      // no extra GET required, we already have everything from the list fetch.
      const payload = {
        productName: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId || '',
        deepestCategoryName: product.deepestCategoryName || product.category || '',
        categoryPath: product.categoryPath || '[]',
        inStock: newStatus === 'Active',
        quantity: newStock,
      };

      await API.put(`/products/${id}`, payload);

      // Update UI only after backend confirms success
      setProducts(prev =>
        prev.map(p =>
          p.id === id ? {
            ...p,
            status: newStatus,
            stock: newStock,
            originalStock: p.originalStock || p.stock,
          } : p
        )
      );
    } catch (error) {
      console.error('Error updating product status:', error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to update status. Please try again.';
      setToggleError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
      setTimeout(() => setToggleError(''), 5000);
    } finally {
      setTogglingId(null);
    }
  };

  const openDeleteModal = (product) => {
    setToDelete(product);
    setShowConfirmModal(true);
  };

  const confirmDeleteAction = () => {
    const product = toDelete;
    setShowConfirmModal(false);
    setToDelete(null);
    
    // Cancel any existing delete timer
    if (deleteTimer) {
      clearTimeout(deleteTimer);
      clearInterval(deleteTimer);
    }
    
    // Set the product to delete
    setPendingDelete(product);
    setShowUndoToast(true);
    setCountdown(5);
    
    // Start countdown
    let timeLeft = 5;
    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    // Set timer to delete after 5 seconds
    const timer = setTimeout(() => {
      clearInterval(countdownInterval);
      executeDelete(product);
    }, 5000);
    
    setDeleteTimer(timer);
  };

  const handleUndoDelete = () => {
    // Cancel the delete
    if (deleteTimer) {
      clearTimeout(deleteTimer);
    }
    setShowUndoToast(false);
    setPendingDelete(null);
    setCountdown(5);
  };

  const executeDelete = async (productToDelete) => {
    setShowUndoToast(false);
    setPendingDelete(null);

    try {
      await API.delete(`/products/${productToDelete.id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      
      // Show success message briefly
      setToggleError('');
      setTimeout(() => {
        // Could show a success toast here if desired
      }, 1000);
    } catch (error) {
      console.error('Error deleting product:', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Failed to delete product.';
      setToggleError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
      setTimeout(() => setToggleError(''), 5000);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setToDelete(null);
  };

  const handleEdit = (product) => {
    // Navigate to the dedicated edit page
    navigate(`/dashboard/edit-product/${product.id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar navigation */}
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

      {/* Main products content */}
      <main className="flex-1 p-4 lg:p-8">

        {/* Inline toggle error banner */}
        {toggleError && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm font-medium">
            ⚠️ {toggleError}
          </div>
        )}

        {/* Page header with title and add product button */}
        <div className="mb-6 lg:mb-8">
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
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Products
              </h1>
              <p className="text-gray-500 text-sm lg:text-base">
                Manage, add, or edit your product listings
              </p>
            </div>

            {/* Add new product button */}
            <button
              onClick={() => {
                localStorage.removeItem('editProduct');
                navigate('/dashboard/add-product');
              }}
              className="px-4 lg:px-6 py-2.5 font-semibold bg-brand hover:opacity-90 text-gray-900 rounded-lg shadow-md text-sm lg:text-base transition-all duration-200"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 text-center shadow-sm text-amber-700">Loading products...</div>
          ) : products.length > 0 ? (
            products.map((p) => (
              <div key={p.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-amber-900">{p.name}</h3>
                    <p className="text-sm text-amber-700">{p.category}</p>
                    <p className="text-sm text-brand">ID: {p.displayId ? p.displayId.slice(-6) : 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyles[p.status] || 'bg-gray-100 text-gray-700'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-brand">Price:</span>
                    <span className="font-semibold ml-2 text-amber-900">₹{p.price}</span>
                  </div>
                  <div>
                    <span className="text-brand">Stock:</span>
                    <span className="ml-2 text-amber-800">{p.stock}</span>
                  </div>
                  <div>
                    <span className="text-brand">Added:</span>
                    <span className="ml-2 text-amber-800">{p.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-brand mr-2">Available:</span>
                    <button
                      onClick={() => handleToggleStatus(p.id)}
                      disabled={togglingId === p.id}
                      title={togglingId === p.id ? 'Updating...' : (p.status === 'Active' ? 'Mark Out of Stock' : 'Mark Active')}
                      className={`w-12 h-6 rounded-full relative outline-none transition-colors
                        ${p.status === 'Active' ? 'bg-brand' : 'bg-gray-300'}
                        ${togglingId === p.id ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                          ${p.status === 'Active' ? 'translate-x-6' : ''}`}
                        style={{ transition: 'transform 0.2s' }}
                      />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 font-medium rounded hover:from-amber-200 hover:to-yellow-200 text-sm border border-amber-200"
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-red-100 to-red-200 text-red-700 font-medium rounded hover:from-red-200 hover:to-red-300 text-sm border border-red-200"
                    onClick={() => openDeleteModal(p)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 text-center text-amber-700 shadow-sm">No products found.</div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-lg">
          <table className="min-w-full text-left">

            {/* Table header */}
            <thead>
              <tr className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
                <th className="p-4 text-amber-900 font-semibold text-sm">ID</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Name</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Category</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Price</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Stock</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Status</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Availability</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Added Date</th>
                <th className="p-4 text-amber-900 font-semibold text-sm">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={9}>Loading products...</td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p, index) => (
                  <tr key={p.id} className={`border-b border-amber-50 hover:bg-amber-50/60 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}`}>
                    <td className="p-4 text-gray-600 font-mono text-sm">{p.displayId ? p.displayId.slice(-6) : 'N/A'}</td>
                    <td className="p-4 font-medium text-gray-900">{p.name}</td>
                    <td className="p-4 text-gray-600">{p.category}</td>
                    <td className="p-4 font-semibold text-gray-900">₹{p.price.toLocaleString()}</td>
                    <td className="p-4 text-gray-600">{p.stock}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyles[p.status] || 'bg-gray-100 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        disabled={togglingId === p.id}
                        title={togglingId === p.id ? 'Updating...' : (p.status === 'Active' ? 'Mark Out of Stock' : 'Mark Active')}
                        className={`w-14 h-7 rounded-full relative outline-none transition-colors
                          ${p.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}
                          ${togglingId === p.id ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                      >
                        {togglingId === p.id ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3 h-3 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          </span>
                        ) : (
                          <span
                            className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform
                              ${p.status === 'Active' ? 'translate-x-7' : ''}`}
                            style={{ transition: 'transform 0.2s' }}
                          />
                        )}
                        <span className="sr-only">Toggle Availability</span>
                      </button>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{p.date}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="px-4 py-2 bg-brand hover:opacity-90 text-gray-900 font-medium rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                          onClick={() => openDeleteModal(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-8 text-gray-500 text-center" colSpan={9}>No products found.</td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Undo Delete Toast */}
        {showUndoToast && pendingDelete && (
          <div className="fixed bottom-6 right-6 z-50 animate-slideIn">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-brand rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md">
              
              {/* Toast content */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                
                {/* Message */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 text-amber-900">Deleting Product</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    <span className="font-semibold">{pendingDelete.name}</span> will be deleted in {countdown} second{countdown !== 1 ? 's' : ''}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 h-1.5 transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdown / 5) * 100}%` }}
                    />
                  </div>
                  
                  {/* Undo button */}
                  <button
                    onClick={handleUndoDelete}
                    className="w-full px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 font-bold rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all duration-200 shadow-md border border-brand"
                  >
                    ↶ Undo Delete
                  </button>
                </div>
                
                {/* Close button */}
                <button
                  onClick={handleUndoDelete}
                  className="flex-shrink-0 w-6 h-6 text-amber-700 hover:text-amber-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showConfirmModal && toDelete && (
          <>
            {/* Backdrop with blur and freeze */}
            <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/30" style={{ pointerEvents: 'auto' }} />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-brand p-6 rounded-xl shadow-2xl min-w-[320px] max-w-md pointer-events-auto animate-modalFadeIn">

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                {/* Modal header */}
                <h2 className="font-bold text-xl mb-3 text-center text-amber-900">
                  Confirm Deletion
                </h2>

                {/* Confirmation message */}
                <p className="mb-6 text-center text-amber-800">
                  Are you sure you want to delete <span className="font-semibold text-amber-900">"{toDelete.name}"</span>?
                </p>

                {/* Modal action buttons */}
                <div className="flex gap-3">

                  {/* Cancel button */}
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 bg-white border-2 border-brand text-amber-900 rounded-lg hover:bg-orange-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>

                  {/* Delete confirmation button */}
                  <button
                    onClick={confirmDeleteAction}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-lg hover:from-amber-500 hover:to-yellow-500 font-semibold shadow-md border border-brand transition-all"
                  >
                    Yes, Delete
                  </button>

                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}


// Add animation styles
const styles = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes modalFadeIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
  
  .animate-modalFadeIn {
    animation: modalFadeIn 0.2s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
