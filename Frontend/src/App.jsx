import { useState } from 'react'
import { AuthProvider } from './AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import CustomerPage from './Pages/CustomerPage';

function App() {

  return (
    <AuthProvider>
      <Router>
        
        <div className="App">
          <Routes>
            {/* Route for the login page */}
            <Route path="/" element={<LoginPage />} />

            <Route path="/CustomerPage" element={<CustomerPage />} />

          </Routes>
        </div>
      </Router>

    </AuthProvider>
  )
}

export default App
