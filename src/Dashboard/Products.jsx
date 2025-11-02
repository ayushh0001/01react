import React, { useState } from "react";
import Sidebar from "./Sidebar";

const initialProducts = [
  { id: "P1001", name: "Basic T-Shirt", category: "Apparel", price: 299, stock: 120, status: "Active", date: "2025-07-03" },
  { id: "P1002", name: "Wireless Mouse", category: "Electronics", price: 899, stock: 45, status: "Active", date: "2025-05-16" },
  { id: "P1003", name: "Travel Mug", category: "Accessories", price: 499, stock: 200, status: "Active", date: "2025-07-01" },
  { id: "P1004", name: "Yoga Mat", category: "Fitness", price: 1200, stock: 0, status: "Out of Stock", date: "2025-04-23" },
  { id: "P1005", name: "Bottle", category: "Accessories", price: 150, stock: 0, status: "Out of Stock", date: "2025-06-20" },
];

const statusStyles = {
  "Active": "bg-green-100 text-green-700",
  "Out of Stock": "bg-red-100 text-red-700"
};

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const handleToggleStatus = (id) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: p.status === "Active" ? "Out of Stock" : "Active",
              stock: p.status === "Active" ? 0 : 100,
            }
          : p
      )
    );
  };

  const openDeleteModal = product => {
    setToDelete(product);
    setShowModal(true);
  };

  const confirmDelete = () => {
    setProducts(products.filter(p => p.id !== toDelete.id));
    setShowModal(false);
    setToDelete(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-gray-500">Manage, add, or edit your product listings</p>
          </div>
          <button className="px-6 py-2 font-semibold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg shadow">
            + Add Product
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="min-w-full text-left">
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
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusStyles[p.status]}`}>
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
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 text-xs">
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
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={9}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal */}
       {showModal && toDelete && (
  <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/10 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl shadow-xl min-w-[320px]">
      <h2 className="font-bold text-lg mb-3">Confirm Deletion</h2>
      <p className="mb-6">
        Do you want to delete <span className="font-semibold text-red-700">{toDelete.name}</span>?
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 font-medium"
        >
          Cancel
        </button>
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

      </main>
    </div>
  );
}
