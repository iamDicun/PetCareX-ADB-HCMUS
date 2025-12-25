import React from 'react';

const DetailsModal = ({ show, type, data, onClose, modalOverlayStyle, modalContentStyle, tableStyle, thStyle, tdStyle, buttonStyle }) => {
    if (!show) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ color: '#2c3e50', marginTop: 0 }}>
                    {type === 'order' ? '📦 Chi tiết đơn hàng' : '📅 Chi tiết lịch hẹn'}
                </h2>
                
                {data.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>Đang tải...</p>
                ) : (
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>{type === 'order' ? 'Sản phẩm' : 'Dịch vụ'}</th>
                                {type === 'order' && <th style={thStyle}>Số lượng</th>}
                                {type === 'appointment' && <th style={thStyle}>Bác sĩ</th>}
                                <th style={thStyle}>Đơn giá</th>
                                {type === 'order' && <th style={thStyle}>Thành tiền</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr 
                                    key={index} 
                                    style={{ transition: 'background-color 0.2s' }} 
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'} 
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <td style={tdStyle}>
                                        <strong style={{ color: '#2c3e50' }}>{type === 'order' ? item.TenSanPham : item.TenDichVu}</strong>
                                        <br />
                                        <small style={{ color: '#7f8c8d' }}>{item.MoTa}</small>
                                    </td>
                                    {type === 'order' && <td style={tdStyle}><strong>{item.SoLuong}</strong></td>}
                                    {type === 'appointment' && <td style={tdStyle}>👨‍⚕️ {item.TenBacSi}</td>}
                                    <td style={tdStyle}><strong style={{ color: '#27ae60' }}>{(type === 'order' ? item.DonGiaBan : item.DonGiaThucTe)?.toLocaleString('vi-VN')} đ</strong></td>
                                    {type === 'order' && <td style={tdStyle}><strong style={{ color: '#27ae60', fontSize: '16px' }}>{item.ThanhTien?.toLocaleString('vi-VN')} đ</strong></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #ecf0f1' }}>
                    <button onClick={onClose} style={{...buttonStyle, backgroundColor: '#95a5a6'}}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;
