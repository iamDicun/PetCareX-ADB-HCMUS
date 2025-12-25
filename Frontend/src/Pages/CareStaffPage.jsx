import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const CareStaffPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (user?.MaNhanVien) {
            loadUpcomingAppointments();
        }
    }, [user]);

    const loadUpcomingAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/carestaff/appointments?staffId=${user.MaNhanVien}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            if (data.success) {
                setUpcomingAppointments(data.appointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Chờ xác nhận': return '#f39c12';
            case 'Đã xác nhận': return '#3498db';
            case 'Đang thực hiện': return '#2ecc71';
            case 'Hoàn thành': return '#27ae60';
            case 'Đã hủy': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        backgroundColor: '#ecf0f1',
        padding: '20px'
    };

    const headerStyle = {
        backgroundColor: '#16a085',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    const appointmentCardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: '4px solid #16a085'
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
                    <h1 style={{ margin: '0 0 10px 0' }}>🐾 Nhân viên Chăm sóc Thú cưng</h1>
                    <p style={{ margin: 0 }}>Xin chào, {user?.HoTen}</p>
                </div>
                <button onClick={handleLogout} style={buttonStyle}>
                    Đăng xuất
                </button>
            </div>

            <div style={cardStyle}>
                <h2 style={{ color: '#2c3e50', marginTop: 0 }}>📅 Lịch hẹn sắp tới của bạn</h2>
                
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px 0' }}>
                        Đang tải...
                    </p>
                ) : upcomingAppointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>📭</p>
                        <p style={{ color: '#7f8c8d', fontSize: '18px' }}>
                            Chưa có lịch hẹn nào
                        </p>
                    </div>
                ) : (
                    <div>
                        {upcomingAppointments.map((appointment, index) => (
                            <div key={index} style={appointmentCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                                            🕐 {formatDateTime(appointment.NgayGioHen)}
                                        </h3>
                                        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                                            <p style={{ margin: '5px 0' }}>
                                                <strong>👤 Khách hàng:</strong> {appointment.TenKhachHang}
                                            </p>
                                            <p style={{ margin: '5px 0' }}>
                                                <strong>📞 SĐT:</strong> {appointment.SoDienThoaiKH}
                                            </p>
                                            <p style={{ margin: '5px 0' }}>
                                                <strong>🐕 Thú cưng:</strong> {appointment.TenThuCung} ({appointment.Giong})
                                            </p>
                                            <p style={{ margin: '5px 0' }}>
                                                <strong>💉 Dịch vụ:</strong> {appointment.TenDichVu}
                                            </p>
                                            {appointment.GhiChu && (
                                                <p style={{ margin: '5px 0' }}>
                                                    <strong>📝 Ghi chú:</strong> {appointment.GhiChu}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '8px 16px', 
                                        backgroundColor: getStatusColor(appointment.TrangThai), 
                                        color: 'white', 
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        marginLeft: '20px'
                                    }}>
                                        {appointment.TrangThai}
                                    </div>
                                </div>
                                {appointment.KetQua && (
                                    <div style={{ 
                                        marginTop: '15px', 
                                        padding: '15px', 
                                        backgroundColor: '#e8f8f5', 
                                        borderRadius: '6px',
                                        borderLeft: '3px solid #27ae60'
                                    }}>
                                        <strong style={{ color: '#27ae60' }}>✅ Kết quả:</strong>
                                        <p style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>{appointment.KetQua}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ ...cardStyle, backgroundColor: '#e8f4f8', marginTop: '20px' }}>
                <h3 style={{ color: '#2c3e50', marginTop: 0 }}>ℹ️ Thông tin tài khoản</h3>
                <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
                    <p><strong>Họ tên:</strong> {user?.HoTen}</p>
                    <p><strong>Chức vụ:</strong> {user?.ChucVu}</p>
                    <p><strong>Số điện thoại:</strong> {user?.SoDienThoai}</p>
                </div>
            </div>
        </div>
    );
};

export default CareStaffPage;
