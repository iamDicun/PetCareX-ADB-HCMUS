import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Staff Dashboard</h1>
            <p>Welcome, {user?.name}</p>
            <button onClick={handleLogout} className="btn btn-primary">Logout</button>
        </div>
    );
};

export default StaffDashboard;
