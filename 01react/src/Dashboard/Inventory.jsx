import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import API from '../utils/api';

const LOW_STOCK_THRESHOLD = 5;

export default function Inventory() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | low | out
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products/seller');
      setProducts(res.data.products || res.data.data || []);
    } catch (err) {
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpdateStock = async (productId, newQty) => {
    if (newQty < 0) return;
    setUpdating(productId);
    try {
      await API.patch(`/products/${productId}`, { quantity: newQty, in_stock: newQty > 0 });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQty, in_stock: newQty > 0 } : p));
      showToast('Stock updated successfully');
    } catch {
      showToast('Failed to update stock');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = products.filter(p => {
    const qty = p.quantity ?? p.stock ?? 0;
    if (filter === 'low' && qty > LOW_STOCK_THRESHOLD) return false;
    if (filter === 'out' && qty > 0) return false;
    if (search && !p.product_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const outOfStock = products.filter(p => (p.quantity ?? 0) === 0).length;
  const lowStock = products.filter(p => { const q = p.quantity ?? 0; return q > 0 && q <= LOW_STOCK_THRESHOLD; }).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>
      {sidebarOpen && <div className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0 overflow-x-hidden p-4 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-white shadow-sm border">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold">Inventory</h1>
            <p className="text-gray-500 text-sm mt-1">Manage stock levels for your products</p>
          </div>
          <button onClick={() => navigate('/dashboard/add-product')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black shadow-sm"
            style={{ background: '#FF9800' }}>
            + Add Product
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total Products</div>
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm cursor-pointer" onClick={() => setFilter('out')}>
            <div className="text-sm text-red-600 mb-1">Out of Stock</div>
            <div className="text-2xl font-bold text-red-700">{outOfStock}</div>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-sm cursor-pointer" onClick={() => setFilter('low')}>
            <div className="text-sm text-amber-600 mb-1">Low Stock (≤{LOW_STOCK_THRESHOLD})</div>
            <div className="text-2xl font-bold text-amber-700">{lowStock}</div>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-1">
            {[['all', 'All'], ['low', 'Low Stock'], ['out', 'Out of Stock']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filter === val ? 'text-black' : 'text-gray-500 hover:bg-gray-50'}`}
                style={filter === val ? { background: '#FF9800' } : {}}>
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Update Stock</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading inventory...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No products found</td></tr>
              ) : filtered.map(product => {
                const qty = product.quantity ?? product.stock ?? 0;
                const isOut = qty === 0;
                const isLow = qty > 0 && qty <= LOW_STOCK_THRESHOLD;
                const img = product.images?.[0] || product.image_url;

                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img src={img} alt={product.product_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs">📦</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.product_name}</p>
                          <p className="text-xs text-gray-400">{product.deepest_category_name || product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-lg font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>{qty}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateStock(product.id, qty - 1)}
                          disabled={qty === 0 || updating === product.id}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 disabled:opacity-40 transition"
                        >−</button>
                        <span className="w-10 text-center font-semibold text-gray-900">{qty}</span>
                        <button
                          onClick={() => handleUpdateStock(product.id, qty + 1)}
                          disabled={updating === product.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-black transition"
                          style={{ background: '#FF9800' }}
                        >+</button>
                        <button
                          onClick={() => {
                            const val = prompt(`Set stock for "${product.product_name}":`, qty);
                            if (val !== null && !isNaN(Number(val))) handleUpdateStock(product.id, Number(val));
                          }}
                          className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
                        >Set</button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">
                      ₹{Number(product.price || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
