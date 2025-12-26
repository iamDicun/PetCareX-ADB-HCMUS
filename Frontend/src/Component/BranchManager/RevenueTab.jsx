import React from 'react';

const RevenueTab = ({ revenueData, renderDateFilter, tableStyle, thStyle, tdStyle }) => {
    return (
        <div>
            <h2>Doanh thu Chi nhánh</h2>
            {renderDateFilter()}
            {revenueData.length > 0 ? (
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
                        {revenueData.map((row, index) => (
                            <tr key={index}>
                                <td style={tdStyle}>{new Date(row.Ngay).toLocaleDateString('vi-VN')}</td>
                                <td style={tdStyle}>{(row.DoanhThuBanHang || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td style={tdStyle}>{(row.DoanhThuDichVu || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td style={tdStyle}><strong>{(row.TongCong || 0).toLocaleString('vi-VN')} VNĐ</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Không có dữ liệu doanh thu trong khoảng thời gian này.</p>
            )}
        </div>
    );
};

export default RevenueTab;
