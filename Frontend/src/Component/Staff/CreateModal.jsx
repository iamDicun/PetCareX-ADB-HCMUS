import React from 'react';

const CreateModal = ({ 
    show, 
    type, 
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customer,
    customerPets,
    selectedPet,
    setSelectedPet,
    appointmentDateTime,
    setAppointmentDateTime,
    availableDoctors,
    selectedDoctor,
    setSelectedDoctor,
    products,
    services,
    selectedItems,
    onFindCustomer,
    onCheckDoctors,
    onAddItem,
    onRemoveItem,
    onQuantityChange,
    onClose,
    onSubmit,
    modalOverlayStyle,
    modalContentStyle,
    buttonStyle,
    inputStyle
}) => {
    if (!show) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ color: '#2c3e50', marginTop: 0 }}>
                    {type === 'order' ? '🛒 Tạo đơn hàng' : '📅 Tạo lịch hẹn'}
                </h2>
                
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: 0, color: '#34495e' }}>👤 Thông tin khách hàng</h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tên khách hàng"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            style={inputStyle}
                            disabled={customer !== null}
                        />
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            style={inputStyle}
                            disabled={customer !== null}
                        />
                        {!customer && (
                            <button onClick={onFindCustomer} style={{...buttonStyle, backgroundColor: '#3498db', whiteSpace: 'nowrap'}}>
                                Tìm kiếm
                            </button>
                        )}
                    </div>
                    {customer && (
                        <div style={{ padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px', color: '#155724' }}>
                            ✓ Đã tìm thấy: <strong>{customer.HoTen}</strong> - {customer.SoDienThoai}
                        </div>
                    )}
                </div>

                {type === 'appointment' && customer && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0, color: '#34495e' }}>🐾 Chọn thú cưng</h4>
                        <select 
                            value={selectedPet}
                            onChange={(e) => setSelectedPet(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">-- Chọn thú cưng --</option>
                            {customerPets.map(pet => (
                                <option key={pet.MaThuCung} value={pet.MaThuCung}>
                                    {pet.TenThuCung} ({pet.Giong})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {type === 'appointment' && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0, color: '#34495e' }}>⏰ Chọn thời gian và bác sĩ</h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="datetime-local"
                                value={appointmentDateTime}
                                onChange={(e) => setAppointmentDateTime(e.target.value)}
                                style={inputStyle}
                            />
                            <button onClick={onCheckDoctors} style={{...buttonStyle, backgroundColor: '#f39c12', whiteSpace: 'nowrap'}}>
                                Kiểm tra bác sĩ
                            </button>
                        </div>
                        
                        {availableDoctors.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Chọn bác sĩ:</label>
                                <select 
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">-- Chọn bác sĩ --</option>
                                    {availableDoctors.map(doctor => (
                                        <option key={doctor.MaNhanVien} value={doctor.MaNhanVien}>
                                            👨‍⚕️ {doctor.HoTen} - {doctor.SoDienThoai}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#34495e' }}>{type === 'order' ? '📦 Chọn sản phẩm' : '💉 Chọn dịch vụ'}</h4>
                    <div style={{ maxHeight: '250px', overflow: 'auto', border: '2px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: '#fafafa' }}>
                        {type === 'order' ? (
                            products.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Đang tải sản phẩm...</p>
                            ) : (
                                products.map(product => (
                                    <div key={product.MaSanPham} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', backgroundColor: 'white' }}>
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ color: '#2c3e50' }}>{product.TenSanPham}</strong>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#7f8c8d' }}>{product.MoTa}</p>
                                            <p style={{ margin: '5px 0 0 0', color: '#27ae60', fontWeight: 'bold', fontSize: '16px' }}>
                                                {product.GiaBan?.toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                        <button onClick={() => onAddItem(product)} style={{...buttonStyle, backgroundColor: '#3498db', padding: '8px 16px', fontSize: '14px'}}>
                                            + Thêm
                                        </button>
                                    </div>
                                ))
                            )
                        ) : (
                            services.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Đang tải dịch vụ...</p>
                            ) : (
                                services.map(service => (
                                    <div key={service.MaDichVu} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', backgroundColor: 'white' }}>
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ color: '#2c3e50' }}>{service.TenDichVu}</strong>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#7f8c8d' }}>{service.MoTa}</p>
                                            <p style={{ margin: '5px 0 0 0', color: '#27ae60', fontWeight: 'bold', fontSize: '16px' }}>
                                                {service.GiaNiemYet?.toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                        <button onClick={() => onAddItem(service)} style={{...buttonStyle, backgroundColor: '#3498db', padding: '8px 16px', fontSize: '14px'}}>
                                            + Thêm
                                        </button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {selectedItems.length > 0 && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d1f2eb', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0, color: '#34495e' }}>✅ Đã chọn ({selectedItems.length})</h4>
                        {selectedItems.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #b2dfdb' }}>
                                <div style={{ flex: 1 }}>
                                    <strong>{type === 'order' ? item.TenSanPham : item.TenDichVu}</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                        {(type === 'order' ? item.GiaBan : item.GiaNiemYet)?.toLocaleString('vi-VN')} đ
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {type === 'order' && (
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => onQuantityChange(index, e.target.value)}
                                            style={{ width: '70px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}
                                        />
                                    )}
                                    <button onClick={() => onRemoveItem(index)} style={{...buttonStyle, backgroundColor: '#e74c3c', padding: '6px 12px', fontSize: '14px'}}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div style={{ textAlign: 'right', fontSize: '20px', fontWeight: 'bold', color: '#27ae60', marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #27ae60' }}>
                            💰 Tổng: {selectedItems.reduce((sum, item) => 
                                sum + (type === 'order' ? item.GiaBan * item.quantity : item.GiaNiemYet), 0
                            ).toLocaleString('vi-VN')} đ
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '20px', borderTop: '2px solid #ecf0f1' }}>
                    <button onClick={onClose} style={{...buttonStyle, backgroundColor: '#95a5a6'}}>
                        Hủy
                    </button>
                    <button onClick={onSubmit} style={{...buttonStyle, backgroundColor: '#27ae60', fontWeight: 'bold'}}>
                        ✓ Xác nhận tạo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;
