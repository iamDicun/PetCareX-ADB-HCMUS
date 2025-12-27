import React from 'react';

const ImportHistoryTab = ({ 
    importHistory, 
    importPagination,
    currentImportPage,
    onImportPageChange,
    onViewDetails,
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Mới':
                return '#3498db'; // Blue
            case 'Đã duyệt':
                return '#f39c12'; // Orange
            case 'Đang nhập':
                return '#9b59b6'; // Purple
            case 'Hoàn tất':
                return '#27ae60'; // Green
            case 'Hủy':
                return '#e74c3c'; // Red
            default:
                return '#95a5a6'; // Gray
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div>
            <h2>Lịch sử yêu cầu nhập hàng</h2>
            {importHistory && importHistory.length > 0 ? (
                <>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Mã yêu cầu</th>
                                <th style={thStyle}>Ngày yêu cầu</th>
                                <th style={thStyle}>Trạng thái</th>
                                <th style={thStyle}>Số loại SP</th>
                                <th style={thStyle}>Tổng SL</th>
                                <th style={thStyle}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {importHistory.map((item, index) => (
                                <tr key={index}>
                                    <td style={tdStyle}>{item.MaYeuCau}</td>
                                    <td style={tdStyle}>{formatDate(item.NgayYeuCau)}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            backgroundColor: getStatusColor(item.TrangThai),
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {item.TrangThai}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{item.SoLoaiSanPham || 0}</td>
                                    <td style={tdStyle}>
                                        <strong>{item.TongSoLuong || 0}</strong>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => onViewDetails(item.MaYeuCau)}
                                            style={buttonStyle}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {importPagination && importPagination.totalPages > 1 && (
                        <div style={paginationStyle}>
                            <button
                                onClick={() => onImportPageChange(currentImportPage - 1)}
                                disabled={currentImportPage === 1}
                                style={currentImportPage === 1 ? disabledButtonStyle : buttonStyle}
                            >
                                Trang trước
                            </button>
                            <span>
                                Trang {currentImportPage} / {importPagination.totalPages}
                                ({importPagination.total} yêu cầu)
                            </span>
                            <button
                                onClick={() => onImportPageChange(currentImportPage + 1)}
                                disabled={currentImportPage === importPagination.totalPages}
                                style={currentImportPage === importPagination.totalPages ? disabledButtonStyle : buttonStyle}
                            >
                                Trang sau
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p>Chưa có yêu cầu nhập hàng nào.</p>
            )}
        </div>
    );
};

export default ImportHistoryTab;
