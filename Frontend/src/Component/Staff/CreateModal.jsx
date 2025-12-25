import React, { useState, useEffect } from 'react';

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
    products,
    services,
    selectedItems,
    onFindCustomer,
    onAddItem,
    onRemoveItem,
    onQuantityChange,
    onClose,
    onSubmit,
    modalOverlayStyle,
    modalContentStyle,
    buttonStyle,
    inputStyle,
    branchId,
    apiUrl,
    token
}) => {
    // For appointment service items with staff assignment
    const [serviceStaffAssignments, setServiceStaffAssignments] = useState([]);

    useEffect(() => {
        if (show && type === 'appointment') {
            setServiceStaffAssignments([]);
        }
    }, [show, type]);

    if (!show) return null;

    const checkServiceType = (serviceName) => {
        const medicalKeywords = ['khám', 'xét nghiệm', 'siêu âm', 'vaccine'];
        const lowerServiceName = serviceName.toLowerCase();
        return medicalKeywords.some(keyword => lowerServiceName.includes(keyword));
    };

    const handleAddServiceWithStaff = async (service) => {
        const needsDoctor = checkServiceType(service.TenDichVu);
        
        // Add to selected items first
        onAddItem(service);
        
        // Create a new assignment entry
        const newAssignment = {
            service: service,
            needsDoctor: needsDoctor,
            dateTime: '',
            availableStaff: [],
            selectedStaff: '',
            loadingStaff: false
        };
        
        setServiceStaffAssignments([...serviceStaffAssignments, newAssignment]);
    };

    const handleRemoveServiceWithStaff = (index) => {
        onRemoveItem(index);
        setServiceStaffAssignments(serviceStaffAssignments.filter((_, i) => i !== index));
    };

    const handleDateTimeChange = async (index, dateTime) => {
        const newAssignments = [...serviceStaffAssignments];
        newAssignments[index].dateTime = dateTime;
        newAssignments[index].loadingStaff = true;
        setServiceStaffAssignments(newAssignments);

        // Fetch available staff
        try {
            const endpoint = newAssignments[index].needsDoctor 
                ? 'doctors/available' 
                : 'carestaff/available';
            
            const res = await fetch(
                `${apiUrl}/staff/${endpoint}?branchId=${branchId}&dateTime=${dateTime}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const data = await res.json();
            if (data.success) {
                newAssignments[index].availableStaff = newAssignments[index].needsDoctor 
                    ? data.doctors 
                    : data.careStaff;
                newAssignments[index].loadingStaff = false;
                setServiceStaffAssignments([...newAssignments]);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            newAssignments[index].loadingStaff = false;
            setServiceStaffAssignments([...newAssignments]);
        }
    };

    const handleStaffChange = (index, staffId) => {
        const newAssignments = [...serviceStaffAssignments];
        newAssignments[index].selectedStaff = staffId;
        setServiceStaffAssignments(newAssignments);
    };

    const handleSubmitWithValidation = () => {
        if (type === 'appointment') {
            // Validate all assignments
            for (let i = 0; i < serviceStaffAssignments.length; i++) {
                const assignment = serviceStaffAssignments[i];
                if (!assignment.dateTime) {
                    alert(`Vui lòng chọn thời gian cho dịch vụ: ${assignment.service.TenDichVu}`);
                    return;
                }
                if (!assignment.selectedStaff) {
                    alert(`Vui lòng chọn nhân viên cho dịch vụ: ${assignment.service.TenDichVu}`);
                    return;
                }
            }
            
            // Pass assignments to parent
            onSubmit(serviceStaffAssignments);
        } else {
            onSubmit();
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={{...modalContentStyle, maxHeight: '90vh', overflowY: 'auto'}}>
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
                                        <button 
                                            onClick={() => type === 'appointment' ? handleAddServiceWithStaff(service) : onAddItem(service)} 
                                            style={{...buttonStyle, backgroundColor: '#3498db', padding: '8px 16px', fontSize: '14px'}}
                                        >
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
                            <div key={index} style={{ marginBottom: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #b2dfdb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: type === 'appointment' ? '10px' : '0' }}>
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
                                        <button 
                                            onClick={() => type === 'appointment' ? handleRemoveServiceWithStaff(index) : onRemoveItem(index)} 
                                            style={{...buttonStyle, backgroundColor: '#e74c3c', padding: '6px 12px', fontSize: '14px'}}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {type === 'appointment' && serviceStaffAssignments[index] && (
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>
                                                ⏰ Thời gian:
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={serviceStaffAssignments[index].dateTime}
                                                onChange={(e) => handleDateTimeChange(index, e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                        
                                        {serviceStaffAssignments[index].dateTime && (
                                            <div>
                                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>
                                                    {serviceStaffAssignments[index].needsDoctor ? '👨‍⚕️ Chọn bác sĩ:' : '👤 Chọn nhân viên chăm sóc:'}
                                                </label>
                                                {serviceStaffAssignments[index].loadingStaff ? (
                                                    <p style={{ color: '#666', fontSize: '13px' }}>Đang tải...</p>
                                                ) : serviceStaffAssignments[index].availableStaff.length === 0 ? (
                                                    <p style={{ color: '#e74c3c', fontSize: '13px' }}>
                                                        Không có {serviceStaffAssignments[index].needsDoctor ? 'bác sĩ' : 'nhân viên'} trống
                                                    </p>
                                                ) : (
                                                    <select
                                                        value={serviceStaffAssignments[index].selectedStaff}
                                                        onChange={(e) => handleStaffChange(index, e.target.value)}
                                                        style={inputStyle}
                                                    >
                                                        <option value="">-- Chọn {serviceStaffAssignments[index].needsDoctor ? 'bác sĩ' : 'nhân viên'} --</option>
                                                        {serviceStaffAssignments[index].availableStaff.map(staff => (
                                                            <option key={staff.MaNhanVien} value={staff.MaNhanVien}>
                                                                {staff.HoTen} - {staff.SoDienThoai}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
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
                    <button onClick={handleSubmitWithValidation} style={{...buttonStyle, backgroundColor: '#27ae60', fontWeight: 'bold'}}>
                        ✓ Xác nhận tạo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;
