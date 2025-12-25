import { useState } from 'react'
import { AuthProvider } from './AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import CustomerPage from './Pages/CustomerPage';
import StaffDashboard from './Pages/StaffDashboard';

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
            <Route path="/staff/dashboard" element={<StaffDashboard />} />

          </Routes>
        </div>
      </Router>

    </AuthProvider>
  )
}

export default App
