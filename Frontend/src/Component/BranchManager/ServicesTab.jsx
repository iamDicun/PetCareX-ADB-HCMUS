import React from 'react';

const ServicesTab = ({ hotServices, renderDateFilter, tableStyle, thStyle, tdStyle }) => {
    return (
        <div>
            <h2>Thống kê dịch vụ</h2>
            {renderDateFilter()}
            
            {hotServices.length > 0 ? (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Tên dịch vụ</th>
                            <th style={thStyle}>Loại dịch vụ</th>
                            <th style={thStyle}>Giá niêm yết</th>
                            <th style={thStyle}>Số lượt đặt</th>
                            <th style={thStyle}>Tổng số lần</th>
                            <th style={thStyle}>Doanh thu</th>
                            <th style={thStyle}>Giá TB</th>
                            <th style={thStyle}>Số khách hàng</th>
                            <th style={thStyle}>Ngày đặt đầu tiên</th>
                            <th style={thStyle}>Ngày đặt gần nhất</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotServices.map((service, index) => (
                            <tr key={service.MaDichVu || index}>
                                <td style={tdStyle}><strong>{service.TenDichVu}</strong></td>
                                <td style={tdStyle}>{service.LoaiDichVu || 'N/A'}</td>
                                <td style={tdStyle}>{(service.GiaNiemYet || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td style={tdStyle}>
                                    <strong style={{ color: '#2563eb', fontSize: '1.1em' }}>
                                        {service.SoLuotDat || 0}
                                    </strong>
                                </td>
                                <td style={tdStyle}>{service.TongSoLanDichVu || 0}</td>
                                <td style={tdStyle}>
                                    <strong style={{ color: '#16a34a' }}>
                                        {(service.TongDoanhThu || 0).toLocaleString('vi-VN')} VNĐ
                                    </strong>
                                </td>
                                <td style={tdStyle}>{(service.GiaTrungBinh || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td style={tdStyle}>{service.SoKhachHangSuDung || 0}</td>
                                <td style={tdStyle}>
                                    {service.NgayDatDauTien 
                                        ? new Date(service.NgayDatDauTien).toLocaleDateString('vi-VN')
                                        : 'N/A'}
                                </td>
                                <td style={tdStyle}>
                                    {service.NgayDatGanNhat 
                                        ? new Date(service.NgayDatGanNhat).toLocaleDateString('vi-VN')
                                        : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Chưa có dữ liệu dịch vụ.</p>
            )}
            
            {hotServices.length > 0 && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <h3 style={{ marginTop: 0, color: '#0369a1' }}>Thống kê tổng quan</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div>
                            <strong>Tổng số dịch vụ:</strong> {hotServices.length}
                        </div>
                        <div>
                            <strong>Tổng lượt đặt:</strong> {hotServices.reduce((sum, s) => sum + (s.SoLuotDat || 0), 0)}
                        </div>
                        <div>
                            <strong>Tổng doanh thu:</strong>{' '}
                            {hotServices.reduce((sum, s) => sum + (s.TongDoanhThu || 0), 0).toLocaleString('vi-VN')} VNĐ
                        </div>
                        <div>
                            <strong>Tổng khách hàng:</strong>{' '}
                            {hotServices.reduce((sum, s) => sum + (s.SoKhachHangSuDung || 0), 0)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesTab;
