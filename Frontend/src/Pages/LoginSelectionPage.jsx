import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSelectionPage = () => {
  const navigate = useNavigate();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#2c3e50', // Solid dark background
    color: 'white'
  };

  const cardContainerStyle = {
    display: 'flex',
    gap: '40px',
    marginTop: '40px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    color: '#333',
    padding: '40px',
    borderRadius: '10px',
    width: '250px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    marginBottom: '10px'
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    opacity: 0.8
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>PetCareX</h1>
      <p style={subtitleStyle}>Welcome! Please select your login type.</p>
      
      <div style={cardContainerStyle}>
        <div 
          style={cardStyle} 
          onClick={() => navigate('/login/customer')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h2>Customer</h2>
          <p>Book appointments and manage your pets.</p>
        </div>

        <div 
          style={cardStyle} 
          onClick={() => navigate('/login/staff')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h2>Staff</h2>
          <p>Manage schedules and clinic operations.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelectionPage;
