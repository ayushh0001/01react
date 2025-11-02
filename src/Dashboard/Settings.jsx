import React from "react";
import Sidebar from "./Sidebar";

const SectionCard = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-7 p-1.5">
    <div className="flex items-center px-7 pt-6 pb-2">
      <span className="text-blue-700 text-lg mr-2">{icon}</span>
      <h2 className="text-md md:text-lg font-bold text-blue-800">{title}</h2>
    </div>
    <div className="p-6 pb-4 space-y-1">{children}</div>
  </div>
);

const Row = ({ label, value, icon, showEdit }) => (
  <div className="flex items-start sm:items-center justify-between px-1 py-[9px] rounded-lg mb-1 bg-gray-50">
    <div className="flex items-start gap-2">
      <div className="text-gray-500 mt-1">{icon}</div>
      <div>
        <div className="text-xs font-medium text-gray-400 mb-1px">{label}</div>
        <div className={`text-base font-semibold text-gray-700 break-words`}>{value}</div>
      </div>
    </div>
    {showEdit && (
      <button title="Edit" className="p-1 ml-2 text-gray-500 hover:text-blue-800 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M16.862 3.487a2.13 2.13 0 1 1 3.015 3.014L7.935 18.443a1.999 1.999 0 0 1-.881.507l-4.004 1.13 1.13-4.004a2 2 0 0 1 .507-.881L16.862 3.487z" />
        </svg>
      </button>
    )}
  </div>
);

export default function Settings() {
  // Example data—replace with your actual user/shop/payment data or form state
  const profile = { owner: "Sakshi srivastava", company: "Zipin pvt ltd" };
  const shop = {
    name: "Zipin pvt ltd",
    owner: "Sakshi srivastava",
    address: "123 Commerce Street, Business District, NY 10001"
  };
  const contact = {
    phone: "+91 1234567890",
    email: "abc@example.com"
  };
  const payment = {
    bank: "XYZ Bank",
    account: "**** **** **** 1234",
    ifsc: "BY12TT6587"
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-7">
        <div className="flex flex-col-reverse md:flex-row md:justify-between max-w-5xl mx-auto mb-7 mt-4 items-start">
          <div>
            <h1 className="text-2xl md:text-2xl font-bold leading-tight mb-0">Profile Settings</h1>
            <div className="text-gray-500 mb-2 text-sm md:text-base">Manage your seller profile and account information</div>
          </div>
          {/* Profile/avatar mini */}
          <div className="flex items-center mb-7 md:mb-0">
            <div className="bg-yellow-200 border-2 border-yellow-500 rounded-full w-10 h-10 flex items-center justify-center mr-2">
              <svg fill="none" className="w-6 h-6 text-yellow-800" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" strokeWidth="2" />
                <path strokeWidth="2" d="M4 20c0-3.2 6-5.5 8-5.5s8 2.3 8 5.5" />
              </svg>
            </div>
            <div>
              <div className="text-black font-semibold text-[15px]">{profile.owner}</div>
              <div className="text-xs text-gray-500">{profile.company}</div>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2" strokeWidth="2" strokeLinecap="round" /><path d="M3 9l1.68 9.04A2 2 0 0 0 6.65 20h10.7a2 2 0 0 0 1.97-1.96L21 9" strokeWidth="2" strokeLinejoin="round" /></svg>}
          title="Shop Information"
        >
          <Row
            label="Shop Name"
            value={shop.name}
            icon={<svg fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"/><rect x="7" y="11" width="10" height="4" rx="1"/></svg>}
            showEdit
          />
          <Row
            label="Shop Owner Name"
            value={shop.owner}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M2 20c0-4 8-7 10-7s10 3 10 7"/></svg>}
            showEdit
          />
          <Row
            label="Shop Address"
            value={shop.address}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C7.03 2 2 6.48 2 12c0 4.81 5.63 11.81 9.19 16.27a2.07 2.07 0 0 0 3.21 0C16.37 23.81 22 16.81 22 12c0-5.52-5.03-10-10-10z"/><circle cx="12" cy="12" r="6"/></svg>}
            showEdit
          />
        </SectionCard>

        {/* Contact Info */}
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V17a2 2 0 0 1-2 2A18 18 0 0 1 4 5a2 2 0 0 1 2-2h.09" /></svg>}
          title="Contact Information"
        >
          <Row
            label="Contact Number"
            value={contact.phone}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V17a2 2 0 0 1-2 2A18 18 0 0 1 4 5a2 2 0 0 1 2-2h.09" /></svg>}
            showEdit
          />
          <Row
            label="Email Address"
            value={contact.email}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l9 6 9-6" /><path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" /></svg>}
            showEdit
          />
        </SectionCard>

        {/* Payment Details */}
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M6 17v.01"/><path d="M18 17v.01"/></svg>}
          title="Payment Details"
        >
          <Row
            label="Bank Name"
            value={payment.bank}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M6 17v.01"/><path d="M18 17v.01"/></svg>}
            showEdit
          />
          <Row
            label="Account Number"
            value={payment.account}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>}
            showEdit
          />
          <Row
            label="IFSC"
            value={payment.ifsc}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M6 17v.01"/><path d="M18 17v.01"/></svg>}
            showEdit
          />
        </SectionCard>
      </main>
    </div>
  );
}
