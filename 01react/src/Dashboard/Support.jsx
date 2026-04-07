// Import necessary React components
import React, { useState } from "react";
import Sidebar from "./Sidebar";

const helpTopics = [
  {
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Listing Product",
    description: "Learn how to list your product and manage your inventory effectively."
  },
  {
    icon: (
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
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect width="20" height="14" x="2" y="5" rx="2" strokeWidth="2"/>
        <path d="M2 10h20" strokeWidth="2"/>
      </svg>
    ),
    title: "Payments and Payouts",
    description: "Get assistance with managing payments and payouts effectively."
  }
];

const PRIVACY_SECTIONS = [
  { title: '1. Who We Are', body: 'ZPIN operates a multi-sided e-commerce platform connecting sellers with customers. For privacy-related queries, contact us at vendor-privacy@zpin.com.' },
  { title: '2. Information We Collect', items: ['Account & Identity: Full name, email, mobile number, password (bcrypt-hashed), username.', 'Business Details: Business name, GST number, business PAN, business address, verification status.', 'Bank & Financial: Bank name, account number, IFSC code — used exclusively for payouts, stored encrypted.', 'Product & Inventory: Product listings, images, prices, stock status, category selections.', 'Order & Transaction: Order IDs, customer delivery address (fulfillment only), payment status, earnings.', 'Session & Technical: Login timestamps, JWT tokens, IP address, browser/device type, HTTP logs.'] },
  { title: '3. How We Use Your Information', items: ['Verify seller identity and conduct KYC checks as required by law.', 'Enable product listing, order routing, and inventory management.', 'Process payouts to verified bank accounts and generate earnings reports.', 'Send order notifications, payout confirmations, and platform updates.', 'Monitor for fraud, enforce seller terms, and comply with legal requirements.'] },
  { title: '4. Sharing Your Information', items: ['With Customers: Business name and product info only. Personal contact details are never shared.', 'With Delivery Partners: Pickup address and order details for fulfillment.', 'With ZPIN Admins: For platform management, compliance, and dispute resolution.', 'For Legal Compliance: Tax authorities, law enforcement, or courts when required by law.'] },
  { title: '5. Data Retention', items: ['Account & profile data: Retained while active and for 3 years after closure.', 'Business & KYC documents: 7 years (PMLA and GST regulations).', 'Order, transaction & earnings records: 7 years for tax compliance.', 'Session and log data: 90 days.'] },
  { title: '6. Your Rights', body: 'Under the Digital Personal Data Protection Act 2023, you have the right to access, correct, erase, and port your data, withdraw consent for marketing, and lodge a grievance. Contact vendor-privacy@zpin.com — we respond within 30 days.' },
];

const TERMS_SECTIONS = [
  { title: '1. Eligibility', items: ['You must be at least 18 years of age to register as a seller.', 'You must provide accurate and complete information during registration.', 'ZPIN reserves the right to reject or suspend any seller account at its discretion.'] },
  { title: '2. Product Listings', items: ['All products must comply with applicable Indian laws and ZPIN\'s product policies.', 'Products are subject to admin approval before being listed on the customer-facing platform.', 'You must provide accurate product descriptions, images, pricing, and stock information.', 'ZPIN reserves the right to remove any listing that violates these Terms without prior notice.'] },
  { title: '3. Pricing and Fees', items: ['You set your own product prices. ZPIN deducts a platform commission from each sale.', 'The current platform fee percentage is displayed in your Earnings dashboard.', 'ZPIN reserves the right to modify commission rates with 30 days\' notice.'] },
  { title: '4. Orders and Fulfillment', items: ['You are responsible for fulfilling orders accurately and on time.', 'Order status must be updated promptly (accepted, processing, shipped).', 'Failure to fulfill orders repeatedly may result in account suspension.'] },
  { title: '5. Payments and Payouts', items: ['Earnings are calculated as the sale price minus platform commission and applicable taxes.', 'Payouts are processed to your verified bank account on the scheduled payout cycle.', 'ZPIN reserves the right to withhold payouts in cases of suspected fraud or policy violations.'] },
  { title: '6. Prohibited Conduct', items: ['Manipulating product reviews or ratings.', 'Listing counterfeit, stolen, or prohibited goods.', 'Contacting customers directly to conduct transactions outside the platform.', 'Providing false business or identity information.'] },
  { title: '7. Governing Law', body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.' },
];

function ExpandableSection({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-yellow-600 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 lg:p-6 text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-bold text-gray-900 text-sm lg:text-base">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 lg:px-6 pb-5 border-t border-gray-100 text-sm text-gray-600 leading-relaxed space-y-4 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-white shadow-sm border">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">Seller Help &amp; Support</h1>
                <p className="text-gray-500 text-sm lg:text-base">Find answers to common questions or contact our support team for assistance.</p>
              </div>
            </div>
          </div>

          {/* Help topic cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {helpTopics.map((topic, idx) => (
              <div key={idx} className="flex items-start bg-white border border-yellow-600 rounded-2xl p-4 lg:p-5 shadow-sm">
                <div className="mr-3 lg:mr-4 flex-shrink-0">{topic.icon}</div>
                <div>
                  <h3 className="text-sm lg:text-base font-bold mb-1 text-gray-900">{topic.title}</h3>
                  <p className="text-gray-500 text-xs lg:text-sm">{topic.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact support */}
          <div className="bg-white border border-yellow-600 rounded-2xl p-4 lg:p-6 shadow-sm mb-6 lg:mb-8">
            <h2 className="text-sm lg:text-md font-bold text-blue-700 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 10a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path d="M9 10h.01M15 10h.01M7 16h10" />
              </svg>
              Contact Support
            </h2>
            <div className="space-y-3">
              <div className="flex items-start lg:items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5 lg:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 20v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="4" strokeWidth="2"/>
                </svg>
                <div className="text-sm lg:text-base"><strong className="mr-1">Live Chat:</strong>Get instant support from our support team.</div>
              </div>
              <div className="flex items-start lg:items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-brand flex-shrink-0 mt-0.5 lg:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 16.92v.01M6.16 7.12l-.12-.12a2 2 0 1 1 2.83-2.83l.13.13" strokeWidth="2"/>
                  <path d="M17.657 2.657A9 9 0 1 1 5.636 14.634" strokeWidth="2"/>
                </svg>
                <div className="text-sm lg:text-base"><strong className="mr-1">Phone Support:</strong>Speak directly with a support specialist.</div>
              </div>
              <div className="flex items-start lg:items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-pink-600 flex-shrink-0 mt-0.5 lg:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l9 6 9-6" />
                  <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                </svg>
                <div className="text-sm lg:text-base"><strong className="mr-1">Email Support:</strong><span className="text-blue-700 hover:underline">zpinpvtltd@gmail.com</span></div>
              </div>
            </div>
          </div>

          {/* Legal section */}
          <h2 className="text-base font-bold text-gray-800 mb-3">Legal</h2>
          <div className="space-y-3">

            {/* Privacy Policy */}
            <ExpandableSection
              title="Privacy Policy"
              icon={
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              }
            >
              <p className="text-xs text-gray-400 mb-2">Effective Date: March 24, 2026</p>
              <p className="mb-3">This Privacy Policy applies to the <strong>ZPIN Vendor Dashboard</strong>. By registering as a seller, you agree to the collection and use of your information as described below.</p>
              {PRIVACY_SECTIONS.map(({ title, body, items }) => (
                <div key={title}>
                  <p className="font-semibold text-gray-800 mb-1">{title}</p>
                  {body && <p className="mb-2">{body}</p>}
                  {items && <ul className="list-disc list-inside space-y-0.5 mb-2">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>}
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">© 2026 ZPIN. All Rights Reserved.</p>
            </ExpandableSection>

            {/* Terms & Conditions */}
            <ExpandableSection
              title="Terms & Conditions"
              icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              }
            >
              <p className="text-xs text-gray-400 mb-2">Effective Date: March 24, 2026</p>
              <p className="mb-3">These Terms govern your use of the <strong>ZPIN Vendor Dashboard</strong> as a registered seller. By creating a seller account, you agree to be bound by these Terms.</p>
              {TERMS_SECTIONS.map(({ title, body, items }) => (
                <div key={title}>
                  <p className="font-semibold text-gray-800 mb-1">{title}</p>
                  {body && <p className="mb-2">{body}</p>}
                  {items && <ul className="list-disc list-inside space-y-0.5 mb-2">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>}
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">© 2026 ZPIN. All Rights Reserved.</p>
            </ExpandableSection>

          </div>
        </div>
      </main>
    </div>
  );
}


