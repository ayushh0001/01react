// Import necessary React components
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from '../utils/api'; // shared axios instance — has auth interceptor + withCredentials

// Reusable SectionCard component - creates consistent card layout for different settings sections
const SectionCard = ({ icon, title, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-yellow-400 mb-7 p-1.5">

      {/* Card header with icon and title */}
      <div className="flex items-center px-4 lg:px-7 pt-6 pb-2">
        <span className="text-blue-700 text-lg mr-2">
          {icon}
        </span>
        <h2 className="text-md md:text-lg font-bold text-blue-800">
          {title}
        </h2>
      </div>

      {/* Card content area */}
      <div className="p-4 lg:p-6 pb-4 space-y-1">
        {children}
      </div>

    </div>
  );
};

// Reusable Row component - inline editable
const Row = ({ label, value, icon, onSave, type = 'text', readOnly = false }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-1 py-[9px] rounded-lg mb-1 bg-gray-50 gap-2">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <div className="text-gray-500 mt-1 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-400 mb-0.5">{label}</div>
          {editing ? (
            <input autoFocus type={type} value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              className="w-full text-sm font-semibold text-gray-800 border-b-2 border-brand bg-transparent outline-none py-0.5"
            />
          ) : (
            <div className="text-sm lg:text-base font-semibold text-gray-700 truncate">{value || '—'}</div>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="px-2 py-1 text-xs font-semibold bg-brand text-black rounded-lg disabled:opacity-50 transition">
                {saving ? '...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setDraft(value); }}
                className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-lg transition">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} title="Edit"
              className="p-1 text-gray-400 hover:text-blue-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.13 2.13 0 1 1 3.015 3.014L7.935 18.443a1.999 1.999 0 0 1-.881.507l-4.004 1.13 1.13-4.004a2 2 0 0 1 .507-.881L16.862 3.487z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Main Settings component - displays and manages seller profile settings
export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({ owner: "", company: "" });
  const [shop, setShop] = useState({ name: "", owner: "", address: "" });
  const [contact, setContact] = useState({ phone: "", email: "" });
  const [payment, setPayment] = useState({ bank: "", account: "", ifsc: "" });
  const [loading, setLoading] = useState(true);

  // Save helpers — send full required payload since controllers do upsert
  const saveBusinessField = async (field, value) => {
    // saveBusinessDetails requires businessName + pincode at minimum — fetch current first
    const res = await API.get('/users/seller/business-details').catch(() => ({ data: { data: {} } }));
    const cur = res.data?.data || {};
    await API.post('/users/seller/business-details', {
      businessName: cur.business_name || shop.name,
      businessDescription: cur.business_description || '',
      businessType: cur.business_type || 'general',
      gstNo: cur.gst_no || '',
      panNo: cur.pan_no || '',
      address: cur.address || shop.address,
      city: cur.city || '',
      state: cur.state || '',
      pincode: cur.pincode || '000000',
      [field]: value,
    });
    if (field === 'businessName') { setShop(prev => ({ ...prev, name: value })); setProfile(prev => ({ ...prev, company: value })); }
    if (field === 'address') setShop(prev => ({ ...prev, address: value }));
  };

  const saveUserField = async (field, value) => {
    await API.put('/users/seller/profile', { [field]: value });
    if (field === 'name')   { setShop(prev => ({ ...prev, owner: value })); setProfile(prev => ({ ...prev, owner: value })); }
    if (field === 'mobile') setContact(prev => ({ ...prev, phone: value }));
    if (field === 'email')  setContact(prev => ({ ...prev, email: value }));
  };

  const saveBankField = async (field, value) => {
    const res = await API.get('/users/seller/bank-details').catch(() => ({ data: { data: {} } }));
    const cur = res.data?.data || {};
    await API.post('/users/seller/bank-details', {
      accountHolderName: cur.account_holder_name || '',
      accountNumber: cur.account_no || payment.account.replace(/\*/g, ''),
      ifscCode: cur.ifsc_code || payment.ifsc,
      bankName: cur.bank_name || payment.bank,
      accountType: cur.account_type || 'savings',
      [field]: value,
    });
    if (field === 'bankName')      setPayment(prev => ({ ...prev, bank: value }));
    if (field === 'accountNumber') setPayment(prev => ({ ...prev, account: `**** **** **** ${String(value).slice(-4)}` }));
    if (field === 'ifscCode')      setPayment(prev => ({ ...prev, ifsc: value }));
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // API instance attaches Bearer token automatically via interceptor
      const response = await API.get('/users/seller/profile');

      const data = response.data?.data || {};
      const user = data.user || {};
      const business = data.businessDetails || {};
      const bank = data.bankDetails || {};

      // Set profile info
      setProfile({
        owner: user.name || user.userName || "N/A",
        company: business.businessName || "N/A"
      });

      // Set shop info
      setShop({
        name: business.businessName || "N/A",
        owner: user.name || user.userName || "N/A",
        address: business.address || "N/A"
      });

      // Set contact info
      setContact({
        phone: user.mobile || "N/A",
        email: user.email || "N/A"
      });

      // Set payment info (mask account number for security)
      const acctString = String(bank.accountNumber || "");
      setPayment({
        bank: bank.bankName || "N/A",
        account: acctString ? `**** **** **** ${acctString.slice(-4)}` : "N/A",
        ifsc: bank.ifscCode || "N/A"
      });

    } catch (error) {
      console.error('Error fetching profile from database:', error?.response?.data || error.message);
      // Show graceful fallback values
      setProfile({ owner: "Could not load profile", company: "—" });
      setShop({ name: "—", owner: "—", address: "—" });
      setContact({ phone: "—", email: "—" });
      setPayment({ bank: "—", account: "—", ifsc: "—" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 lg:z-auto`}>
          <Sidebar />
        </div>
        <main className="flex-1 p-4 lg:p-7 flex items-center justify-center">
          <div className="text-lg font-semibold text-gray-600">Loading profile...</div>
        </main>
      </div>
    );
  }

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

      {/* Main settings content */}
      <main className="flex-1 p-4 lg:p-7">

        {/* Page header with profile summary */}
        <div className="flex flex-col-reverse md:flex-row md:justify-between max-w-5xl mx-auto mb-7 mt-4 items-start">

          {/* Left side - page title and description */}
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-sm border"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold leading-tight mb-0">
                Profile Settings
              </h1>
              <div className="text-gray-500 mb-2 text-sm md:text-base">
                Manage your seller profile and account information
              </div>
            </div>
          </div>

          {/* Right side - profile avatar and basic info */}
          <div className="flex items-center mb-7 md:mb-0">

            {/* Profile avatar with user icon */}
            <div className="bg-yellow-200 border-2 border-brand rounded-full w-10 h-10 flex items-center justify-center mr-2">
              <svg fill="none" className="w-6 h-6 text-yellow-800" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" strokeWidth="2" />
                <path strokeWidth="2" d="M4 20c0-3.2 6-5.5 8-5.5s8 2.3 8 5.5" />
              </svg>
            </div>

            {/* Profile name and company */}
            <div>
              <div className="text-black font-semibold text-[15px]">
                {profile.owner}
              </div>
              <div className="text-xs text-gray-500">
                {profile.company}
              </div>
            </div>

          </div>
        </div>

        {/* Shop information section */}
        <SectionCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 9V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 9l1.68 9.04A2 2 0 0 0 6.65 20h10.7a2 2 0 0 0 1.97-1.96L21 9" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          }
          title="Shop Information"
        >
          <Row label="Shop Name" value={shop.name}
            onSave={v => saveBusinessField('businessName', v)}
            icon={<svg fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" /><rect x="7" y="11" width="10" height="4" rx="1" /></svg>}
          />
          <Row label="Shop Owner Name" value={shop.owner}
            onSave={v => saveUserField('name', v)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M2 20c0-4 8-7 10-7s10 3 10 7" /></svg>}
          />
          <Row label="Shop Address" value={shop.address}
            onSave={v => saveBusinessField('address', v)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C7.03 2 2 6.48 2 12c0 4.81 5.63 11.81 9.19 16.27a2.07 2.07 0 0 0 3.21 0C16.37 23.81 22 16.81 22 12c0-5.52-5.03-10-10-10z" /><circle cx="12" cy="12" r="6" /></svg>}
          />
        </SectionCard>

        {/* Contact information section */}
        <SectionCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V17a2 2 0 0 1-2 2A18 18 0 0 1 4 5a2 2 0 0 1 2-2h.09" />
            </svg>
          }
          title="Contact Information"
        >
          <Row label="Contact Number" value={contact.phone}
            onSave={v => saveUserField('mobile', v)}
            type="tel"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V17a2 2 0 0 1-2 2A18 18 0 0 1 4 5a2 2 0 0 1 2-2h.09" /></svg>}
          />
          <Row label="Email Address" value={contact.email}
            onSave={v => saveUserField('email', v)}
            type="email"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l9 6 9-6" /><path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" /></svg>}
          />
        </SectionCard>

        {/* Payment details section */}
        <SectionCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
              <path d="M6 17v.01" />
              <path d="M18 17v.01" />
            </svg>
          }
          title="Payment Details"
        >
          <Row label="Bank Name" value={payment.bank} readOnly
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></svg>}
          />
          <Row label="Account Number" value={payment.account} readOnly
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></svg>}
          />
          <Row label="IFSC" value={payment.ifsc} readOnly
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /><path d="M6 17v.01" /><path d="M18 17v.01" /></svg>}
          />
        </SectionCard>

      </main>
    </div>
  );
}
