// Import necessary React components
import React, { useState } from "react";
import Sidebar from "./Sidebar";

// Help topics configuration - defines available support categories
const helpTopics = [
  {
    icon: (
      // Bookmark icon for listing products
      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Listing Product",
    description: "Learn how to list your product and manage your inventory effectively."
  },
  {
    icon: (
      // Shopping bag icon for managing orders
      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 7l1.68 9.04A2 2 0 0 0 6.65 18h10.7a2 2 0 0 0 1.97-1.96L21 7" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" strokeWidth="2"/>
      </svg>
    ),
    title: "Managing Orders",
    description: "Manage your orders, track shipments, and handle customer inquiries."
  },
  {
    icon: (
      // Download icon for handling returns
      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 17l4 4 4-4m-4-5v9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="3" width="18" height="10" rx="2" strokeWidth="2" />
      </svg>
    ),
    title: "Handling Returns",
    description: "Handle returns, refunds, and resolve customer disputes."
  },
  {
    icon: (
      // Credit card icon for payments
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect width="20" height="14" x="2" y="5" rx="2" strokeWidth="2"/>
        <path d="M2 10h20" strokeWidth="2"/>
        <path d="M6 17v.01" strokeWidth="2"/>
        <path d="M18 17v.01" strokeWidth="2"/>
      </svg>
    ),
    title: "Payments and Payouts",
    description: "Get assistance with managing payments and payouts effectively."
  }
];

// Main Support component - provides help and support resources
export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
      
      {/* Main support content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page header */}
          <div className="mb-7">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white shadow-sm border"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                  Seller Help &amp; Support
                </h1>
                <p className="text-gray-500 text-sm lg:text-base">
                  Find answers to common questions or contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Help topic cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-10">
            {helpTopics.map((topic, idx) => (
              <div key={idx} className="flex items-start bg-white border border-gray-200 rounded-2xl p-4 lg:p-5 shadow-sm">
                
                {/* Topic icon */}
                <div className="mr-3 lg:mr-4 flex-shrink-0">
                  {topic.icon}
                </div>
                
                {/* Topic content */}
                <div>
                  <h3 className="text-sm lg:text-base font-bold mb-1 text-gray-900">
                    {topic.title}
                  </h3>
                  <div className="text-gray-500 text-xs lg:text-sm">
                    {topic.description}
                  </div>
                </div>
                
              </div>
            ))}
          </div>

          {/* Contact support section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm">
            
            {/* Section header */}
            <h2 className="text-sm lg:text-md font-bold text-blue-700 mb-3 flex items-center">
              {/* Support icon */}
              <svg className="w-5 h-5 mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 10a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path d="M9 10h.01M15 10h.01M7 16h10" />
              </svg>
              Contact Support
            </h2>
            
            {/* Support contact options */}
            <div className="space-y-3">
              
              {/* Live chat option */}
              <div className="flex items-start lg:items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5 lg:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 20v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="4" strokeWidth="2"/>
                </svg>
                <div className="text-sm lg:text-base">
                  <strong className="mr-1">Live Chat:</strong> 
                  Get instant support from our support team.
                </div>
              </div>
              
              {/* Phone support option */}
              <div className="flex items-start lg:items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-yellow-600 flex-shrink-0 mt-0.5 lg:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 16.92v.01M6.16 7.12l-.12-.12a2 2 0 1 1 2.83-2.83l.13.13" strokeWidth="2"/>
                  <path d="M17.657 2.657A9 9 0 1 1 5.636 14.634" strokeWidth="2"/>
                </svg>
                <div className="text-sm lg:text-base">
                  <strong className="mr-1">Phone Support:</strong> 
                  Speak directly with a support specialist.
                </div>
              </div>
              
              {/* Email support option */}
              <div className="flex items-start lg:items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-pink-600 flex-shrink-0 mt-0.5 lg:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l9 6 9-6" />
                  <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                </svg>
                <div className="text-sm lg:text-base">
                  <strong className="mr-1">Email Support:</strong> 
                  <span className="text-blue-700 hover:underline">
                    support@example.com
                  </span>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
