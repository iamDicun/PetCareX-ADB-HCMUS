import React, { useState, useEffect } from 'react';
import * as branchService from './branchService';

const RequestImportModal = ({ isOpen, onClose, onSuccess, branchId }) => {
    const [allProducts, setAllProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const products = await branchService.fetchAllProducts();
            setAllProducts(products);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            alert('Không thể lấy danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = (product) => {
        const exists = selectedItems.find(item => item.MaSanPham === product.MaSanPham);
        if (!exists) {
            setSelectedItems([...selectedItems, {
                MaSanPham: product.MaSanPham,
                TenSanPham: product.TenSanPham,
                SoLuong: 1
            }]);
        }
    };

    const handleRemoveProduct = (maSanPham) => {
        setSelectedItems(selectedItems.filter(item => item.MaSanPham !== maSanPham));
    };

    const handleQuantityChange = (maSanPham, quantity) => {
        const qty = parseInt(quantity) || 1;
        setSelectedItems(selectedItems.map(item => 
            item.MaSanPham === maSanPham ? { ...item, SoLuong: qty } : item
        ));
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        try {
            setLoading(true);
            await branchService.createImportRequest(branchId, selectedItems);
            alert('Tạo yêu cầu nhập hàng thành công!');
            setSelectedItems([]);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Lỗi khi tạo yêu cầu:', error);
            alert('Không thể tạo yêu cầu nhập hàng');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = allProducts.filter(p => 
        p.TenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.MaSanPham.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    const modalStyle = {
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

    const contentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
    };

    const sectionStyle = {
        marginBottom: '25px'
    };

    const buttonStyle = {
        padding: '8px 16px',
        margin: '5px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    const dangerButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#e74c3c'
    };

    const successButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#27ae60'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px'
    };

    const thStyle = {
        backgroundColor: '#34495e',
        color: 'white',
        padding: '12px',
        textAlign: 'left',
        borderBottom: '2px solid #2c3e50'
    };

    const tdStyle = {
        padding: '10px',
        borderBottom: '1px solid #ddd'
    };

    const inputStyle = {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        width: '80px'
    };

    const searchStyle = {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        width: '100%',
        marginBottom: '15px'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <h2>Tạo yêu cầu nhập hàng</h2>

                {/* Danh sách sản phẩm đã chọn */}
                <div style={sectionStyle}>
                    <h3>Sản phẩm đã chọn ({selectedItems.length})</h3>
                    {selectedItems.length > 0 ? (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Tên sản phẩm</th>
                                    <th style={thStyle}>Số lượng</th>
                                    <th style={thStyle}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map(item => (
                                    <tr key={item.MaSanPham}>
                                        <td style={tdStyle}>{item.TenSanPham}</td>
                                        <td style={tdStyle}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.SoLuong}
                                                onChange={(e) => handleQuantityChange(item.MaSanPham, e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleRemoveProduct(item.MaSanPham)}
                                                style={dangerButtonStyle}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Chưa chọn sản phẩm nào</p>
                    )}
                </div>

                {/* Danh sách tất cả sản phẩm */}
                <div style={sectionStyle}>
                    <h3>Chọn sản phẩm</h3>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyle}
                    />
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {loading ? (
                            <p>Đang tải...</p>
                        ) : (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Mã SP</th>
                                        <th style={thStyle}>Tên sản phẩm</th>
                                        <th style={thStyle}>Loại</th>
                                        <th style={thStyle}>Giá</th>
                                        <th style={thStyle}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.MaSanPham}>
                                            <td style={tdStyle}>{product.MaSanPham}</td>
                                            <td style={tdStyle}>{product.TenSanPham}</td>
                                            <td style={tdStyle}>{product.TenLoai}</td>
                                            <td style={tdStyle}>{(product.GiaBan || 0).toLocaleString('vi-VN')} VNĐ</td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => handleAddProduct(product)}
                                                    style={buttonStyle}
                                                    disabled={selectedItems.find(item => item.MaSanPham === product.MaSanPham)}
                                                >
                                                    {selectedItems.find(item => item.MaSanPham === product.MaSanPham) ? 'Đã chọn' : 'Chọn'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} style={buttonStyle} disabled={loading}>
                        Hủy
                    </button>
                    <button onClick={handleSubmit} style={successButtonStyle} disabled={loading || selectedItems.length === 0}>
                        {loading ? 'Đang xử lý...' : 'Tạo yêu cầu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestImportModal;
