import React, { useState, useMemo } from 'react';

const RevenueTab = ({ revenueData, renderDateFilter, tableStyle, thStyle, tdStyle }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Tính tổng doanh thu
    const summary = useMemo(() => {
        return revenueData.reduce((acc, row) => ({
            totalService: acc.totalService + (row.DoanhThuDichVu || 0),
            totalProduct: acc.totalProduct + (row.DoanhThuBanHang || 0),
            totalRevenue: acc.totalRevenue + (row.TongCong || 0)
        }), { totalService: 0, totalProduct: 0, totalRevenue: 0 });
    }, [revenueData]);

    // Phân trang
    const paginatedData = revenueData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const totalPages = Math.ceil(revenueData.length / rowsPerPage);

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // Styles
    const summaryBoxStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px'
    };

    const summaryCardStyle = (bgColor) => ({
        backgroundColor: bgColor,
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    });

    const summaryLabelStyle = {
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px'
    };

    const summaryValueStyle = (color) => ({
        fontSize: '24px',
        fontWeight: 'bold',
        color: color
    });

    const paginationStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        marginTop: '10px'
    };

    const paginationButtonStyle = (disabled) => ({
        padding: '6px 12px',
        margin: '0 4px',
        border: '1px solid #ddd',
        backgroundColor: disabled ? '#f5f5f5' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '4px',
        fontSize: '14px',
        opacity: disabled ? 0.5 : 1
    });

    const activePageStyle = {
        padding: '6px 12px',
        margin: '0 4px',
        border: '1px solid #1976d2',
        backgroundColor: '#1976d2',
        color: 'white',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500'
    };

    const inputStyle = {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    return (
        <div>
            <h2>Doanh thu Chi nhánh</h2>
            {renderDateFilter()}
            
            {/* Thông tin tổng quan */}
            {revenueData.length > 0 && (
                <div style={summaryBoxStyle}>
                    <div style={summaryCardStyle('#e3f2fd')}>
                        <div style={summaryLabelStyle}>Tổng Doanh Thu Dịch Vụ</div>
                        <div style={summaryValueStyle('#1976d2')}>
                            {formatCurrency(summary.totalService)}
                        </div>
                    </div>
                    <div style={summaryCardStyle('#f3e5f5')}>
                        <div style={summaryLabelStyle}>Tổng Doanh Thu Bán Hàng</div>
                        <div style={summaryValueStyle('#9c27b0')}>
                            {formatCurrency(summary.totalProduct)}
                        </div>
                    </div>
                    <div style={summaryCardStyle('#e8f5e9')}>
                        <div style={summaryLabelStyle}>Tổng Doanh Thu</div>
                        <div style={summaryValueStyle('#2e7d32')}>
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            {revenueData.length} ngày
                        </div>
                    </div>
                </div>
            )}

            {/* Bảng dữ liệu */}
            {revenueData.length > 0 ? (
                <>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Ngày</th>
                                <th style={thStyle}>Doanh thu Bán hàng</th>
                                <th style={thStyle}>Doanh thu Dịch vụ</th>
                                <th style={thStyle}>Tổng cộng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, index) => (
                                <tr key={index}>
                                    <td style={tdStyle}>{new Date(row.Ngay).toLocaleDateString('vi-VN')}</td>
                                    <td style={tdStyle}>{(row.DoanhThuBanHang || 0).toLocaleString('vi-VN')} VNĐ</td>
                                    <td style={tdStyle}>{(row.DoanhThuDichVu || 0).toLocaleString('vi-VN')} VNĐ</td>
                                    <td style={tdStyle}><strong>{(row.TongCong || 0).toLocaleString('vi-VN')} VNĐ</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {revenueData.length > 0 && (
                        <div style={paginationStyle}>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                Hiển thị {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, revenueData.length)} trong tổng số {revenueData.length}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontSize: '14px', color: '#666' }}>Số dòng:</label>
                                <select 
                                    value={rowsPerPage} 
                                    onChange={handleChangeRowsPerPage}
                                    style={{...inputStyle, width: 'auto'}}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => handleChangePage(0)}
                                        disabled={page === 0}
                                        style={paginationButtonStyle(page === 0)}
                                    >
                                        ««
                                    </button>
                                    <button
                                        onClick={() => handleChangePage(page - 1)}
                                        disabled={page === 0}
                                        style={paginationButtonStyle(page === 0)}
                                    >
                                        ‹
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (
                                            i === 0 || 
                                            i === totalPages - 1 || 
                                            (i >= page - 2 && i <= page + 2)
                                        ) {
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleChangePage(i)}
                                                    style={i === page ? activePageStyle : paginationButtonStyle(false)}
                                                >
                                                    {i + 1}
                                                </button>
                                            );
                                        } else if (i === page - 3 || i === page + 3) {
                                            return <span key={i} style={{ padding: '6px' }}>...</span>;
                                        }
                                        return null;
                                    })}
                                    
                                    <button
                                        onClick={() => handleChangePage(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        style={paginationButtonStyle(page >= totalPages - 1)}
                                    >
                                        ›
                                    </button>
                                    <button
                                        onClick={() => handleChangePage(totalPages - 1)}
                                        disabled={page >= totalPages - 1}
                                        style={paginationButtonStyle(page >= totalPages - 1)}
                                    >
                                        »»
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>Không có dữ liệu doanh thu trong khoảng thời gian này.</p>
            )}
        </div>
    );
};

export default RevenueTab;
