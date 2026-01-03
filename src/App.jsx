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




//Dashboard pages....

import DashboardHome from './Dashboard/DashboardHome';
import Orders from './Dashboard/Orders';
import Products from './Dashboard/Products';
import AddProduct from './Dashboard/AddProduct';
import Preview from './Dashboard/Preview';
import Settings from './Dashboard/Settings';
import Support from './Dashboard/Support';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<DashboardHome />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/phone" element={<PhoneNumberVerification />} />
  <Route path="/create-account" element={<CreateAccount />} />
  <Route path="/details" element={<Details />} /> 
  <Route path="/gst-details" element={<GSTDetails />} />
  <Route path="/bank" element={<BankDetails />} /> 
      


    
        {/* Add other dashboard routes here as needed */}
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/orders" element={<Orders />} />
        <Route path="/dashboard/products" element={<Products />} />
        <Route path="/dashboard/add-product" element={<AddProduct />} />
        <Route path="/dashboard/preview" element={<Preview />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/support" element={<Support />} />
      </Routes>
    </Router>
  );
}






