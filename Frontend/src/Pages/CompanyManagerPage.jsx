import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const CompanyManagerPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const containerStyle = {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    };

    const headerStyle = {
        backgroundColor: '#8e44ad',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
    };

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0' }}>🏆 Trang Quản Lý Cấp Công Ty</h1>
                    <p style={{ margin: 0 }}>Xin chào, {user?.HoTen}</p>
                </div>
                <button onClick={handleLogout} style={buttonStyle}>
                    Đăng xuất
                </button>
            </div>

            <div style={contentStyle}>
                <h2>💼 Chức năng dành cho Quản lý Cấp Công ty</h2>
                <p style={{ fontSize: '18px', color: '#666', marginTop: '20px' }}>
                    Trang này đang được phát triển. Các chức năng sẽ được thêm vào sau.
                </p>
                <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e8daef', borderRadius: '8px' }}>
                    <h3 style={{ color: '#2c3e50' }}>Thông tin tài khoản</h3>
                    <p><strong>Họ tên:</strong> {user?.HoTen}</p>
                    <p><strong>Chức vụ:</strong> {user?.ChucVu}</p>
                    <p><strong>Số điện thoại:</strong> {user?.SoDienThoai}</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyManagerPage;
