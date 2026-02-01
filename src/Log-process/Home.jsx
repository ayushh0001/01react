// Import necessary React hooks and router functionality
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Custom SVG icon components (replacing lucide-react dependency)
// These components render inline SVG icons for better performance

// Login icon - used in header login button
const LogInIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

// User plus icon - used in header signup button
const UserPlusIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

// Check circle icon - used in features section
const CheckCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.01-8.72"/>
    <path d="M16 12L13 15 9 11"/>
  </svg>
);

// Package icon - used in features and hero sections
const PackageIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16.5 9.4L7.5 4.2"/>
    <path d="M12 2v20"/>
    <path d="M18.78 7.5L12 11.2 5.22 7.5"/>
    <path d="M18.78 16.5L12 20.2 5.22 16.5"/>
    <path d="M2 7.5L12 13 22 7.5"/>
    <path d="M2 16.5L12 22 22 16.5"/>
  </svg>
);

// Truck icon - used in delivery feature
const TruckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 18V6"/>
    <path d="M21 15V6"/>
    <path d="M5 18H21"/>
    <path d="M10 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
    <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
    <path d="M2 18h3.5a2 2 0 0 0 0 4H7"/>
    <path d="M15 15H3"/>
    <path d="M18 6h3"/>
    <path d="M2 13.06V7.75c0-1.06.84-1.75 1.9-1.75h14.28c1.06 0 1.82.68 1.82 1.75V15"/>
  </svg>
);

// Map pin icon - used in local support feature
const MapPinIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10A8 8 0 0 0 12 2a8 8 0 0 0-8 10c0 6 8 10 8 10z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// Mail icon - used in footer contact section
const MailIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// Logo component - displays the ZPIN brand name with custom styling
const ZipinLogo = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`flex items-center justify-center font-['Bungee',cursive] text-2xl font-bold text-amber-500 ${className}`}>
      ZPIN
    </div>
  );
};

// Feature icon wrapper - provides consistent styling for feature icons
const FeatureIcon = ({ Icon }) => {
  return (
    <div className="p-4 rounded-full bg-amber-500/10 text-amber-600 mb-4">
      <Icon className="w-8 h-8" />
    </div>
  );
};

// Hero image placeholder - displays when actual image is not available
const HeroImagePlaceholder = () => {
  return (
    <div className="w-full h-64 bg-amber-100/50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-300 shadow-md">
      <PackageIcon className="w-12 h-12" />
      <span className="ml-3 font-semibold text-lg">
        Fast Delivery Illustration
      </span>
    </div>
  );
};

// Main Home component - landing page for ZPIN platform
export default function Home() {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header section - navigation and branding */}
      <header className="flex justify-between items-center px-4 md:px-12 py-4 bg-white shadow-md sticky top-0 z-10">
        
        {/* Logo */}
        <ZipinLogo />
        
        {/* Navigation menu - hidden on mobile */}
        <nav className="hidden md:flex space-x-6">
          <a href="#hero" className="text-gray-700 hover:text-amber-500 font-medium transition duration-150">
            Home
          </a>
          <a href="#features" className="text-gray-700 hover:text-amber-500 font-medium transition duration-150">
            Sell online
          </a>
          <a href="#how-it-works" className="text-gray-700 hover:text-amber-500 font-medium transition duration-150">
            How it works
          </a>
          <a href="#contact" className="text-gray-700 hover:text-amber-500 font-medium transition duration-150">
            Contact
          </a>
        </nav>
        
        {/* Authentication buttons */}
        <div className="flex items-center space-x-3">
          
          {/* Login button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150 shadow-sm"
          >
            <LogInIcon className="w-5 h-5 mr-1" /> 
            Login
          </button>
          
          {/* Signup button */}
          <button
            onClick={() => navigate('/signup')}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-150 shadow-md"
          >
            <UserPlusIcon className="w-5 h-5 mr-1" /> 
            Sign Up
          </button>
          
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow">
        
        {/* Hero section - main landing area with call-to-action */}
        <section id="hero" className="flex flex-col lg:flex-row items-center justify-between p-8 md:p-16 bg-amber-50/50">
          
          {/* Left side - Hero text and buttons */}
          <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
            
            {/* Main headline */}
            <h2 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-900 leading-tight">
              Shop Smart, <span className="text-amber-600">Shop Local.</span> Lightning Fast.
            </h2>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8">
              ZPIN connects you with local sellers for same-day delivery, making waiting a thing of the past.
            </p>
            
            {/* Call-to-action buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/signup')} 
                className="start-selling px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl shadow-lg hover:bg-amber-600 transition duration-300"
              >
                Start Selling Now
              </button>
              <button className="px-6 py-3 border border-amber-500 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition duration-300">
                Explore Deals
              </button>
            </div>
            
          </div>
          
          {/* Right side - Hero image */}
          <div className="lg:w-1/2 w-full max-w-lg">
            <HeroImagePlaceholder />
          </div>
          
        </section>

        {/* Features section - highlights key platform benefits */}
        <section id="features" className="p-8 md:p-16 bg-white">
          
          {/* Section title */}
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose ZPIN?
          </h2>
          
          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Same-day delivery feature */}
            <div className="flex flex-col items-center p-6 text-center bg-gray-50 rounded-xl shadow-lg border border-gray-100">
              <FeatureIcon Icon={TruckIcon} />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Same-Day Delivery
              </h3>
              <p className="text-gray-600">
                Get your products delivered in hours, not days. Local speed, global variety.
              </p>
            </div>
            
            {/* Local support feature */}
            <div className="flex flex-col items-center p-6 text-center bg-gray-50 rounded-xl shadow-lg border border-gray-100">
              <FeatureIcon Icon={MapPinIcon} />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Support Local
              </h3>
              <p className="text-gray-600">
                We connect you directly with nearby businesses and trusted suppliers.
              </p>
            </div>
            
            {/* Quality verification feature */}
            <div className="flex flex-col items-center p-6 text-center bg-gray-50 rounded-xl shadow-lg border border-gray-100">
              <FeatureIcon Icon={CheckCircleIcon} />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Verified Quality
              </h3>
              <p className="text-gray-600">
                Every product and supplier is verified to ensure the best shopping experience.
              </p>
            </div>
            
          </div>
        </section>

        {/* How it works section - explains seller onboarding process */}
        <section id="how-it-works" className="p-8 md:p-16 bg-gray-900 text-white">
          
          {/* Section title */}
          <h2 className="text-4xl font-bold text-center mb-12">
            How it Works (for Sellers)
          </h2>
          
          {/* Process steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            
            {/* Step 1: Sign up */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-500 rounded-full text-xl font-bold mb-3">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Sign Up
              </h3>
              <p className="text-gray-300">
                Create your account and verify your business details easily.
              </p>
            </div>
            
            {/* Step 2: List products */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-500 rounded-full text-xl font-bold mb-3">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">
                List Products
              </h3>
              <p className="text-gray-300">
                Upload your items, set prices, and define your local delivery radius.
              </p>
            </div>
            
            {/* Step 3: Sell and ship */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-500 rounded-full text-xl font-bold mb-3">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Sell & Ship
              </h3>
              <p className="text-gray-300">
                Receive orders and use our logistics partners for swift same-day delivery.
              </p>
            </div>
            
          </div>
          
          {/* Call-to-action button */}
          <div className="text-center mt-10">
            <button 
              onClick={() => navigate('/signup')} 
              className="start-selling px-8 py-3 bg-amber-500 text-white font-semibold rounded-xl shadow-lg hover:bg-amber-600 transition duration-300"
            >
              Join ZPIN Today
            </button>
          </div>
          
        </section>

        {/* Contact section - contact form and information */}
        <section id="contact" className="flex flex-col lg:flex-row items-center justify-between p-8 md:p-16 bg-white border-t border-gray-100">
          
          {/* Left side - Contact form */}
          <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
            
            {/* Section title */}
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Contact Us
            </h2>
            
            {/* Section description */}
            <p className="text-lg text-gray-600 mb-6">
              Have questions about selling, buying, or partnering? Reach out to our team!
            </p>
            
            {/* Contact form */}
            <form className="space-y-4">
              
              {/* Name field */}
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full p-3 border rounded-lg focus:ring-amber-500 focus:border-amber-500" 
                required 
              />
              
              {/* Email field */}
              <input 
                type="email" 
                placeholder="Your Email" 
                className="w-full p-3 border rounded-lg focus:ring-amber-500 focus:border-amber-500" 
                required 
              />
              
              {/* Message field */}
              <textarea 
                rows="4" 
                placeholder="Your Message" 
                className="w-full p-3 border rounded-lg focus:ring-amber-500 focus:border-amber-500" 
                required
              ></textarea>
              
              {/* Submit button */}
              <button 
                type="submit" 
                className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition duration-300"
              >
                Send Message
              </button>
              
            </form>
            
          </div>
          
          {/* Right side - Contact illustration */}
          <div className="lg:w-1/2 w-full max-w-lg">
            <img
              src="https://placehold.co/600x400/fff9e0/333333?text=Contact+Illustration"
              alt="Contact Us"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
          
        </section>
      </main>

      {/* Footer section - links and company information */}
      <footer className="bg-gray-800 text-white p-8 md:p-12">
        
        {/* Footer content grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-700 pb-8 mb-8 max-w-6xl mx-auto">
          
          {/* Company branding */}
          <div>
            <h4 className="text-xl font-bold mb-3 text-amber-500">
              ZPIN
            </h4>
            <p className="text-gray-400 text-sm">
              Because waiting is so last season.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#hero" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  Sell online
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  Top Deals
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          
          {/* Support links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  Supplier FAQs
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition duration-150">
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact information */}
          <div>
            <h4 className="text-lg font-semibold mb-3">
              Contact
            </h4>
            <p className="text-gray-400 text-sm flex items-center mb-2">
              <MapPinIcon className="w-4 h-4 mr-2" /> 
              Pune, Maharashtra 411041, India
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              <MailIcon className="w-4 h-4 mr-2" /> 
              support@zipin.in
            </p>
          </div>
          
        </div>
        
        {/* Copyright notice */}
        <div className="text-center text-sm text-gray-500">
          © 2023 ZPIN. All rights reserved.
        </div>
        
      </footer>
    </div>
  );
}
