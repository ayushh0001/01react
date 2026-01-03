// Import necessary React components
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import axios from 'axios';

// Reusable SectionCard component - creates consistent card layout for different settings sections
const SectionCard = ({ icon, title, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-7 p-1.5">
      
      {/* Card header with icon and title */}
      <div className="flex items-center px-7 pt-6 pb-2">
        <span className="text-blue-700 text-lg mr-2">
          {icon}
        </span>
        <h2 className="text-md md:text-lg font-bold text-blue-800">
          {title}
        </h2>
      </div>
      
      {/* Card content area */}
      <div className="p-6 pb-4 space-y-1">
        {children}
      </div>
      
    </div>
  );
};

// Reusable Row component - displays individual setting items with edit functionality
const Row = ({ label, value, icon, showEdit }) => {
  return (
    <div className="flex items-start sm:items-center justify-between px-1 py-[9px] rounded-lg mb-1 bg-gray-50">
      
      {/* Left side - icon, label, and value */}
      <div className="flex items-start gap-2">
        
        {/* Setting icon */}
        <div className="text-gray-500 mt-1">
          {icon}
        </div>
        
        {/* Label and value display */}
        <div>
          <div className="text-xs font-medium text-gray-400 mb-1px">
            {label}
          </div>
          <div className="text-base font-semibold text-gray-700 break-words">
            {value}
          </div>
        </div>
        
      </div>
      
      {/* Right side - edit button (conditional) */}
      {showEdit && (
        <button 
          title="Edit" 
          className="p-1 ml-2 text-gray-500 hover:text-blue-800 transition"
        >
          {/* Edit icon SVG */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round"
              d="M16.862 3.487a2.13 2.13 0 1 1 3.015 3.014L7.935 18.443a1.999 1.999 0 0 1-.881.507l-4.004 1.13 1.13-4.004a2 2 0 0 1 .507-.881L16.862 3.487z" 
            />
          </svg>
        </button>
      )}
      
    </div>
  );
};

// Main Settings component - displays and manages seller profile settings
export default function Settings() {
  const [profile, setProfile] = useState({ owner: "", company: "" });
  const [shop, setShop] = useState({ name: "", owner: "", address: "" });
  const [contact, setContact] = useState({ phone: "", email: "" });
  const [payment, setPayment] = useState({ bank: "", account: "", ifsc: "" });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://zpin-ecommerce-backend-997x.onrender.com/api/v1';

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/user/profile`, { headers });
      const userData = response.data.data || {};
      
      setProfile({
        owner: userData.name || "Demo User",
        company: userData.businessName || "Demo Company"
      });
      
      setShop({
        name: userData.businessName || "Demo Shop",
        owner: userData.name || "Demo Owner",
        address: userData.address || "Demo Address"
      });
      
      setContact({
        phone: userData.phone || "+91 1234567890",
        email: userData.email || "demo@example.com"
      });
      
      setPayment({
        bank: userData.bankDetails?.bankName || "Demo Bank",
        account: userData.bankDetails?.accountNumber ? `**** **** **** ${userData.bankDetails.accountNumber.slice(-4)}` : "**** **** **** 1234",
        ifsc: userData.bankDetails?.ifscCode || "DEMO0001234"
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({ owner: "Demo User", company: "Demo Company" });
      setShop({ name: "Demo Shop", owner: "Demo Owner", address: "Demo Address" });
      setContact({ phone: "+91 1234567890", email: "demo@example.com" });
      setPayment({ bank: "Demo Bank", account: "**** **** **** 1234", ifsc: "DEMO0001234" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-7 flex items-center justify-center">
          <div className="text-lg font-semibold text-gray-600">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main settings content */}
      <main className="flex-1 p-7">
        
        {/* Page header with profile summary */}
        <div className="flex flex-col-reverse md:flex-row md:justify-between max-w-5xl mx-auto mb-7 mt-4 items-start">
          
          {/* Left side - page title and description */}
          <div>
            <h1 className="text-2xl md:text-2xl font-bold leading-tight mb-0">
              Profile Settings
            </h1>
            <div className="text-gray-500 mb-2 text-sm md:text-base">
              Manage your seller profile and account information
            </div>
          </div>
          
          {/* Right side - profile avatar and basic info */}
          <div className="flex items-center mb-7 md:mb-0">
            
            {/* Profile avatar with user icon */}
            <div className="bg-yellow-200 border-2 border-yellow-500 rounded-full w-10 h-10 flex items-center justify-center mr-2">
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
          {/* Shop name row */}
          <Row
            label="Shop Name"
            value={shop.name}
            icon={
              <svg fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"/>
                <rect x="7" y="11" width="10" height="4" rx="1"/>
              </svg>
            }
            showEdit
          />
          
          {/* Shop owner name row */}
          <Row
            label="Shop Owner Name"
            value={shop.owner}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M2 20c0-4 8-7 10-7s10 3 10 7"/>
              </svg>
            }
            showEdit
          />
          
          {/* Shop address row */}
          <Row
            label="Shop Address"
            value={shop.address}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C7.03 2 2 6.48 2 12c0 4.81 5.63 11.81 9.19 16.27a2.07 2.07 0 0 0 3.21 0C16.37 23.81 22 16.81 22 12c0-5.52-5.03-10-10-10z"/>
                <circle cx="12" cy="12" r="6"/>
              </svg>
            }
            showEdit
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
          {/* Phone number row */}
          <Row
            label="Contact Number"
            value={contact.phone}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92V17a2 2 0 0 1-2 2A18 18 0 0 1 4 5a2 2 0 0 1 2-2h.09" />
              </svg>
            }
            showEdit
          />
          
          {/* Email address row */}
          <Row
            label="Email Address"
            value={contact.email}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 8l9 6 9-6" />
                <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
              </svg>
            }
            showEdit
          />
        </SectionCard>

        {/* Payment details section */}
        <SectionCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M6 17v.01"/>
              <path d="M18 17v.01"/>
            </svg>
          }
          title="Payment Details"
        >
          {/* Bank name row */}
          <Row
            label="Bank Name"
            value={payment.bank}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 17v.01"/>
                <path d="M18 17v.01"/>
              </svg>
            }
            showEdit
          />
          
          {/* Account number row (masked for security) */}
          <Row
            label="Account Number"
            value={payment.account}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
            }
            showEdit
          />
          
          {/* IFSC code row */}
          <Row
            label="IFSC"
            value={payment.ifsc}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 17v.01"/>
                <path d="M18 17v.01"/>
              </svg>
            }
            showEdit
          />
        </SectionCard>
        
      </main>
    </div>
  );
}
