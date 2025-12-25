import React from 'react';

const AppointmentList = ({ 
    appointments, 
    onViewDetails, 
    onConfirm, 
    currentPage, 
    totalPages, 
    totalItems,
    onPageChange,
    buttonStyle, 
    cardStyle, 
    tableStyle, 
    thStyle, 
    tdStyle 
}) => {
    return (
        <div style={cardStyle}>
            <h3 style={{ color: '#2c3e50', marginTop: 0 }}>📅 Lịch hẹn chờ xác nhận ({totalItems || appointments.length})</h3>
            {appointments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>Không có lịch hẹn chờ xác nhận</p>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Ngày giờ hẹn</th>
                            <th style={thStyle}>Khách hàng</th>
                            <th style={thStyle}>SĐT</th>
                            <th style={thStyle}>Thú cưng</th>
                            <th style={thStyle}>Tổng tiền</th>
                            <th style={thStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(appointment => (
                            <tr 
                                key={appointment.MaLichHen} 
                                style={{ transition: 'background-color 0.2s' }} 
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'} 
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <td style={tdStyle}>{new Date(appointment.NgayGioHen).toLocaleString('vi-VN')}</td>
                                <td style={tdStyle}>{appointment.TenKhachHang}</td>
                                <td style={tdStyle}>{appointment.SoDienThoai}</td>
                                <td style={tdStyle}>{appointment.TenThuCung || 'N/A'}</td>
                                <td style={tdStyle}><strong>{appointment.TongTienThucTra?.toLocaleString('vi-VN')} đ</strong></td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button 
                                            onClick={() => onViewDetails(appointment, 'appointment')}
                                            style={{...buttonStyle, backgroundColor: '#3498db', padding: '6px 12px', fontSize: '14px'}}
                                        >
                                            👁️ Chi tiết
                                        </button>
                                        <button 
                                            onClick={() => onConfirm(appointment.MaLichHen)}
                                            style={{...buttonStyle, backgroundColor: '#27ae60', padding: '6px 12px', fontSize: '14px'}}
                                        >
                                            ✓ Xác nhận
                                        </button>
                                    </div>
                                </td>
                            </tr>
                    ))}
                    </tbody>
                </table>
            )}
            
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                    <button 
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            ...buttonStyle,
                            backgroundColor: currentPage === 1 ? '#95a5a6' : '#3498db',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.6 : 1,
                            padding: '8px 16px',
                            fontSize: '14px'
                        }}
                    >
                        ← Trước
                    </button>
                    
                    <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                        Trang {currentPage} / {totalPages}
                    </span>
                    
                    <button 
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            ...buttonStyle,
                            backgroundColor: currentPage === totalPages ? '#95a5a6' : '#3498db',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.6 : 1,
                            padding: '8px 16px',
                            fontSize: '14px'
                        }}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
