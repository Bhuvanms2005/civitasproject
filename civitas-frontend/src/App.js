import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SplashScreen from './components/SplashScreen';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Help from './components/Help';
import Signup from './components/Signup';
import SignIn from './components/Signin';
import Home from './components/Home';
import Terms from './components/Terms';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import VolunteerDashboard from './components/VolunteerDashboard';
import AdminDashboard from './components/AdminDashboard';

// FIX: Use a component-level function + state so auth check is reactive
function ProtectedAdminRoute() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) return <Navigate to="/signin" replace />;
  try {
    const parsedUser = JSON.parse(user);
    if (parsedUser.role === 'admin') return <AdminDashboard />;
    return <Navigate to="/dashboard" replace />;
  } catch (e) {
    return <Navigate to="/signin" replace />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard/*" element={<VolunteerDashboard />} />
        <Route path="/admin/dashboard/*" element={<ProtectedAdminRoute />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;