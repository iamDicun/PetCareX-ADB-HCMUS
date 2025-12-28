import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import RevenueTab from '../Component/BranchManager/RevenueTab';
import AppointmentsTab from '../Component/BranchManager/AppointmentsTab';
import OrdersTab from '../Component/BranchManager/OrdersTab';
import EmployeesTab from '../Component/BranchManager/EmployeesTab';
import ProductsTab from '../Component/BranchManager/ProductsTab';
import ServicesTab from '../Component/BranchManager/ServicesTab';
import InventoryTab from '../Component/BranchManager/InventoryTab';
import ImportHistoryTab from '../Component/BranchManager/ImportHistoryTab';
import RequestImportModal from '../Component/BranchManager/RequestImportModal';
import * as branchService from '../Component/BranchManager/branchService';
import * as styles from '../Component/BranchManager/styles';

const BranchManagerPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // States
    const [activeTab, setActiveTab] = useState('revenue');
    const [dateRange, setDateRange] = useState({
        tuNgay: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        denNgay: new Date().toISOString().split('T')[0]
    });
    
    const [revenueData, setRevenueData] = useState([]);
    const [medicineRevenue, setMedicineRevenue] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [ordersPagination, setOrdersPagination] = useState(null);
    const [currentOrderPage, setCurrentOrderPage] = useState(1);
    
    const [employeeRatings, setEmployeeRatings] = useState([]);
    const [employeePerformance, setEmployeePerformance] = useState([]);
    const [performancePagination, setPerformancePagination] = useState(null);
    const [currentPerformancePage, setCurrentPerformancePage] = useState(1);
    
    const [topProducts, setTopProducts] = useState([]);
    const [hotServices, setHotServices] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [inventoryPagination, setInventoryPagination] = useState(null);
    const [currentInventoryPage, setCurrentInventoryPage] = useState(1);
    const [importHistory, setImportHistory] = useState([]);
    const [importPagination, setImportPagination] = useState(null);
    const [currentImportPage, setCurrentImportPage] = useState(1);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch functions với error handling
    const handleFetchRevenue = async () => {
        try {
            setLoading(true);
            const data = await branchService.fetchRevenue(
                user?.MaChiNhanh,
                dateRange.tuNgay,
                dateRange.denNgay
            );
            setRevenueData(data);
        } catch (error) {
            console.error('Lỗi khi lấy doanh thu:', error);
            alert('Không thể lấy dữ liệu doanh thu');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchMedicineRevenue = async () => {
        try {
            setLoading(true);
            const data = await branchService.fetchMedicineRevenue(
                user?.MaChiNhanh,
                dateRange.tuNgay,
                dateRange.denNgay
            );
            setMedicineRevenue(data);
        } catch (error) {
            console.error('Lỗi khi lấy doanh thu thuốc:', error);
            alert('Không thể lấy dữ liệu doanh thu thuốc');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const result = await branchService.fetchOrders(
                user?.MaChiNhanh,
                dateRange.tuNgay,
                dateRange.denNgay,
                page,
                10
            );
            setOrdersData(result.data || []);
            setOrdersPagination(result.pagination);
            setCurrentOrderPage(page);
        } catch (error) {
            console.error('Lỗi khi lấy đơn hàng:', error);
            alert('Không thể lấy danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchEmployeeRatings = async () => {
        try {
            const data = await branchService.fetchEmployeeRatings();
            setEmployeeRatings(data);
        } catch (error) {
            console.error('Lỗi khi lấy đánh giá nhân viên:', error);
        }
    };

    const handleFetchEmployeePerformance = async (page = 1) => {
        try {
            const result = await branchService.fetchEmployeePerformance(
                user?.MaChiNhanh,
                dateRange.tuNgay,
                dateRange.denNgay,
                page,
                10
            );
            console.log('Employee performance result:', result); // Debug log
            console.log('Result data:', result.data);
            console.log('Result pagination:', result.pagination);
            if (result && result.data) {
                setEmployeePerformance(result.data);
                setPerformancePagination(result.pagination);
                setCurrentPerformancePage(page);
            } else {
                console.error('Invalid result structure:', result);
            }
        } catch (error) {
            console.error('Lỗi khi lấy hiệu suất nhân viên:', error);
            console.error('Error details:', error.response?.data); // Debug log
        }
    };

    const handleFetchEmployeesData = async () => {
        try {
            setLoading(true);
            console.log('Before fetching employees data...');
            await Promise.all([
                handleFetchEmployeeRatings(),
                handleFetchEmployeePerformance(1)
            ]);
            console.log('After fetching employees data, checking state...');
            // Delay nhỏ để đảm bảo setState hoàn tất
            setTimeout(() => {
                console.log('State after setTimeout - employeePerformance should be set');
            }, 100);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu nhân viên:', error);
            alert('Không thể lấy dữ liệu nhân viên');
        } finally {
            setLoading(false);
            console.log('Loading set to false');
        }
    };

    const handleFetchTopProducts = async () => {
        try {
            setLoading(true);
            const data = await branchService.fetchTopProducts(
                user?.MaChiNhanh,
                dateRange.tuNgay,
                dateRange.denNgay
            );
            setTopProducts(data);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê sản phẩm:', error);
            alert('Không thể lấy thống kê sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchHotServices = async () => {
        try {
            setLoading(true);
            console.log('Fetching hot services with params:', {
                MaChiNhanh: user?.MaChiNhanh,
                TuNgay: dateRange.tuNgay,
                DenNgay: dateRange.denNgay
            });
            const data = await branchService.fetchHotServices(
                user?.MaChiNhanh,
                dateRange.tuNgay,
                dateRange.denNgay
            );
            console.log('Hot services data received:', data);
            setHotServices(data);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê dịch vụ:', error);
            alert('Không thể lấy thống kê dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchInventory = async (page = 1) => {
        try {
            setLoading(true);
            const result = await branchService.fetchInventory(
                user?.MaChiNhanh,
                page,
                10
            );
            setInventory(result.data || []);
            setInventoryPagination(result.pagination);
            setCurrentInventoryPage(page);
        } catch (error) {
            console.error('Lỗi khi lấy tồn kho:', error);
            alert('Không thể lấy dữ liệu tồn kho');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchImportHistory = async (page = 1) => {
        try {
            setLoading(true);
            const result = await branchService.fetchImportHistory(
                user?.MaChiNhanh,
                page,
                10
            );
            setImportHistory(result.data || []);
            setImportPagination(result.pagination);
            setCurrentImportPage(page);
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử nhập hàng:', error);
            alert('Không thể lấy lịch sử nhập hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRequestModal = () => {
        setShowRequestModal(true);
    };

    const handleCloseRequestModal = () => {
        setShowRequestModal(false);
    };

    const handleRequestSuccess = () => {
        handleFetchImportHistory(1);
        if (activeTab === 'inventory') {
            handleFetchInventory(currentInventoryPage);
        }
    };

    const handleViewImportDetails = (maYeuCau) => {
        alert(`Chi tiết yêu cầu: ${maYeuCau}\nTính năng đang phát triển`);
    };

    // Load dữ liệu khi tab thay đổi
    useEffect(() => {
        switch (activeTab) {
            case 'revenue':
                handleFetchRevenue();
                break;
            case 'medicine':
                handleFetchMedicineRevenue();
                break;
            case 'orders':
                handleFetchOrders();
                break;
            case 'employees':
                handleFetchEmployeesData();
                break;
            case 'products':
                handleFetchTopProducts();
                break;
            case 'services':
                handleFetchHotServices();
                break;
            case 'inventory':
                handleFetchInventory();
                break;
            case 'import-history':
                handleFetchImportHistory();
                break;
            default:
                break;
        }
    }, [activeTab]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Render date filter
    const renderDateFilter = () => (
        <div style={styles.dateFilterStyle}>
            <label>
                <strong>Từ ngày:</strong>
                <input
                    type="date"
                    value={dateRange.tuNgay}
                    onChange={(e) => setDateRange({ ...dateRange, tuNgay: e.target.value })}
                    style={{ ...styles.inputStyle, marginLeft: '10px' }}
                />
            </label>
            <label>
                <strong>Đến ngày:</strong>
                <input
                    type="date"
                    value={dateRange.denNgay}
                    onChange={(e) => setDateRange({ ...dateRange, denNgay: e.target.value })}
                    style={{ ...styles.inputStyle, marginLeft: '10px' }}
                />
            </label>
            <button onClick={() => {
                switch (activeTab) {
                    case 'revenue': handleFetchRevenue(); break;
                    case 'medicine': handleFetchMedicineRevenue(); break;
                    case 'orders': handleFetchOrders(1); break;
                    case 'employees': handleFetchEmployeesData(); break;
                    case 'products': handleFetchTopProducts(); break;
                    case 'services': handleFetchHotServices(); break;
                }
            }} style={styles.buttonStyle}>
                Lọc
            </button>
        </div>
    );

    // Render nội dung theo tab
    const renderTabContent = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
                Đang tải dữ liệu...
            </div>;
        }

        switch (activeTab) {
            case 'revenue':
                return (
                    <RevenueTab
                        revenueData={revenueData}
                        renderDateFilter={renderDateFilter}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                    />
                );

            case 'appointments':
                return (
                    <AppointmentsTab
                        branchCode={user?.MaChiNhanh}
                        startDate={dateRange.tuNgay}
                        endDate={dateRange.denNgay}
                        renderDateFilter={renderDateFilter}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                    />
                );

            case 'medicine':
                return (
                    <div>
                        <h2>Doanh thu Thuốc</h2>
                        {renderDateFilter()}
                        {medicineRevenue.length > 0 ? (
                            <table style={styles.tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={styles.thStyle}>Tên thuốc</th>
                                        <th style={styles.thStyle}>Số lượng</th>
                                        <th style={styles.thStyle}>Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicineRevenue.map((row, index) => (
                                        <tr key={index}>
                                            <td style={styles.tdStyle}>{row.TenThuoc}</td>
                                            <td style={styles.tdStyle}>{row.TongSoLuong}</td>
                                            <td style={styles.tdStyle}><strong>{(row.DoanhThu || 0).toLocaleString('vi-VN')} VNĐ</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Không có dữ liệu doanh thu thuốc trong khoảng thời gian này.</p>
                        )}
                    </div>
                );

            case 'orders':
                return (
                    <OrdersTab
                        ordersData={ordersData}
                        ordersPagination={ordersPagination}
                        currentOrderPage={currentOrderPage}
                        onOrderPageChange={handleFetchOrders}
                        renderDateFilter={renderDateFilter}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                    />
                );

            case 'employees':
                return (
                    <EmployeesTab
                        employeeRatings={employeeRatings}
                        employeePerformance={employeePerformance}
                        performancePagination={performancePagination}
                        currentPerformancePage={currentPerformancePage}
                        onPerformancePageChange={handleFetchEmployeePerformance}
                        renderDateFilter={renderDateFilter}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                        cardStyle={styles.cardStyle}
                    />
                );

            case 'products':
                return (
                    <ProductsTab
                        topProducts={topProducts}
                        renderDateFilter={renderDateFilter}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                    />
                );

            case 'services':
                return (
                    <ServicesTab
                        hotServices={hotServices}
                        renderDateFilter={renderDateFilter}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                    />
                );

            case 'inventory':
                return (
                    <InventoryTab
                        inventory={inventory}
                        inventoryPagination={inventoryPagination}
                        currentInventoryPage={currentInventoryPage}
                        onInventoryPageChange={handleFetchInventory}
                        onOpenRequestModal={handleOpenRequestModal}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                    />
                );

            case 'import-history':
                return (
                    <ImportHistoryTab
                        importHistory={importHistory}
                        importPagination={importPagination}
                        currentImportPage={currentImportPage}
                        onImportPageChange={handleFetchImportHistory}
                        onViewDetails={handleViewImportDetails}
                        tableStyle={styles.tableStyle}
                        thStyle={styles.thStyle}
                        tdStyle={styles.tdStyle}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div style={styles.containerStyle}>
            <div style={styles.headerStyle}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0' }}>Trang Quản Lý Chi Nhánh</h1>
                    <p style={{ margin: '5px 0' }}>Xin chào, <strong>{user?.HoTen}</strong></p>
                    <p style={{ margin: 0, fontSize: '14px' }}>{user?.TenChiNhanh} - {user?.DiaChi}</p>
                </div>
                <button onClick={handleLogout} style={styles.logoutButtonStyle}>
                    Đăng xuất
                </button>
            </div>

            <div style={styles.tabsStyle}>
                <button
                    style={styles.tabButtonStyle(activeTab === 'revenue')}
                    onClick={() => setActiveTab('revenue')}
                >
                    Doanh thu
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'appointments')}
                    onClick={() => setActiveTab('appointments')}
                >
                    Lịch hẹn
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'medicine')}
                    onClick={() => setActiveTab('medicine')}
                >
                    Doanh thu Thuốc
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'orders')}
                    onClick={() => setActiveTab('orders')}
                >
                    Đơn hàng
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'employees')}
                    onClick={() => setActiveTab('employees')}
                >
                    Nhân viên
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'products')}
                    onClick={() => setActiveTab('products')}
                >
                    Sản phẩm Hot
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'services')}
                    onClick={() => setActiveTab('services')}
                >
                    Dịch vụ
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'inventory')}
                    onClick={() => setActiveTab('inventory')}
                >
                    Tồn kho
                </button>
                <button
                    style={styles.tabButtonStyle(activeTab === 'import-history')}
                    onClick={() => setActiveTab('import-history')}
                >
                    Lịch sử nhập hàng
                </button>
            </div>

            <div style={styles.contentStyle}>
                {renderTabContent()}
            </div>

            <RequestImportModal
                isOpen={showRequestModal}
                onClose={handleCloseRequestModal}
                onSuccess={handleRequestSuccess}
                branchId={user?.MaChiNhanh}
            />
        </div>
    );
};

export default BranchManagerPage;
