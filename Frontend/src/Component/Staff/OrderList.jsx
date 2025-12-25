import React from 'react';

const OrderList = ({ orders, onViewDetails, onConfirm, buttonStyle, cardStyle, tableStyle, thStyle, tdStyle }) => {
    return (
        <div style={cardStyle}>
            <h3 style={{ color: '#2c3e50', marginTop: 0 }}>📦 Đơn hàng chờ xử lý ({orders.length})</h3>
            {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>Không có đơn hàng chờ xử lý</p>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Ngày đặt</th>
                            <th style={thStyle}>Khách hàng</th>
                            <th style={thStyle}>SĐT</th>
                            <th style={thStyle}>Loại đơn</th>
                            <th style={thStyle}>Tổng tiền</th>
                            <th style={thStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr 
                                key={order.MaDonHang} 
                                style={{ transition: 'background-color 0.2s' }} 
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'} 
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <td style={tdStyle}>{new Date(order.NgayDat).toLocaleString('vi-VN')}</td>
                                <td style={tdStyle}>{order.TenKhachHang}</td>
                                <td style={tdStyle}>{order.SoDienThoai}</td>
                                <td style={tdStyle}>
                                    <span style={{ 
                                        backgroundColor: order.LoaiDon === 'Online' ? '#3498db' : '#27ae60', 
                                        color: 'white', 
                                        padding: '4px 12px', 
                                        borderRadius: '12px', 
                                        fontSize: '12px' 
                                    }}>
                                        {order.LoaiDon}
                                    </span>
                                </td>
                                <td style={tdStyle}><strong>{order.TongTienThucTra?.toLocaleString('vi-VN')} đ</strong></td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button 
                                            onClick={() => onViewDetails(order, 'order')}
                                            style={{...buttonStyle, backgroundColor: '#3498db', padding: '6px 12px', fontSize: '14px'}}
                                        >
                                            👁️ Chi tiết
                                        </button>
                                        <button 
                                            onClick={() => onConfirm(order.MaDonHang)}
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
        </div>
    );
};

export default OrderList;
