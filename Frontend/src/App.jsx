import { useState } from 'react'
import { AuthProvider } from './AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import CustomerPage from './Pages/CustomerPage';
import StaffDashboard from './Pages/StaffDashboard';
import DoctorPage from './Pages/DoctorPage';
import BranchManagerPage from './Pages/BranchManagerPage';
import CompanyManagerPage from './Pages/CompanyManagerPage';
import CareStaffPage from './Pages/CareStaffPage';

function App() {

  return (
    <AuthProvider>
      <Router>
        
        <div className="App">
          <Routes>
            {/* Main Login Page */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/CustomerPage" element={<CustomerPage />} />
            <Route path="/Staff/Dashboard" element={<StaffDashboard />} />
            <Route path="/Doctor/Dashboard" element={<DoctorPage />} />
            <Route path="/BranchManager/Dashboard" element={<BranchManagerPage />} />
            <Route path="/CompanyManager/Dashboard" element={<CompanyManagerPage />} />
            <Route path="/CareStaff/Dashboard" element={<CareStaffPage />} />

          </Routes>
        </div>
      </Router>

    </AuthProvider>
  )
}

export default App
