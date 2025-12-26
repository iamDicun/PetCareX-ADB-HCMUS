import React from 'react';

const InventoryTab = ({ 
    inventory, 
    inventoryPagination,
    currentInventoryPage,
    onInventoryPageChange,
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
            <h2>Tồn kho Chi nhánh</h2>
            {inventory && inventory.length > 0 ? (
                <>
                    <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Mã SP</th>
                            <th style={thStyle}>Tên sản phẩm</th>
                            <th style={thStyle}>Loại</th>
                            <th style={thStyle}>SL Vật lý</th>
                            <th style={thStyle}>SL Tạm giữ</th>
                            <th style={thStyle}>SL Khả dụng</th>
                            <th style={thStyle}>Giá</th>
                            <th style={thStyle}>Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item, index) => (
                            <tr 
                                key={index} 
                                style={{ backgroundColor: item.SoLuongKhaDung < 10 ? '#ffe6e6' : 'transparent' }}
                            >
                                <td style={tdStyle}>{item.MaSanPham}</td>
                                <td style={tdStyle}>{item.TenSanPham}</td>
                                <td style={tdStyle}>{item.TenLoaiSanPham}</td>
                                <td style={tdStyle}>{item.SoLuongVatLy || 0}</td>
                                <td style={tdStyle}>{item.SoLuongTamGiu || 0}</td>
                                <td style={tdStyle}>
                                    <strong style={{ color: item.SoLuongKhaDung < 10 ? '#e74c3c' : '#27ae60' }}>
                                        {item.SoLuongKhaDung || 0}
                                    </strong>
                                </td>
                                <td style={tdStyle}>{(item.GiaBan || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td style={tdStyle}>
                                    {item.NgayCapNhatCuoi ? new Date(item.NgayCapNhatCuoi).toLocaleDateString('vi-VN') : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {inventoryPagination && inventoryPagination.totalPages > 1 && (
                    <div style={paginationStyle}>
                        <button
                            onClick={() => onInventoryPageChange(currentInventoryPage - 1)}
                            disabled={currentInventoryPage === 1}
                            style={currentInventoryPage === 1 ? disabledButtonStyle : buttonStyle}
                        >
                            Trang trước
                        </button>
                        <span>
                            Trang {currentInventoryPage} / {inventoryPagination.totalPages}
                            ({inventoryPagination.total} sản phẩm)
                        </span>
                        <button
                            onClick={() => onInventoryPageChange(currentInventoryPage + 1)}
                            disabled={currentInventoryPage === inventoryPagination.totalPages}
                            style={currentInventoryPage === inventoryPagination.totalPages ? disabledButtonStyle : buttonStyle}
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </>
            ) : (
                <p>Không có dữ liệu tồn kho.</p>
            )}
        </div>
    );
};

export default InventoryTab;
