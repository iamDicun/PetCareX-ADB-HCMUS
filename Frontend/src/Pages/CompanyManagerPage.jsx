import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const CompanyManagerPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('hot-services');
    const [loading, setLoading] = useState(false);

    // Data states
    const [hotServices, setHotServices] = useState([]);
    const [systemRevenue, setSystemRevenue] = useState([]);
    const [topRevenueServices, setTopRevenueServices] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [employeeRatings, setEmployeeRatings] = useState([]);
    const [branches, setBranches] = useState([]);
    const [importRequests, setImportRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requestDetails, setRequestDetails] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [transferBranch, setTransferBranch] = useState('');
    const [transferReason, setTransferReason] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [showEmployeeList, setShowEmployeeList] = useState(false);

    // Filter states
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonths, setSelectedMonths] = useState(3);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [topN, setTopN] = useState(10);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchBranches();
        fetchHotServices();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'hot-services') {
            fetchHotServices();
        } else if (activeTab === 'system-revenue') {
            fetchSystemRevenue();
        } else if (activeTab === 'top-revenue-services') {
            fetchTopRevenueServices();
        } else if (activeTab === 'best-selling-products') {
            fetchBestSellingProducts();
        } else if (activeTab === 'employee-ratings') {
            fetchEmployeeRatings();
        } else if (activeTab === 'import-requests') {
            fetchImportRequests();
        }
    }, [activeTab, selectedBranch]);

    const fetchBranches = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/company-manager/branches');
            const data = await res.json();
            if (data.success) {
                setBranches(data.data);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const fetchHotServices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/company-manager/hot-services?top=${topN}`);
            const data = await res.json();
            if (data.success) {
                setHotServices(data.data);
            }
        } catch (error) {
            console.error('Error fetching hot services:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemRevenue = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/company-manager/system-revenue?year=${selectedYear}`);
            const data = await res.json();
            if (data.success) {
                setSystemRevenue(data.data);
            }
        } catch (error) {
            console.error('Error fetching system revenue:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopRevenueServices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/company-manager/top-revenue-services?months=${selectedMonths}`);
            const data = await res.json();
            if (data.success) {
                setTopRevenueServices(data.data);
            }
        } catch (error) {
            console.error('Error fetching top revenue services:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBestSellingProducts = async () => {
        setLoading(true);
        try {
            const branchParam = selectedBranch ? `&branchId=${selectedBranch}` : '';
            const res = await fetch(`http://localhost:5000/api/company-manager/best-selling-products?top=${topN}${branchParam}`);
            const data = await res.json();
            if (data.success) {
                setBestSellingProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching best selling products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeRatings = async () => {
        setLoading(true);
        try {
            const branchParam = selectedBranch ? `?branchId=${selectedBranch}` : '';
            const res = await fetch(`http://localhost:5000/api/company-manager/employee-ratings${branchParam}`);
            const data = await res.json();
            if (data.success) {
                setEmployeeRatings(data.data);
            }
        } catch (error) {
            console.error('Error fetching employee ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchImportRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/company-manager/import-requests/pending');
            const data = await res.json();
            if (data.success) {
                setImportRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching import requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequestDetails = async (requestId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/company-manager/import-requests/${requestId}/details`);
            const data = await res.json();
            if (data.success) {
                setRequestDetails(data.data);
                setSelectedRequest(requestId);
            }
        } catch (error) {
            console.error('Error fetching request details:', error);
        }
    };

    const handleApproveRequest = async (requestId, status) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'Đã duyệt' ? 'duyệt' : 'từ chối'} yêu cầu này?`)) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/company-manager/import-requests/${requestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchImportRequests();
                setSelectedRequest(null);
                setRequestDetails([]);
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Có lỗi xảy ra');
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/company-manager/employees');
            const data = await res.json();
            if (data.success) {
                setEmployees(data.data);
                setShowEmployeeList(true);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransferEmployee = async () => {
        if (!selectedEmployee || !transferBranch) {
            alert('Vui lòng chọn nhân viên và chi nhánh');
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn điều động nhân viên này?`)) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/company-manager/employees/${selectedEmployee}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    newBranchId: transferBranch, 
                    reason: transferReason 
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchEmployees();
                setSelectedEmployee(null);
                setTransferBranch('');
                setTransferReason('');
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error transferring employee:', error);
            alert('Có lỗi xảy ra');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const containerStyle = {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    };

    const headerStyle = {
        backgroundColor: '#8e44ad',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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

    const tabStyle = (isActive) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: isActive ? '#8e44ad' : '#ecf0f1',
        color: isActive ? 'white' : '#2c3e50',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: isActive ? 'bold' : 'normal'
    });

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
    };

    const thStyle = {
        backgroundColor: '#8e44ad',
        color: 'white',
        padding: '12px',
        textAlign: 'left',
        fontWeight: 'bold'
    };

    const tdStyle = {
        padding: '10px',
        borderBottom: '1px solid #ddd'
    };

    const filterContainerStyle = {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
    };

    const inputStyle = {
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px'
    };

    const filterButtonStyle = {
        padding: '8px 16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0' }}>🏆 Trang Quản Lý Cấp Công Ty</h1>
                    <p style={{ margin: 0 }}>Xin chào, {user?.HoTen}</p>
                </div>
                <button onClick={handleLogout} style={buttonStyle}>
                    Đăng xuất
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button style={tabStyle(activeTab === 'hot-services')} onClick={() => setActiveTab('hot-services')}>
                    📊 Dịch vụ Hot
                </button>
                <button style={tabStyle(activeTab === 'system-revenue')} onClick={() => setActiveTab('system-revenue')}>
                    💰 Doanh thu Hệ thống
                </button>
                <button style={tabStyle(activeTab === 'top-revenue-services')} onClick={() => setActiveTab('top-revenue-services')}>
                    🥇 Top Dịch vụ Doanh thu
                </button>
                <button style={tabStyle(activeTab === 'employee-ratings')} onClick={() => setActiveTab('employee-ratings')}>
                    ⭐ Đánh giá Nhân viên
                </button>
                <button style={tabStyle(activeTab === 'best-selling-products')} onClick={() => setActiveTab('best-selling-products')}>
                    🛍️ Sản phẩm Bán chạy
                </button>
                <button style={tabStyle(activeTab === 'import-requests')} onClick={() => setActiveTab('import-requests')}>
                    📦 Yêu cầu Nhập hàng
                </button>
                <button style={tabStyle(activeTab === 'employee-transfer')} onClick={() => setActiveTab('employee-transfer')}>
                    👥 Điều động Nhân viên
                </button>
            </div>

            <div style={contentStyle}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'hot-services' && (
                            <div>
                                <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>📊 Thống kê Dịch vụ Hot</h2>
                                <div style={filterContainerStyle}>
                                    <label>
                                        Top:
                                        <input 
                                            type="number" 
                                            value={topN} 
                                            onChange={(e) => setTopN(e.target.value)}
                                            style={{...inputStyle, marginLeft: '10px', width: '80px'}}
                                            min="1"
                                        />
                                    </label>
                                    <button onClick={fetchHotServices} style={filterButtonStyle}>
                                        Làm mới
                                    </button>
                                </div>
                                {hotServices.length === 0 ? (
                                    <p>Không có dữ liệu</p>
                                ) : (
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Tên dịch vụ</th>
                                                <th style={thStyle}>Loại dịch vụ</th>
                                                <th style={thStyle}>Số lượt đặt</th>
                                                <th style={thStyle}>Điểm chất lượng TB</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hotServices.map((service, idx) => (
                                                <tr key={idx}>
                                                    <td style={tdStyle}>{service.TenDichVu}</td>
                                                    <td style={tdStyle}>{service.LoaiDichVu}</td>
                                                    <td style={tdStyle}>{service.SoLuotDat}</td>
                                                    <td style={tdStyle}>{service.DiemChatLuongTB ? service.DiemChatLuongTB.toFixed(2) : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'system-revenue' && (
                            <div>
                                <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>💰 Doanh thu Toàn Hệ thống</h2>
                                <div style={filterContainerStyle}>
                                    <label>
                                        Năm:
                                        <input 
                                            type="number" 
                                            value={selectedYear} 
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            style={{...inputStyle, marginLeft: '10px', width: '100px'}}
                                            min="2020"
                                            max="2030"
                                        />
                                    </label>
                                    <button onClick={fetchSystemRevenue} style={filterButtonStyle}>
                                        Xem báo cáo
                                    </button>
                                </div>
                                {systemRevenue.length === 0 ? (
                                    <p>Không có dữ liệu cho năm {selectedYear}</p>
                                ) : (
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Chi nhánh</th>
                                                <th style={thStyle}>Tháng</th>
                                                <th style={thStyle}>Tổng doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {systemRevenue.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td style={tdStyle}>{item.TenChiNhanh}</td>
                                                    <td style={tdStyle}>Tháng {item.Thang}</td>
                                                    <td style={tdStyle}>{item.TongDoanhThu?.toLocaleString()} VND</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'top-revenue-services' && (
                            <div>
                                <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>🥇 Top Dịch vụ Doanh thu Cao nhất</h2>
                                <div style={filterContainerStyle}>
                                    <label>
                                        Số tháng gần nhất:
                                        <input 
                                            type="number" 
                                            value={selectedMonths} 
                                            onChange={(e) => setSelectedMonths(e.target.value)}
                                            style={{...inputStyle, marginLeft: '10px', width: '80px'}}
                                            min="1"
                                            max="12"
                                        />
                                    </label>
                                    <button onClick={fetchTopRevenueServices} style={filterButtonStyle}>
                                        Cập nhật
                                    </button>
                                </div>
                                {topRevenueServices.length === 0 ? (
                                    <p>Không có dữ liệu</p>
                                ) : (
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Tên dịch vụ</th>
                                                <th style={thStyle}>Loại dịch vụ</th>
                                                <th style={thStyle}>Số lượt sử dụng</th>
                                                <th style={thStyle}>Tổng doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topRevenueServices.map((service, idx) => (
                                                <tr key={idx}>
                                                    <td style={tdStyle}>{service.TenDichVu}</td>
                                                    <td style={tdStyle}>{service.LoaiDichVu}</td>
                                                    <td style={tdStyle}>{service.SoLuotSuDung}</td>
                                                    <td style={tdStyle}>{service.TongDoanhThu?.toLocaleString()} VND</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'employee-ratings' && (
                            <div>
                                <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>⭐ Đánh giá Nhân viên</h2>
                                <div style={filterContainerStyle}>
                                    <label>
                                        Chi nhánh:
                                        <select 
                                            value={selectedBranch} 
                                            onChange={(e) => setSelectedBranch(e.target.value)}
                                            style={{...inputStyle, marginLeft: '10px'}}
                                        >
                                            <option value="">Tất cả chi nhánh</option>
                                            {branches.map(branch => (
                                                <option key={branch.MaChiNhanh} value={branch.MaChiNhanh}>
                                                    {branch.TenChiNhanh}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <button onClick={fetchEmployeeRatings} style={filterButtonStyle}>
                                        Xem báo cáo
                                    </button>
                                </div>
                                {employeeRatings.length === 0 ? (
                                    <p>Không có dữ liệu</p>
                                ) : (
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Họ tên</th>
                                                <th style={thStyle}>Chức vụ</th>
                                                <th style={thStyle}>Chi nhánh</th>
                                                <th style={thStyle}>Số lượt đánh giá</th>
                                                <th style={thStyle}>Điểm thái độ TB</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeeRatings.map((emp, idx) => (
                                                <tr key={idx}>
                                                    <td style={tdStyle}>{emp.HoTen}</td>
                                                    <td style={tdStyle}>{emp.ChucVu}</td>
                                                    <td style={tdStyle}>{emp.TenChiNhanh}</td>
                                                    <td style={tdStyle}>{emp.SoLuotDanhGia}</td>
                                                    <td style={tdStyle}>
                                                        <span style={{
                                                            color: emp.DiemThaiDoTB >= 4 ? '#27ae60' : emp.DiemThaiDoTB >= 3 ? '#f39c12' : '#e74c3c',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {emp.DiemThaiDoTB ? emp.DiemThaiDoTB.toFixed(2) : 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'best-selling-products' && (
                            <div>
                                <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>🛍️ Sản phẩm Bán chạy</h2>
                                <div style={filterContainerStyle}>
                                    <label>
                                        Chi nhánh:
                                        <select 
                                            value={selectedBranch} 
                                            onChange={(e) => setSelectedBranch(e.target.value)}
                                            style={{...inputStyle, marginLeft: '10px'}}
                                        >
                                            <option value="">Tất cả chi nhánh</option>
                                            {branches.map(branch => (
                                                <option key={branch.MaChiNhanh} value={branch.MaChiNhanh}>
                                                    {branch.TenChiNhanh}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Top:
                                        <input 
                                            type="number" 
                                            value={topN} 
                                            onChange={(e) => setTopN(e.target.value)}
                                            style={{...inputStyle, marginLeft: '10px', width: '80px'}}
                                            min="1"
                                        />
                                    </label>
                                    <button onClick={fetchBestSellingProducts} style={filterButtonStyle}>
                                        Xem báo cáo
                                    </button>
                                </div>
                                {bestSellingProducts.length === 0 ? (
                                    <p>Không có dữ liệu</p>
                                ) : (
                                    <table style={tableStyle}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Tên sản phẩm</th>
                                                <th style={thStyle}>Loại</th>
                                                <th style={thStyle}>Tổng số lượng bán</th>
                                                <th style={thStyle}>Tổng doanh thu</th>
                                                <th style={thStyle}>Số lượt đơn hàng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bestSellingProducts.map((product, idx) => (
                                                <tr key={idx}>
                                                    <td style={tdStyle}>{product.TenSanPham}</td>
                                                    <td style={tdStyle}>{product.TenLoai}</td>
                                                    <td style={tdStyle}>{product.TongSoLuongBan}</td>
                                                    <td style={tdStyle}>{product.TongDoanhThu?.toLocaleString()} VND</td>
                                                    <td style={tdStyle}>{product.SoLuotDonHang}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'import-requests' && (
                            <div>
                                <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>📦 Quản lý Yêu cầu Nhập hàng</h2>
                                <button onClick={fetchImportRequests} style={{...filterButtonStyle, marginBottom: '20px'}}>
                                    Làm mới
                                </button>
                                {importRequests.length === 0 ? (
                                    <p>Không có yêu cầu nào cần xử lý</p>
                                ) : (
                                    <>
                                        <table style={tableStyle}>
                                            <thead>
                                                <tr>
                                                    <th style={thStyle}>Ngày yêu cầu</th>
                                                    <th style={thStyle}>Chi nhánh</th>
                                                    <th style={thStyle}>Địa chỉ</th>
                                                    <th style={thStyle}>Số loại SP</th>
                                                    <th style={thStyle}>Tổng SL</th>
                                                    <th style={thStyle}>Trạng thái</th>
                                                    <th style={thStyle}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importRequests.map((request) => (
                                                    <tr key={request.MaYeuCau}>
                                                        <td style={tdStyle}>{new Date(request.NgayYeuCau).toLocaleDateString('vi-VN')}</td>
                                                        <td style={tdStyle}>{request.TenChiNhanh}</td>
                                                        <td style={tdStyle}>{request.DiaChi}</td>
                                                        <td style={tdStyle}>{request.SoLuongSanPham}</td>
                                                        <td style={tdStyle}>{request.TongSoLuong}</td>
                                                        <td style={tdStyle}>
                                                            <span style={{
                                                                color: request.TrangThai === 'Mới' ? '#e74c3c' : '#3498db',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {request.TrangThai}
                                                            </span>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <button 
                                                                onClick={() => fetchRequestDetails(request.MaYeuCau)}
                                                                style={{...filterButtonStyle, marginRight: '5px'}}
                                                            >
                                                                Chi tiết
                                                            </button>
                                                            {request.TrangThai === 'Mới' && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleApproveRequest(request.MaYeuCau, 'Đã duyệt')}
                                                                        style={{...filterButtonStyle, backgroundColor: '#27ae60', marginRight: '5px'}}
                                                                    >
                                                                        Duyệt
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleApproveRequest(request.MaYeuCau, 'Hủy')}
                                                                        style={{...filterButtonStyle, backgroundColor: '#e74c3c'}}
                                                                    >
                                                                        Từ chối
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {selectedRequest && requestDetails.length > 0 && (
                                            <div style={{marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                                                <h3 style={{ color: '#8e44ad', marginBottom: '15px' }}>Chi tiết Yêu cầu</h3>
                                                <table style={tableStyle}>
                                                    <thead>
                                                        <tr>
                                                            <th style={thStyle}>Tên sản phẩm</th>
                                                            <th style={thStyle}>Loại</th>
                                                            <th style={thStyle}>Số lượng</th>
                                                            <th style={thStyle}>Giá bán</th>
                                                            <th style={thStyle}>Thành tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {requestDetails.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td style={tdStyle}>{item.TenSanPham}</td>
                                                                <td style={tdStyle}>{item.TenLoai}</td>
                                                                <td style={tdStyle}>{item.SoLuong}</td>
                                                                <td style={tdStyle}>{item.GiaBan?.toLocaleString()} VND</td>
                                                                <td style={tdStyle}>{item.ThanhTien?.toLocaleString()} VND</td>
                                                            </tr>
                                                        ))}
                                                        <tr style={{backgroundColor: '#ecf0f1', fontWeight: 'bold'}}>
                                                            <td style={tdStyle} colSpan="4">Tổng cộng</td>
                                                            <td style={tdStyle}>
                                                                {requestDetails.reduce((sum, item) => sum + item.ThanhTien, 0).toLocaleString()} VND
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <button 
                                                    onClick={() => {setSelectedRequest(null); setRequestDetails([]);}}
                                                    style={{...filterButtonStyle, marginTop: '15px'}}
                                                >
                                                    Đóng
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'employee-transfer' && (
                            <div>
                                <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>👥 Điều động Nhân viên</h2>
                                
                                {/* Search and load */}
                                <div style={filterContainerStyle}>
                                    <input 
                                        type="text"
                                        placeholder="Tìm theo tên, SĐT, chi nhánh, chức vụ..."
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                        style={{...inputStyle, width: '350px'}}
                                    />
                                    <button onClick={fetchEmployees} style={filterButtonStyle}>
                                        Tìm kiếm Nhân viên
                                    </button>
                                    {selectedEmployee && (
                                        <span style={{color: '#27ae60', fontWeight: 'bold'}}>
                                            ✓ Đã chọn: {employees.find(e => e.MaNhanVien === selectedEmployee)?.HoTen}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Employee list - only show after search */}
                                {showEmployeeList && (
                                    employees.length === 0 ? (
                                        <p style={{padding: '20px', textAlign: 'center', color: '#e74c3c'}}>
                                            Không tìm thấy nhân viên
                                        </p>
                                    ) : (
                                        <div>
                                            <table style={tableStyle}>
                                                <thead>
                                                    <tr>
                                                        <th style={thStyle}>Họ tên</th>
                                                        <th style={thStyle}>Chức vụ</th>
                                                        <th style={thStyle}>Chi nhánh hiện tại</th>
                                                        <th style={thStyle}>SĐT</th>
                                                        <th style={thStyle}>Ngày vào làm</th>
                                                        <th style={thStyle}>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {employees
                                                        .filter(emp => {
                                                            if (!employeeSearch) return true;
                                                            const search = employeeSearch.toLowerCase();
                                                            return (
                                                                emp.HoTen?.toLowerCase().includes(search) ||
                                                                emp.SoDienThoai?.includes(search) ||
                                                                emp.TenChiNhanh?.toLowerCase().includes(search) ||
                                                                emp.ChucVu?.toLowerCase().includes(search)
                                                            );
                                                        })
                                                        .map((emp) => (
                                                            <tr key={emp.MaNhanVien} style={{
                                                                backgroundColor: selectedEmployee === emp.MaNhanVien ? '#d4edda' : 'transparent'
                                                            }}>
                                                                <td style={tdStyle}>{emp.HoTen}</td>
                                                                <td style={tdStyle}>{emp.ChucVu}</td>
                                                                <td style={tdStyle}>{emp.TenChiNhanh || 'Chưa phân chi nhánh'}</td>
                                                                <td style={tdStyle}>{emp.SoDienThoai}</td>
                                                                <td style={tdStyle}>{new Date(emp.NgayVaoLam).toLocaleDateString('vi-VN')}</td>
                                                                <td style={tdStyle}>
                                                                    <button 
                                                                        onClick={() => setSelectedEmployee(emp.MaNhanVien)}
                                                                        style={{
                                                                            ...filterButtonStyle, 
                                                                            backgroundColor: selectedEmployee === emp.MaNhanVien ? '#27ae60' : '#3498db'
                                                                        }}
                                                                    >
                                                                        {selectedEmployee === emp.MaNhanVien ? '✓ Đã chọn' : 'Chọn'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                            
                                            {employees.filter(emp => {
                                                if (!employeeSearch) return true;
                                                const search = employeeSearch.toLowerCase();
                                                return (
                                                    emp.HoTen?.toLowerCase().includes(search) ||
                                                    emp.SoDienThoai?.includes(search) ||
                                                    emp.TenChiNhanh?.toLowerCase().includes(search) ||
                                                    emp.ChucVu?.toLowerCase().includes(search)
                                                );
                                            }).length === 0 && (
                                                <p style={{textAlign: 'center', padding: '20px', color: '#e74c3c'}}>
                                                    Không tìm thấy nhân viên phù hợp với "{employeeSearch}"
                                                </p>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* Transfer form */}
                                {selectedEmployee && (
                                    <div style={{
                                        marginTop: '30px', 
                                        padding: '25px', 
                                        backgroundColor: '#f8f9fa', 
                                        borderRadius: '8px',
                                        border: '2px solid #8e44ad'
                                    }}>
                                        <h3 style={{ color: '#8e44ad', marginBottom: '20px' }}>
                                            Điều động: {employees.find(e => e.MaNhanVien === selectedEmployee)?.HoTen}
                                        </h3>
                                        <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px'}}>
                                            <p style={{margin: '5px 0'}}><strong>Chức vụ:</strong> {employees.find(e => e.MaNhanVien === selectedEmployee)?.ChucVu}</p>
                                            <p style={{margin: '5px 0'}}><strong>Chi nhánh hiện tại:</strong> {employees.find(e => e.MaNhanVien === selectedEmployee)?.TenChiNhanh || 'Chưa có'}</p>
                                        </div>
                                        <div style={{marginBottom: '15px'}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                                                Chi nhánh mới: <span style={{color: '#e74c3c'}}>*</span>
                                            </label>
                                            <select 
                                                value={transferBranch} 
                                                onChange={(e) => setTransferBranch(e.target.value)}
                                                style={{...inputStyle, width: '100%'}}
                                            >
                                                <option value="">-- Chọn chi nhánh --</option>
                                                {branches.map(branch => (
                                                    <option key={branch.MaChiNhanh} value={branch.MaChiNhanh}>
                                                        {branch.TenChiNhanh} - {branch.DiaChi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{marginBottom: '20px'}}>
                                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                                                Lý do điều động (không bắt buộc):
                                            </label>
                                            <textarea 
                                                value={transferReason} 
                                                onChange={(e) => setTransferReason(e.target.value)}
                                                style={{...inputStyle, width: '100%', minHeight: '80px'}}
                                                placeholder="Nhập lý do điều động..."
                                            />
                                        </div>
                                        <div style={{display: 'flex', gap: '10px'}}>
                                            <button 
                                                onClick={handleTransferEmployee}
                                                style={{...filterButtonStyle, backgroundColor: '#27ae60', padding: '10px 20px'}}
                                            >
                                                Xác nhận Điều động
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedEmployee(null);
                                                    setTransferBranch('');
                                                    setTransferReason('');
                                                }}
                                                style={{...filterButtonStyle, backgroundColor: '#95a5a6', padding: '10px 20px'}}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyManagerPage;
