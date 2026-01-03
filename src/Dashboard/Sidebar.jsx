// Import necessary React router components
import React from 'react';
import { NavLink } from 'react-router-dom';

// Sidebar navigation links configuration
const sidebarLinks = [
  { 
    to: "/dashboard", 
    label: "Dashboard", 
    icon: (
      // Home/Dashboard icon SVG
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M20,8h0L14,2.74a3,3,0,0,0-4,0L4,8a3,3,0,0,0-1,2.26V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V10.25A3,3,0,0,0,20,8ZM14,20H10V15a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1Zm5-1a1,1,0,0,1-1,1H16V15a3,3,0,0,0-3-3H11a3,3,0,0,0-3,3v5H6a1,1,0,0,1-1-1V10.25a1,1,0,0,1,.34-.75l6-5.25a1,1,0,0,1,1.32,0l6,5.25a1,1,0,0,1,.34.75Z"/>
      </svg>
    )
  },
  { 
    to: "/dashboard/orders", 
    label: "Orders", 
    icon: <span style={{fontSize: 22}}>📦</span>  // Package emoji for orders
  },
  { 
    to: "/dashboard/products", 
    label: "Products", 
    icon: <span style={{fontSize: 22}}>🗂️</span>  // File folder emoji for products
  },
  { 
    to: "/dashboard/add-product", 
    label: "Add Product", 
    icon: <span style={{fontSize: 22}}>➕</span>  // Plus sign emoji for adding
  },
  { 
    to: "/dashboard/customers", 
    label: "Customers", 
    icon: <span style={{fontSize: 22}}>👥</span>  // People emoji for customers
  },
  { 
    to: "/dashboard/settings", 
    label: "Settings", 
    icon: <span style={{fontSize: 22}}>⚙️</span>  // Gear emoji for settings
  },
  { 
    to: "/dashboard/support", 
    label: "Help and Support", 
    icon: <span style={{fontSize: 22}}>❓</span>  // Question mark emoji for help
  },
];

// Main Sidebar component - provides navigation for dashboard pages
export default function Sidebar() {
  return (
    <aside className="min-h-screen w-60 bg-white border-r px-4 py-6">
      
      {/* Sidebar header with branding */}
      <div className="font-bold text-xl mb-2">
        ZPIN Seller Hub
      </div>
      <div className="text-gray-500 text-sm mb-6">
        Manage your Business
      </div>
      
      {/* Navigation menu */}
      <nav>
        <ul className="space-y-2">
          {sidebarLinks.map(link => (
            <li key={link.label}>
              
              {/* Navigation link with active state styling */}
              <NavLink
                to={link.to}
                end={link.to === '/dashboard'}  // Exact match for dashboard home
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded font-bold hover:bg-yellow-100 transition ${
                    isActive ? 'bg-yellow-100 text-black' : ''  // Active link styling
                  }`
                }
              >
                {/* Link icon and label */}
                {link.icon} {link.label}
              </NavLink>
              
            </li>
          ))}
        </ul>
      </nav>
      
    </aside>
  );
}
