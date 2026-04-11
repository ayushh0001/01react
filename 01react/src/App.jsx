import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Log-process/Home';
import Login from './Log-process/Login';
import Signup from './Log-process/Signup';
import PhoneNumberVerification from './Log-process/PhoneNumberVerification';
import CreateAccount from './Log-process/CreateAccount'; // newly added page
import Details from './Log-process/Details'; // newly added page
import GSTDetails from './Log-process/GSTDetails'; // newly added page
import BankDetails from './Log-process/BankDetails'; // newly added page
import AuthCallback from './Log-process/AuthCallback'; // Google OAuth callback
import ForgotPassword from './Log-process/ForgotPassword'; // Forgot password page
import VerifyResetOTP from './Log-process/VerifyResetOTP'; // Verify reset OTP page
import ResetPassword from './Log-process/ResetPassword'; // Reset password page
import ErrorPage from './ErrorPage'; // Error page




//Dashboard pages....

import DashboardHome from './Dashboard/DashboardHome';
import Earning from './Dashboard/Earning';
import Orders from './Dashboard/Orders';
import Products from './Dashboard/Products';
import AddProduct from './Dashboard/AddProduct';
import EditProduct from './Dashboard/EditProduct';
import Preview from './Dashboard/Preview';
import Customer from './Dashboard/Customer';
import Settings from './Dashboard/Settings';
import Support from './Dashboard/Support';
import Analytics from './Dashboard/Analytics';
import Inventory from './Dashboard/Inventory';
import DashboardLayout from './Dashboard/DashboardLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/phone" element={<PhoneNumberVerification />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/details" element={<Details />} /> 
        <Route path="/gst-details" element={<GSTDetails />} />
        <Route path="/bank" element={<BankDetails />} /> 
        <Route path="/auth/callback" element={<AuthCallback />} /> {/* Google OAuth callback */} 
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Forgot password */}
        <Route path="/verify-reset-otp" element={<VerifyResetOTP />} /> {/* Verify reset OTP */}
        <Route path="/reset-password" element={<ResetPassword />} /> {/* Reset password */}
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
        <Route path="/dashboard/earnings" element={<DashboardLayout><Earning /></DashboardLayout>} />
        <Route path="/dashboard/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
        <Route path="/dashboard/products" element={<DashboardLayout><Products /></DashboardLayout>} />
        <Route path="/dashboard/add-product" element={<DashboardLayout><AddProduct /></DashboardLayout>} />
        <Route path="/dashboard/edit-product/:productId" element={<DashboardLayout><EditProduct /></DashboardLayout>} />
        <Route path="/dashboard/preview" element={<DashboardLayout><Preview /></DashboardLayout>} />
        <Route path="/dashboard/customers" element={<DashboardLayout><Customer /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
        <Route path="/dashboard/support" element={<DashboardLayout><Support /></DashboardLayout>} />
        <Route path="/dashboard/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
        <Route path="/dashboard/inventory" element={<DashboardLayout><Inventory /></DashboardLayout>} />
        
        {/* Error page */}
        <Route path="/error" element={<ErrorPage />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}






