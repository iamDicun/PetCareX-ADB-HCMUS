import React, { useState } from 'react';
import axios from 'axios';

const CustomerCheckModal = ({ isOpen, onClose, onCustomerSelected }) => {
    const [step, setStep] = useState(1); // 1: Nhập SĐT, 2: Nhập thông tin đầy đủ
    const [phoneNumber, setPhoneNumber] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        hoTen: '',
        soDienThoai: '',
        email: '',
        cccd: '',
        gioiTinh: 'Nam',
        ngaySinh: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheckPhone = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Vui lòng nhập số điện thoại hợp lệ');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/customer/check-customer', {
                params: { phoneNumber },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.exists) {
                // Khách hàng đã tồn tại
                onCustomerSelected(response.data.data);
                handleClose();
            } else {
                // Chuyển sang bước 2: nhập thông tin đầy đủ
                setCustomerInfo({
                    ...customerInfo,
                    soDienThoai: phoneNumber
                });
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi kiểm tra khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        
        if (!customerInfo.hoTen || !customerInfo.soDienThoai) {
            setError('Họ tên và số điện thoại là bắt buộc');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/customer/create-customer-with-card',
                customerInfo,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Tạo khách hàng và thẻ thành viên thành công!');
                onCustomerSelected(response.data.data);
                handleClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tạo khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setPhoneNumber('');
        setCustomerInfo({
            hoTen: '',
            soDienThoai: '',
            email: '',
            cccd: '',
            gioiTinh: 'Nam',
            ngaySinh: ''
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const modalContentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        marginRight: '10px'
    };

    const cancelButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#95a5a6'
    };

    return (
        <div style={modalStyle} onClick={handleClose}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                {step === 1 ? (
                    <>
                        <h2 style={{ marginBottom: '20px' }}>Kiểm tra khách hàng</h2>
                        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                        
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Số điện thoại:
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            style={inputStyle}
                            disabled={loading}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={handleCheckPhone} 
                                style={buttonStyle}
                                disabled={loading}
                            >
                                {loading ? 'Đang kiểm tra...' : 'Kiểm tra'}
                            </button>
                            <button onClick={handleClose} style={cancelButtonStyle}>
                                Hủy
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 style={{ marginBottom: '20px' }}>Tạo khách hàng mới</h2>
                        <p style={{ marginBottom: '20px', color: '#666' }}>
                            Không tìm thấy khách hàng. Vui lòng nhập thông tin đầy đủ.
                        </p>
                        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                        
                        <form onSubmit={handleCreateCustomer}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Họ tên <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={customerInfo.hoTen}
                                onChange={(e) => setCustomerInfo({...customerInfo, hoTen: e.target.value})}
                                placeholder="Nhập họ tên"
                                style={inputStyle}
                                required
                            />

                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Số điện thoại <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="tel"
                                value={customerInfo.soDienThoai}
                                onChange={(e) => setCustomerInfo({...customerInfo, soDienThoai: e.target.value})}
                                style={inputStyle}
                                disabled
                            />

                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                                placeholder="Nhập email"
                                style={inputStyle}
                            />

                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                CCCD
                            </label>
                            <input
                                type="text"
                                value={customerInfo.cccd}
                                onChange={(e) => setCustomerInfo({...customerInfo, cccd: e.target.value})}
                                placeholder="Nhập số CCCD"
                                style={inputStyle}
                            />

                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Giới tính
                            </label>
                            <select
                                value={customerInfo.gioiTinh}
                                onChange={(e) => setCustomerInfo({...customerInfo, gioiTinh: e.target.value})}
                                style={inputStyle}
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>

                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                value={customerInfo.ngaySinh}
                                onChange={(e) => setCustomerInfo({...customerInfo, ngaySinh: e.target.value})}
                                style={inputStyle}
                            />

                            <div style={{ marginTop: '20px' }}>
                                <button 
                                    type="submit" 
                                    style={buttonStyle}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo khách hàng'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)} 
                                    style={cancelButtonStyle}
                                >
                                    Quay lại
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomerCheckModal;
