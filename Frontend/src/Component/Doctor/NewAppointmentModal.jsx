import React from 'react';

const NewAppointmentModal = ({ 
    show, 
    onClose,
    customerSearch,
    onCustomerSearchChange,
    customers,
    onSelectCustomer,
    selectedCustomer,
    customerPets,
    availableServices,
    appointmentForm,
    onAppointmentFormChange,
    onToggleService,
    onSave
}) => {
    if (!show) return null;

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const modalStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px'
    };

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    };

    const primaryButtonStyle = {
        padding: '10px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginRight: '10px'
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h2>➕ Tạo Lịch Hẹn Mới</h2>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tìm khách hàng:</label>
                    <input
                        type="text"
                        style={inputStyle}
                        placeholder="Nhập tên hoặc SĐT khách hàng..."
                        value={customerSearch}
                        onChange={(e) => onCustomerSearchChange(e.target.value)}
                    />
                    {customers.length > 0 && !selectedCustomer && (
                        <div style={{ border: '1px solid #ddd', maxHeight: '150px', overflowY: 'auto', marginBottom: '15px' }}>
                            {customers.map(customer => (
                                <div
                                    key={customer.MaKhachHang}
                                    style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    onClick={() => onSelectCustomer(customer)}
                                >
                                    <div>{customer.HoTen}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{customer.SoDienThoai}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedCustomer && (
                    <>
                        <div style={{ padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px', marginBottom: '15px' }}>
                            <strong>Khách hàng đã chọn:</strong> {selectedCustomer.HoTen} - {selectedCustomer.SoDienThoai}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chọn thú cưng:</label>
                            <select
                                style={inputStyle}
                                value={appointmentForm.petId}
                                onChange={(e) => onAppointmentFormChange({ ...appointmentForm, petId: e.target.value })}
                            >
                                <option value="">Chọn thú cưng...</option>
                                {customerPets.map(pet => (
                                    <option key={pet.MaThuCung} value={pet.MaThuCung}>
                                        {pet.TenThuCung} - {pet.LoaiThuCung} ({pet.Giong})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ngày giờ hẹn:</label>
                            <input
                                type="datetime-local"
                                style={inputStyle}
                                value={appointmentForm.dateTime}
                                onChange={(e) => onAppointmentFormChange({ ...appointmentForm, dateTime: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chọn dịch vụ:</label>
                            <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                {availableServices.map(service => (
                                    <div key={service.MaDichVu} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={appointmentForm.services.some(s => s.serviceId === service.MaDichVu)}
                                                onChange={() => onToggleService(service)}
                                                style={{ marginRight: '10px' }}
                                            />
                                            <div>
                                                <div>{service.TenDichVu}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    {service.GiaNiemYet.toLocaleString('vi-VN')}đ - {service.LoaiDichVu}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} style={buttonStyle}>
                        Hủy
                    </button>
                    <button onClick={onSave} style={primaryButtonStyle}>
                        Tạo lịch hẹn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewAppointmentModal;
