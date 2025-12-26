import React from 'react';

const AppointmentTable = ({ appointments, onCreateMedicalRecord, onCreatePrescription, onEditResults }) => {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: '#ecf0f1' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Thời gian</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Khách hàng</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Thú cưng</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Dịch vụ</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Kết quả</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Trạng thái</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {appointments.map((appt, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ecf0f1' }}>
                        <td style={{ padding: '12px' }}>{new Date(appt.NgayGioHen).toLocaleString('vi-VN')}</td>
                        <td style={{ padding: '12px' }}>
                            <div>{appt.TenKhachHang}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{appt.SoDienThoai}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                            <div>{appt.TenThuCung}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {appt.LoaiThuCung}{appt.Giong ? ` - ${appt.Giong}` : ''}
                            </div>
                        </td>
                        <td style={{ padding: '12px' }}>{appt.DichVu}</td>
                        <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#555', maxWidth: '200px' }}>
                                {appt.KetQua || 'Trống'}
                            </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                            <span style={{
                                padding: '5px 10px',
                                borderRadius: '4px',
                                backgroundColor: appt.TrangThai === 'Hoàn tất' ? '#d4edda' : '#fff3cd',
                                color: appt.TrangThai === 'Hoàn tất' ? '#155724' : '#856404'
                            }}>
                                {appt.TrangThai}
                            </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                            <button 
                                onClick={() => onCreateMedicalRecord(appt)}
                                style={{ 
                                    padding: '5px 10px', 
                                    backgroundColor: '#27ae60', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer', 
                                    marginRight: '5px',
                                    marginBottom: '5px',
                                    fontSize: '12px' 
                                }}
                            >
                                📋 Hồ sơ khám
                            </button>
                            <button 
                                onClick={() => onCreatePrescription(appt)}
                                style={{ 
                                    padding: '5px 10px', 
                                    backgroundColor: '#e67e22', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer', 
                                    marginRight: '5px',
                                    marginBottom: '5px',
                                    fontSize: '12px' 
                                }}
                            >
                                💊 Toa thuốc
                            </button>
                            <button 
                                onClick={() => onEditResults(appt)}
                                style={{ 
                                    padding: '5px 10px', 
                                    backgroundColor: '#3498db', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer', 
                                    fontSize: '12px' 
                                }}
                            >
                                ✏️ Kết quả
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AppointmentTable;
