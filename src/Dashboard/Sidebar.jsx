import React from 'react';
import { NavLink } from 'react-router-dom';

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard", icon: 
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M20,8h0L14,2.74a3,3,0,0,0-4,0L4,8a3,3,0,0,0-1,2.26V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V10.25A3,3,0,0,0,20,8ZM14,20H10V15a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1Zm5-1a1,1,0,0,1-1,1H16V15a3,3,0,0,0-3-3H11a3,3,0,0,0-3,3v5H6a1,1,0,0,1-1-1V10.25a1,1,0,0,1,.34-.75l6-5.25a1,1,0,0,1,1.32,0l6,5.25a1,1,0,0,1,.34.75Z"/>
    </svg>
  },
  { to: "/dashboard/orders", label: "Orders", icon: <span style={{fontSize: 22}}>📦</span> },
  { to: "/dashboard/products", label: "Products", icon: <span style={{fontSize: 22}}>🗂️</span> },
  { to: "/dashboard/add-product", label: "Add Product", icon: <span style={{fontSize: 22}}>➕</span> },
  { to: "/dashboard/customers", label: "Customers", icon: <span style={{fontSize: 22}}>👥</span> },
  { to: "/dashboard/settings", label: "Settings", icon: <span style={{fontSize: 22}}>⚙️</span> },
  { to: "/dashboard/support", label: "Help and Support", icon: <span style={{fontSize: 22}}>❓</span> },
];

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-60 bg-white border-r px-4 py-6">
      <div className="font-bold text-xl mb-2">ZIPIN Seller Hub</div>
      <div className="text-gray-500 text-sm mb-6">Manage your Business</div>
      <nav>
        <ul className="space-y-2">
          {sidebarLinks.map(link => (
            <li key={link.label}>
              <NavLink
                to={link.to}
                end={link.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded font-bold hover:bg-yellow-100 transition ${
                    isActive ? 'bg-yellow-100 text-black' : ''
                  }`
                }
              >
                {link.icon} {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
