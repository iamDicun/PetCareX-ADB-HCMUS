import React from 'react';

const MedicalRecordModal = ({ 
    show, 
    onClose, 
    selectedAppointment,
    existingRecord,
    isEditingRecord,
    setIsEditingRecord,
    formData, 
    onChange, 
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
                <h2>📋 {existingRecord ? 'Hồ Sơ Khám' : 'Tạo Hồ Sơ Khám'}</h2>
                <div style={{ marginBottom: '15px' }}>
                    <strong>Thú cưng:</strong> {selectedAppointment?.TenThuCung}
                </div>

                {existingRecord && !isEditingRecord ? (
                    <div>
                        <div style={{ border: '1px solid #3498db', padding: '15px', borderRadius: '4px', marginBottom: '15px', backgroundColor: '#e8f4f8' }}>
                            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📄 Hồ sơ khám hiện tại</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Triệu chứng:</strong>
                                <div style={{ marginTop: '5px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                                    {existingRecord.TrieuChung}
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Chuẩn đoán:</strong>
                                <div style={{ marginTop: '5px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                                    {existingRecord.ChuanDoan}
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Cân nặng:</strong> {existingRecord.CanNang} kg
                            </div>
                            {existingRecord.NgayTaiKham && (
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Ngày tái khám:</strong> {new Date(existingRecord.NgayTaiKham).toLocaleDateString('vi-VN')}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => setIsEditingRecord(true)} 
                            style={{ ...primaryButtonStyle, backgroundColor: '#f39c12', marginBottom: '15px' }}
                        >
                            ✏️ Chỉnh sửa hồ sơ
                        </button>
                    </div>
                ) : (
                    <div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Triệu chứng:</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: '80px' }}
                                value={formData.symptoms}
                                onChange={(e) => onChange({ ...formData, symptoms: e.target.value })}
                                placeholder="Nhập triệu chứng..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chuẩn đoán:</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: '80px' }}
                                value={formData.diagnosis}
                                onChange={(e) => onChange({ ...formData, diagnosis: e.target.value })}
                                placeholder="Nhập chuẩn đoán..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cân nặng (kg):</label>
                            <input
                                type="number"
                                step="0.1"
                                style={inputStyle}
                                value={formData.weight}
                                onChange={(e) => onChange({ ...formData, weight: e.target.value })}
                                placeholder="Nhập cân nặng..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ngày tái khám (tùy chọn):</label>
                            <input
                                type="date"
                                style={inputStyle}
                                value={formData.reExamDate}
                                onChange={(e) => onChange({ ...formData, reExamDate: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} style={buttonStyle}>
                        Đóng
                    </button>
                    {isEditingRecord && (
                        <>
                            {existingRecord && (
                                <button 
                                    onClick={() => setIsEditingRecord(false)} 
                                    style={buttonStyle}
                                >
                                    Hủy chỉnh sửa
                                </button>
                            )}
                            <button onClick={onSave} style={primaryButtonStyle}>
                                {existingRecord ? '💾 Cập nhật' : '💾 Lưu hồ sơ'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordModal;
