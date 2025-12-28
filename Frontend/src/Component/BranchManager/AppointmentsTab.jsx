import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentsTab = ({ 
    branchCode, 
    startDate, 
    endDate, 
    renderDateFilter, 
    tableStyle, 
    thStyle, 
    tdStyle 
}) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (branchCode && startDate && endDate) {
            fetchAppointments();
        }
    }, [branchCode, startDate, endDate]);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/branch/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    branchCode,
                    startDate,
                    endDate
                }
            });
            setAppointments(response.data.data || []);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setError('Không thể tải danh sách lịch hẹn');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = appointments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(appointments.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Chờ xác nhận':
                return '#f39c12';
            case 'Đã xác nhận':
                return '#3498db';
            case 'Hoàn tất':
                return '#27ae60';
            case 'Hủy':
                return '#e74c3c';
            default:
                return '#95a5a6';
        }
    };

    const statusBadgeStyle = (status) => ({
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        backgroundColor: getStatusColor(status),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
    });

    const paginationStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginTop: '20px'
    };

    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#bdc3c7',
        cursor: 'not-allowed'
    };

    if (loading) {
        return (
            <div>
                <h2>Danh sách Lịch hẹn</h2>
                {renderDateFilter()}
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Danh sách Lịch hẹn</h2>
                {renderDateFilter()}
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Danh sách Lịch hẹn</h2>
            {renderDateFilter()}
            {appointments.length > 0 ? (
                <>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Mã lịch hẹn</th>
                                <th style={thStyle}>Khách hàng</th>
                                <th style={thStyle}>Thú cưng</th>
                                <th style={thStyle}>Bác sĩ</th>
                                <th style={thStyle}>Ngày hẹn</th>
                                <th style={thStyle}>Giờ hẹn</th>
                                <th style={thStyle}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((appointment, index) => (
                                <tr key={index}>
                                    <td style={tdStyle}>{appointment.MaLichHen}</td>
                                    <td style={tdStyle}>{appointment.TenKhachHang}</td>
                                    <td style={tdStyle}>{appointment.TenThuCung}</td>
                                    <td style={tdStyle}>{appointment.TenBacSi || 'Chưa phân công'}</td>
                                    <td style={tdStyle}>
                                        {new Date(appointment.NgayHen).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={tdStyle}>{appointment.GioHen}</td>
                                    <td style={tdStyle}>
                                        <span style={statusBadgeStyle(appointment.TrangThai)}>
                                            {appointment.TrangThai}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {totalPages > 1 && (
                        <div style={paginationStyle}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
                            >
                                Trang trước
                            </button>
                            <span>
                                Trang {currentPage} / {totalPages} 
                                ({appointments.length} lịch hẹn)
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
                            >
                                Trang sau
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p>Không có lịch hẹn nào trong khoảng thời gian này.</p>
            )}
        </div>
    );
};

export default AppointmentsTab;
