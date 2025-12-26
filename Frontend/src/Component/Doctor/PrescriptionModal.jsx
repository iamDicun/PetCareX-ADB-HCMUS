import React from 'react';

const PrescriptionModal = ({ 
    show, 
    onClose, 
    selectedAppointment,
    existingPrescription,
    isEditingPrescription,
    setIsEditingPrescription,
    medications,
    selectedMedications,
    onAddMedication,
    onUpdateMedication,
    onRemoveMedication,
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
                <h2>💊 {existingPrescription ? 'Toa Thuốc' : 'Tạo Toa Thuốc'}</h2>
                <div style={{ marginBottom: '15px' }}>
                    <strong>Thú cưng:</strong> {selectedAppointment?.TenThuCung}
                </div>
                
                {existingPrescription && !isEditingPrescription ? (
                    <div>
                        <div style={{ border: '1px solid #27ae60', padding: '15px', borderRadius: '4px', marginBottom: '15px', backgroundColor: '#d4edda' }}>
                            <h3 style={{ marginTop: 0, color: '#155724' }}>📋 Toa thuốc hiện tại</h3>
                            {existingPrescription.map((item, index) => (
                                <div key={index} style={{ padding: '10px', borderBottom: index < existingPrescription.length - 1 ? '1px solid #c3e6cb' : 'none' }}>
                                    <div style={{ fontWeight: 'bold' }}>{index + 1}. {item.TenSanPham}</div>
                                    <div style={{ fontSize: '14px', marginLeft: '20px' }}>
                                        <div>Số lượng: <strong>{item.SoLuong}</strong></div>
                                        <div>Cách dùng: <em>{item.CachDung}</em></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setIsEditingPrescription(true)} 
                            style={{ ...primaryButtonStyle, backgroundColor: '#f39c12', marginBottom: '15px' }}
                        >
                            ✏️ Chỉnh sửa toa thuốc
                        </button>
                    </div>
                ) : (
                    <div>
                        <button onClick={onAddMedication} style={{ ...primaryButtonStyle, marginBottom: '15px' }}>
                            ➕ Thêm thuốc
                        </button>
                        {selectedMedications.map((med, index) => (
                            <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '4px' }}>
                                <select
                                    style={inputStyle}
                                    value={med.productId}
                                    onChange={(e) => onUpdateMedication(index, 'productId', e.target.value)}
                                >
                                    <option value="">Chọn thuốc...</option>
                                    {medications.map(medication => (
                                        <option key={medication.MaSanPham} value={medication.MaSanPham}>
                                            {medication.TenSanPham} - {medication.GiaBan.toLocaleString('vi-VN')}đ
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    placeholder="Số lượng"
                                    value={med.quantity}
                                    onChange={(e) => onUpdateMedication(index, 'quantity', parseInt(e.target.value))}
                                />
                                <input
                                    type="text"
                                    style={inputStyle}
                                    placeholder="Cách dùng (VD: Uống 2 lần/ngày sau ăn)"
                                    value={med.usage}
                                    onChange={(e) => onUpdateMedication(index, 'usage', e.target.value)}
                                />
                                <button onClick={() => onRemoveMedication(index)} style={{ ...buttonStyle, padding: '5px 10px', fontSize: '12px' }}>
                                    ❌ Xóa
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} style={buttonStyle}>
                        Đóng
                    </button>
                    {isEditingPrescription && (
                        <>
                            {existingPrescription && (
                                <button 
                                    onClick={() => {
                                        setIsEditingPrescription(false);
                                    }} 
                                    style={buttonStyle}
                                >
                                    Hủy chỉnh sửa
                                </button>
                            )}
                            <button onClick={onSave} style={primaryButtonStyle}>
                                {existingPrescription ? '💾 Cập nhật' : '💾 Lưu toa thuốc'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;
