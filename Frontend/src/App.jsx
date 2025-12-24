import { useState } from 'react'
import { AuthProvider } from './AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import CustomerPage from './Pages/CustomerPage';
import LoginSelectionPage from './Pages/LoginSelectionPage';
import StaffDashboard from './Pages/StaffDashboard';

function App() {

  return (
    <AuthProvider>
      <Router>
        
        <div className="App">
          <Routes>
            {/* Route for the login selection page */}
            <Route path="/" element={<LoginSelectionPage />} />
            
            {/* Login Routes */}
            <Route path="/login/customer" element={<LoginPage role="customer" />} />
            <Route path="/login/staff" element={<LoginPage role="staff" />} />

            {/* Protected Routes (Ideally should be wrapped in a ProtectedRoute component) */}
            <Route path="/CustomerPage" element={<CustomerPage />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />

          </Routes>
        </div>
      </Router>

    </AuthProvider>
  )
}

export default App
