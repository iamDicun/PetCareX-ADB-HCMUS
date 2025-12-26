import React from 'react';

const EmployeesTab = ({ 
    employeeRatings, 
    employeePerformance,
    performancePagination,
    currentPerformancePage,
    onPerformancePageChange,
    renderDateFilter, 
    tableStyle, 
    thStyle, 
    tdStyle,
    cardStyle 
}) => {
    // Tạo map để lookup điểm đánh giá theo HoTen
    const ratingsMap = {};
    if (employeeRatings && employeeRatings.length > 0) {
        employeeRatings.forEach(emp => {
            const key = `${emp.HoTen}-${emp.ChucVu}`;
            ratingsMap[key] = emp.DiemThaiDoTB;
        });
    }

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
            <h2>Quản lý Nhân viên</h2>
            {renderDateFilter()}
            
            <div style={cardStyle}>
                <h3>Hiệu suất & Doanh số Nhân viên</h3>
                {employeePerformance && employeePerformance.length > 0 ? (
                    <>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Họ tên</th>
                                    <th style={thStyle}>Chức vụ</th>
                                    <th style={thStyle}>Chi nhánh</th>
                                    <th style={thStyle}>Doanh số Bán hàng</th>
                                    <th style={thStyle}>Doanh số Dịch vụ</th>
                                    <th style={thStyle}>Điểm ĐG TB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeePerformance.map((perf, index) => {
                                    const key = `${perf.HoTen}-${perf.ChucVu}`;
                                    const rating = ratingsMap[key];
                                    return (
                                        <tr key={index}>
                                            <td style={tdStyle}>{perf.HoTen}</td>
                                            <td style={tdStyle}>{perf.ChucVu}</td>
                                            <td style={tdStyle}>{perf.TenChiNhanh}</td>
                                            <td style={tdStyle}>{(perf.DoanhSoBan || 0).toLocaleString('vi-VN')} VNĐ</td>
                                            <td style={tdStyle}>{(perf.DoanhSoDichVu || 0).toLocaleString('vi-VN')} VNĐ</td>
                                            <td style={tdStyle}>
                                                {rating ? (
                                                    <strong style={{ 
                                                        color: rating >= 4 ? '#27ae60' : 
                                                               rating >= 3 ? '#f39c12' : '#e74c3c' 
                                                    }}>
                                                        {rating.toFixed(2)}
                                                    </strong>
                                                ) : (
                                                    <span style={{ color: '#95a5a6' }}>N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {performancePagination && performancePagination.totalPages > 1 && (
                            <div style={paginationStyle}>
                                <button
                                    onClick={() => onPerformancePageChange(currentPerformancePage - 1)}
                                    disabled={currentPerformancePage === 1}
                                    style={currentPerformancePage === 1 ? disabledButtonStyle : buttonStyle}
                                >
                                    Trang trước
                                </button>
                                <span>
                                    Trang {currentPerformancePage} / {performancePagination.totalPages}
                                    ({performancePagination.total} nhân viên)
                                </span>
                                <button
                                    onClick={() => onPerformancePageChange(currentPerformancePage + 1)}
                                    disabled={currentPerformancePage === performancePagination.totalPages}
                                    style={currentPerformancePage === performancePagination.totalPages ? disabledButtonStyle : buttonStyle}
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p>Chưa có dữ liệu nhân viên.</p>
                )}
            </div>
        </div>
    );
};

export default EmployeesTab;
