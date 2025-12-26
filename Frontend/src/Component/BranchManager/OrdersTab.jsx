import React from 'react';

const OrdersTab = ({ 
    ordersData, 
    ordersPagination,
    currentOrderPage,
    onOrderPageChange,
    renderDateFilter, 
    tableStyle, 
    thStyle, 
    tdStyle 
}) => {
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

    return (
        <div>
            <h2>Danh sách Đơn hàng</h2>
            {renderDateFilter()}
            {ordersData && ordersData.length > 0 ? (
                <>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Mã đơn</th>
                                <th style={thStyle}>Khách hàng</th>
                                <th style={thStyle}>Ngày đặt</th>
                                <th style={thStyle}>Loại</th>
                                <th style={thStyle}>Trạng thái</th>
                                <th style={thStyle}>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersData.map((order, index) => (
                                <tr key={index}>
                                    <td style={tdStyle}>{order.MaDonHang}</td>
                                    <td style={tdStyle}>{order.TenKhachHang}</td>
                                    <td style={tdStyle}>{new Date(order.NgayDat).toLocaleDateString('vi-VN')}</td>
                                    <td style={tdStyle}>{order.LoaiDon}</td>
                                    <td style={tdStyle}>{order.TrangThai}</td>
                                    <td style={tdStyle}>{(order.TongTien || 0).toLocaleString('vi-VN')} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {ordersPagination && ordersPagination.totalPages > 1 && (
                        <div style={paginationStyle}>
                            <button
                                onClick={() => onOrderPageChange(currentOrderPage - 1)}
                                disabled={currentOrderPage === 1}
                                style={currentOrderPage === 1 ? disabledButtonStyle : buttonStyle}
                            >
                                Trang trước
                            </button>
                            <span>
                                Trang {currentOrderPage} / {ordersPagination.totalPages} 
                                ({ordersPagination.total} đơn hàng)
                            </span>
                            <button
                                onClick={() => onOrderPageChange(currentOrderPage + 1)}
                                disabled={currentOrderPage === ordersPagination.totalPages}
                                style={currentOrderPage === ordersPagination.totalPages ? disabledButtonStyle : buttonStyle}
                            >
                                Trang sau
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p>Không có đơn hàng nào trong khoảng thời gian này.</p>
            )}
        </div>
    );
};

export default OrdersTab;
