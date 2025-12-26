import React from 'react';

const ProductsTab = ({ topProducts, renderDateFilter, tableStyle, thStyle, tdStyle }) => {
    return (
        <div>
            <h2>Sản phẩm Bán chạy</h2>
            {renderDateFilter()}
            
            {topProducts.length > 0 ? (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Tên sản phẩm</th>
                            <th style={thStyle}>Loại</th>
                            <th style={thStyle}>Số lượng bán</th>
                            <th style={thStyle}>Doanh thu</th>
                            <th style={thStyle}>Số lượt đơn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((product, index) => (
                            <tr key={index}>
                                <td style={tdStyle}>{product.TenSanPham}</td>
                                <td style={tdStyle}>{product.TenLoaiSanPham}</td>
                                <td style={tdStyle}><strong>{product.TongSoLuongBan}</strong></td>
                                <td style={tdStyle}>{(product.TongDoanhThu || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td style={tdStyle}>{product.SoLuotDonHang}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Chưa có dữ liệu sản phẩm.</p>
            )}
        </div>
    );
};

export default ProductsTab;
