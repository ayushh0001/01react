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
    to: "/dashboard/earnings", 
    label: "Earnings", 
    icon: (
      // Money/Dollar icon SVG
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
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
