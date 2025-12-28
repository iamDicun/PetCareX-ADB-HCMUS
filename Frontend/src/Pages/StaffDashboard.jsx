import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import OrderList from '../Component/Staff/OrderList';
import AppointmentList from '../Component/Staff/AppointmentList';
import CreateModal from '../Component/Staff/CreateModal';
import DetailsModal from '../Component/Staff/DetailsModal';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    
    // States for creating order/appointment
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createType, setCreateType] = useState(''); // 'order' or 'appointment'
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customer, setCustomer] = useState(null);
    const [customerPets, setCustomerPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    // Pet registration states
    const [showPetModal, setShowPetModal] = useState(false);
    const [petTypes, setPetTypes] = useState([]);
    const [newPet, setNewPet] = useState({
        TenThuCung: '', Giong: '', NgaySinh: '', GioiTinh: 'Đực', CanNang: '', TinhTrangSK: '', MaLoaiTC: ''
    });
    
    // Products and Services
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    
    // Pending lists
    const [pendingOrders, setPendingOrders] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    
    // Pagination for appointments
    const [appointmentPage, setAppointmentPage] = useState(1);
    const [appointmentTotalPages, setAppointmentTotalPages] = useState(1);
    const [appointmentTotal, setAppointmentTotal] = useState(0);
    
    // Details modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsType, setDetailsType] = useState('');
    const [detailsData, setDetailsData] = useState([]);
    
    // Branch filter
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    // Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentCustomer, setPaymentCustomer] = useState(null);
    const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
    const [paymentSearchResults, setPaymentSearchResults] = useState([]);
    const [showPaymentSearchResults, setShowPaymentSearchResults] = useState(false);
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const API_URL = 'http://localhost:5000/api';

    // Live search effect
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.trim().length >= 2 && !customer) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/staff/customers/search?query=${encodeURIComponent(searchQuery)}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success && data.customers) {
                        setSearchResults(data.customers);
                        setShowSearchResults(data.customers.length > 0);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        };

        const debounceTimer = setTimeout(performSearch, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, customer]);

    // Payment search effect
    useEffect(() => {
        const performPaymentSearch = async () => {
            if (paymentSearchQuery.trim().length >= 2 && !paymentCustomer) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/staff/customers/search?query=${encodeURIComponent(paymentSearchQuery)}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success && data.customers) {
                        setPaymentSearchResults(data.customers);
                        setShowPaymentSearchResults(data.customers.length > 0);
                    }
                } catch (error) {
                    console.error('Payment search error:', error);
                }
            } else {
                setPaymentSearchResults([]);
                setShowPaymentSearchResults(false);
            }
        };

        const debounceTimer = setTimeout(performPaymentSearch, 300);
        return () => clearTimeout(debounceTimer);
    }, [paymentSearchQuery, paymentCustomer]);

    useEffect(() => {
        loadBranches();
    }, []);
    
    useEffect(() => {
        if (user?.MaChiNhanh) {
            setSelectedBranch(user.MaChiNhanh);
        }
    }, [user]);
    
    useEffect(() => {
        if (selectedBranch) {
            loadPendingData();
        }
    }, [selectedBranch]);
    
    useEffect(() => {
        if (selectedBranch) {
            loadPendingAppointments();
        }
    }, [selectedBranch, appointmentPage]);

    const loadBranches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/company-manager/branches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBranches(data.branches);
            }
        } catch (error) {
            console.error('Error loading branches:', error);
        }
    };

    const loadPendingData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const ordersRes = await fetch(`${API_URL}/staff/orders/pending?branchId=${selectedBranch}`, { headers });
            const ordersData = await ordersRes.json();
            
            if (ordersData.success) setPendingOrders(ordersData.orders);
        } catch (error) {
            console.error('Error loading pending data:', error);
        }
    };
    
    const loadPendingAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const res = await fetch(`${API_URL}/staff/appointments/pending?branchId=${selectedBranch}&page=${appointmentPage}&limit=10`, { headers });
            const appointmentsData = await res.json();
            
            if (appointmentsData.success) {
                setPendingAppointments(appointmentsData.appointments);
                setAppointmentTotalPages(appointmentsData.totalPages);
                setAppointmentTotal(appointmentsData.total);
            }
        } catch (error) {
            console.error('Error loading pending appointments:', error);
        }
    };

    const handleOpenCreateModal = async (type) => {
        setCreateType(type);
        setShowCreateModal(true);
        
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            if (type === 'order') {
                const res = await fetch(`${API_URL}/staff/products?branchId=${selectedBranch}`, { headers });
                const data = await res.json();
                if (data.success) setProducts(data.products);
            } else {
                const res = await fetch(`${API_URL}/staff/services?branchId=${selectedBranch}`, { headers });
                const data = await res.json();
                if (data.success) setServices(data.services);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSelectCustomer = async (selectedCustomer) => {
        setCustomer(selectedCustomer);
        setCustomerName(selectedCustomer.HoTen);
        setCustomerPhone(selectedCustomer.SoDienThoai);
        setSearchQuery('');
        setShowSearchResults(false);
        
        // Load pets if needed
        if (createType === 'appointment' || showPetModal) {
            try {
                const token = localStorage.getItem('token');
                const petsRes = await fetch(`${API_URL}/staff/customer/${selectedCustomer.MaKhachHang}/pets`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const petsData = await petsRes.json();
                if (petsData.success) setCustomerPets(petsData.pets);
            } catch (error) {
                console.error('Error loading pets:', error);
            }
        }
    };

    const handleFindCustomer = async (searchQuery = null) => {
        const query = searchQuery || customerName || customerPhone || '';
        
        if (!query || typeof query !== 'string' || query.trim() === '') {
            alert('Vui lòng nhập tên hoặc số điện thoại để tìm kiếm');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            // Search for customers
            const res = await fetch(`${API_URL}/staff/customers/search?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await res.json();
            if (data.success) {
                if (data.customers && data.customers.length > 0) {
                    if (data.customers.length === 1) {
                        // Only one customer found, select automatically
                        setCustomer(data.customers[0]);
                        setCustomerName(data.customers[0].HoTen);
                        setCustomerPhone(data.customers[0].SoDienThoai);
                        
                        // Load pets if appointment
                        if (createType === 'appointment' || showPetModal) {
                            const petsRes = await fetch(`${API_URL}/staff/customer/${data.customers[0].MaKhachHang}/pets`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const petsData = await petsRes.json();
                            if (petsData.success) setCustomerPets(petsData.pets);
                        }
                    } else {
                        // Multiple customers found, show selection
                        const selection = data.customers.map((c, i) => 
                            `${i + 1}. ${c.HoTen} - ${c.SoDienThoai}`
                        ).join('\n');
                        const choice = prompt(`Tìm thấy ${data.customers.length} khách hàng:\n\n${selection}\n\nNhập số thứ tự để chọn (hoặc 0 để tạo mới):`);
                        
                        if (choice && parseInt(choice) > 0 && parseInt(choice) <= data.customers.length) {
                            const selectedCustomer = data.customers[parseInt(choice) - 1];
                            setCustomer(selectedCustomer);
                            setCustomerName(selectedCustomer.HoTen);
                            setCustomerPhone(selectedCustomer.SoDienThoai);
                            
                            // Load pets if appointment
                            if (createType === 'appointment' || showPetModal) {
                                const petsRes = await fetch(`${API_URL}/staff/customer/${selectedCustomer.MaKhachHang}/pets`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                const petsData = await petsRes.json();
                                if (petsData.success) setCustomerPets(petsData.pets);
                            }
                        } else if (choice === '0') {
                            // Create new customer
                            await handleCreateNewCustomer();
                        }
                    }
                } else {
                    // No customer found
                    if (window.confirm('Không tìm thấy khách hàng. Bạn có muốn tạo khách hàng mới?')) {
                        await handleCreateNewCustomer();
                    }
                }
            }
        } catch (error) {
            console.error('Error finding customer:', error);
            alert('Lỗi khi tìm khách hàng');
        }
    };

    const handleCreateNewCustomer = async () => {
        const name = prompt('Nhập tên khách hàng:', customerName);
        const phone = prompt('Nhập số điện thoại:', customerPhone);
        
        if (!name || !phone) {
            alert('Tên và số điện thoại là bắt buộc');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/staff/customer/find-or-create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, phoneNum: phone })
            });
            
            const data = await res.json();
            if (data.success) {
                setCustomer(data.customer);
                setCustomerName(data.customer.HoTen);
                setCustomerPhone(data.customer.SoDienThoai);
                alert('Đã tạo khách hàng mới thành công!');
                
                // Load pets if appointment
                if (createType === 'appointment' || showPetModal) {
                    const petsRes = await fetch(`${API_URL}/staff/customer/${data.customer.MaKhachHang}/pets`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const petsData = await petsRes.json();
                    if (petsData.success) setCustomerPets(petsData.pets);
                }
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            alert('Lỗi khi tạo khách hàng');
        }
    };

    const handleAddItem = (item) => {
        const existing = selectedItems.find(i => 
            createType === 'order' ? i.MaSanPham === item.MaSanPham : i.MaDichVu === item.MaDichVu
        );
        
        if (existing) {
            alert('Đã thêm sản phẩm/dịch vụ này');
            return;
        }
        
        setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    };

    const handleRemoveItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleQuantityChange = (index, quantity) => {
        const newItems = [...selectedItems];
        newItems[index].quantity = parseInt(quantity) || 1;
        setSelectedItems(newItems);
    };

    const handleSubmitCreate = async (serviceStaffAssignments = null) => {
        if (!customer) {
            alert('Vui lòng tìm khách hàng trước');
            return;
        }
        
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm/dịch vụ');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            if (createType === 'order') {
                const orderData = {
                    maKhachHang: customer.MaKhachHang,
                    maChiNhanh: user.MaChiNhanh,
                    maNhanVien: user.MaNhanVien,
                    items: selectedItems.map(item => ({
                        maSanPham: item.MaSanPham,
                        soLuong: item.quantity,
                        donGia: item.GiaBan
                    }))
                };
                
                const res = await fetch(`${API_URL}/staff/order/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData)
                });
                
                const data = await res.json();
                if (data.success) {
                    alert('Tạo đơn hàng thành công!');
                    handleCloseCreateModal();
                    loadPendingData();
                } else {
                    alert('Lỗi: ' + data.message);
                }
            } else {
                // For appointments with multiple services
                if (!selectedPet) {
                    alert('Vui lòng chọn thú cưng');
                    return;
                }
                
                if (!serviceStaffAssignments || serviceStaffAssignments.length === 0) {
                    alert('Vui lòng chọn nhân viên cho các dịch vụ');
                    return;
                }
                
                const appointmentData = {
                    maKhachHang: customer.MaKhachHang,
                    maThuCung: selectedPet,
                    maChiNhanh: user.MaChiNhanh,
                    maNhanVien: user.MaNhanVien,
                    services: serviceStaffAssignments.map(assignment => ({
                        maDichVu: assignment.service.MaDichVu,
                        maBacSi: assignment.selectedStaff,
                        donGia: assignment.service.GiaNiemYet,
                        ngayGioHen: assignment.dateTime
                    }))
                };
                
                const res = await fetch(`${API_URL}/staff/appointment/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(appointmentData)
                });
                
                const data = await res.json();
                if (data.success) {
                    alert('Tạo lịch hẹn thành công!');
                    handleCloseCreateModal();
                    loadPendingData();
                    loadPendingAppointments();
                } else {
                    alert('Lỗi: ' + data.message);
                }
            }
        } catch (error) {
            console.error('Error creating:', error);
            alert('Lỗi khi tạo');
        }
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setCreateType('');
        setCustomerName('');
        setCustomerPhone('');
        setCustomer(null);
        setCustomerPets([]);
        setSelectedPet('');
        setProducts([]);
        setServices([]);
        setSelectedItems([]);
    };

    // Payment handling functions
    const handleSelectPaymentCustomer = async (selectedCustomer) => {
        setPaymentCustomer(selectedCustomer);
        setPaymentSearchQuery(selectedCustomer.HoTen);
        setShowPaymentSearchResults(false);
        
        // Load pending invoices for this customer
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/staff/invoices/pending?customerId=${selectedCustomer.MaKhachHang}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPendingInvoices(data.invoices);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
        }
    };

    const handleCompletePayment = async (invoice) => {
        if (!window.confirm(`Xác nhận thanh toán hóa đơn ${invoice.MaHoaDon.substring(0, 8)}...?`)) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/staff/invoice/${invoice.MaHoaDon}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await res.json();
            if (data.success) {
                alert('Thanh toán thành công!');
                // Reload invoices
                handleSelectPaymentCustomer(paymentCustomer);
                // Refresh pending lists
                loadPendingData();
                loadPendingAppointments();
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error completing payment:', error);
            alert('Lỗi khi thanh toán');
        }
    };

    const handleResetPaymentSearch = () => {
        setPaymentCustomer(null);
        setPaymentSearchQuery('');
        setPendingInvoices([]);
        setSelectedInvoice(null);
    };

    const handleViewDetails = async (item, type) => {
        setDetailsType(type);
        setDetailsData([]); // Reset data
        setShowDetailsModal(true);
        
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            let res;
            if (type === 'order') {
                res = await fetch(`${API_URL}/staff/order/${item.MaDonHang}/details`, { headers });
            } else {
                res = await fetch(`${API_URL}/staff/appointment/${item.MaLichHen}/details`, { headers });
            }
            
            const data = await res.json();
            console.log('Details response:', data); // Debug log
            if (data.success) {
                setDetailsData(data.details);
            } else {
                console.error('Failed to load details:', data.message);
                alert('Không thể tải chi tiết: ' + (data.message || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Error loading details:', error);
            alert('Lỗi khi tải chi tiết');
        }
    };

    const handleConfirmOrder = async (orderId) => {
        if (!window.confirm('Xác nhận đơn hàng này?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/staff/order/${orderId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ staffId: user.MaNhanVien })
            });
            
            const data = await res.json();
            if (data.success) {
                alert('Đã xác nhận đơn hàng và tạo hóa đơn thành công!');
                loadPendingData();
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            alert('Lỗi khi xác nhận đơn hàng');
        }
    };

    const handleConfirmAppointment = async (appointmentId) => {
        if (!window.confirm('Xác nhận lịch hẹn này?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/staff/appointment/${appointmentId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ staffId: user.MaNhanVien })
            });
            
            const data = await res.json();
            if (data.success) {
                alert('Đã xác nhận lịch hẹn và tạo hóa đơn thành công!');
                loadPendingAppointments();
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error confirming appointment:', error);
            alert('Lỗi khi xác nhận lịch hẹn');
        }
    };

    const handleOpenPetModal = async () => {
        setShowPetModal(true);
        setCustomer(null);
        setCustomerName('');
        setCustomerPhone('');
        setNewPet({
            TenThuCung: '', Giong: '', NgaySinh: '', GioiTinh: 'Đực', CanNang: '', TinhTrangSK: '', MaLoaiTC: ''
        });
        
        // Load pet types
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/staff/pet-types`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setPetTypes(data.petTypes);
        } catch (error) {
            console.error('Error loading pet types:', error);
        }
    };

    const handleRegisterPet = async () => {
        if (!customer) {
            alert('Vui lòng tìm khách hàng trước');
            return;
        }
        
        if (!newPet.TenThuCung || !newPet.MaLoaiTC || !newPet.GioiTinh) {
            alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/staff/customer/register-pet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    maKhachHang: customer.MaKhachHang,
                    maLoaiTC: newPet.MaLoaiTC,
                    tenThuCung: newPet.TenThuCung,
                    giong: newPet.Giong,
                    ngaySinh: newPet.NgaySinh,
                    gioiTinh: newPet.GioiTinh,
                    canNang: newPet.CanNang,
                    tinhTrangSK: newPet.TinhTrangSK
                })
            });
            
            const data = await res.json();
            if (data.success) {
                alert('Đăng ký thú cưng thành công!');
                setShowPetModal(false);
                setCustomer(null);
                setCustomerName('');
                setCustomerPhone('');
                setNewPet({
                    TenThuCung: '', Giong: '', NgaySinh: '', GioiTinh: 'Đực', CanNang: '', TinhTrangSK: '', MaLoaiTC: ''
                });
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error registering pet:', error);
            alert('Lỗi khi đăng ký thú cưng');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Styles
    const containerStyle = { padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#ecf0f1', minHeight: '100vh' };
    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#2c3e50', color: 'white', borderRadius: '8px', marginBottom: '20px' };
    const buttonStyle = { padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', color: 'white', transition: 'all 0.3s' };
    const cardStyle = { backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' };
    const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#34495e', color: 'white' };
    const tdStyle = { padding: '12px', borderBottom: '1px solid #ddd' };
    const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
    const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };
    const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', width: '100%' };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={{ margin: 0, marginBottom: '5px' }}>🏥 Bảng điều khiển nhân viên</h2>
                    <p style={{ margin: 0, opacity: 0.9 }}>Xin chào, {user?.HoTen || user?.name}</p>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '14px', marginTop: '5px' }}>
                        Chi nhánh: {branches?.find(b => b.MaChiNhanh === user?.MaChiNhanh)?.TenChiNhanh || 'Đang tải...'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={handleLogout} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>Đăng xuất</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <button 
                    onClick={() => handleOpenCreateModal('order')} 
                    style={{...buttonStyle, backgroundColor: '#27ae60'}}
                >
                    🛒 Tạo đơn hàng
                </button>
                <button 
                    onClick={() => handleOpenCreateModal('appointment')} 
                    style={{...buttonStyle, backgroundColor: '#3498db'}}
                >
                    📅 Tạo lịch hẹn
                </button>
                {user?.ChucVu !== 'Bác sĩ thú y' && (
                    <button 
                        onClick={handleOpenPetModal} 
                        style={{...buttonStyle, backgroundColor: '#9b59b6'}}
                    >
                        🐾 Đăng ký thú cưng
                    </button>
                )}
                <button 
                    onClick={() => setShowPaymentModal(true)} 
                    style={{...buttonStyle, backgroundColor: '#e67e22'}}
                >
                    💰 Thanh toán
                </button>
            </div>

            {activeTab === 'pending' && (
                <div>
                    <OrderList 
                        orders={pendingOrders}
                        onViewDetails={handleViewDetails}
                        onConfirm={handleConfirmOrder}
                        cardStyle={cardStyle}
                        tableStyle={tableStyle}
                        thStyle={thStyle}
                        tdStyle={tdStyle}
                        buttonStyle={buttonStyle}
                    />
                    
                    <AppointmentList 
                        appointments={pendingAppointments}
                        onViewDetails={handleViewDetails}
                        onConfirm={handleConfirmAppointment}
                        currentPage={appointmentPage}
                        totalPages={appointmentTotalPages}
                        totalItems={appointmentTotal}
                        onPageChange={setAppointmentPage}
                        cardStyle={cardStyle}
                        tableStyle={tableStyle}
                        thStyle={thStyle}
                        tdStyle={tdStyle}
                        buttonStyle={buttonStyle}
                    />
                </div>
            )}

            <CreateModal 
                show={showCreateModal}
                type={createType}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                customer={customer}
                setCustomer={setCustomer}
                customerPets={customerPets}
                selectedPet={selectedPet}
                setSelectedPet={setSelectedPet}
                products={products}
                services={services}
                selectedItems={selectedItems}
                onFindCustomer={handleFindCustomer}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onQuantityChange={handleQuantityChange}
                onClose={handleCloseCreateModal}
                onSubmit={handleSubmitCreate}
                modalOverlayStyle={modalOverlayStyle}
                modalContentStyle={modalContentStyle}
                buttonStyle={buttonStyle}
                inputStyle={inputStyle}
                branchId={selectedBranch}
                apiUrl={API_URL}
                token={localStorage.getItem('token')}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                showSearchResults={showSearchResults}
                setShowSearchResults={setShowSearchResults}
                onSelectCustomer={handleSelectCustomer}
            />

            <DetailsModal 
                show={showDetailsModal}
                type={detailsType}
                data={detailsData}
                onClose={() => setShowDetailsModal(false)}
                modalOverlayStyle={modalOverlayStyle}
                modalContentStyle={modalContentStyle}
                tableStyle={tableStyle}
                thStyle={thStyle}
                tdStyle={tdStyle}
                buttonStyle={buttonStyle}
            />

            {/* Pet Registration Modal */}
            {showPetModal && (
                <div style={modalOverlayStyle} onClick={() => setShowPetModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: '#9b59b6' }}>🐾 Đăng ký thú cưng cho khách hàng</h2>
                        
                        {/* Customer Search Section */}
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <h3 style={{ marginTop: 0 }}>Tìm khách hàng</h3>
                            <div style={{ position: 'relative', display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input 
                                        style={{...inputStyle, width: '100%'}}
                                        placeholder="Tìm theo tên hoặc số điện thoại"
                                        value={customer ? `${customer.HoTen} - ${customer.SoDienThoai}` : searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setShowSearchResults(searchResults.length > 0)}
                                        disabled={customer !== null}
                                    />
                                    {showSearchResults && searchResults.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}>
                                            {searchResults.map((result) => (
                                                <div
                                                    key={result.MaKhachHang}
                                                    style={{
                                                        padding: '10px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                    onClick={() => handleSelectCustomer(result)}
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>{result.HoTen}</div>
                                                    <div style={{ fontSize: '0.9em', color: '#666' }}>{result.SoDienThoai}</div>
                                                    {result.Email && <div style={{ fontSize: '0.85em', color: '#999' }}>{result.Email}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {customer && (
                                    <button 
                                        onClick={() => {
                                            setCustomer(null);
                                            setCustomerName('');
                                            setCustomerPhone('');
                                            setSearchQuery('');
                                            setSearchResults([]);
                                            setShowSearchResults(false);
                                        }}
                                        style={{...buttonStyle, backgroundColor: '#e67e22', whiteSpace: 'nowrap'}}
                                    >
                                        Đổi khách
                                    </button>
                                )}
                            </div>
                            
                            {customer && (
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                                    ✓ Đã chọn: <strong>{customer.HoTen}</strong> - {customer.SoDienThoai}
                                </div>
                            )}
                        </div>
                        
                        {/* Pet Information Form */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>Thông tin thú cưng</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Tên thú cưng <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input 
                                        style={inputStyle}
                                        placeholder="Tên thú cưng"
                                        value={newPet.TenThuCung}
                                        onChange={(e) => setNewPet({...newPet, TenThuCung: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Loại thú cưng <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <select 
                                        style={inputStyle}
                                        value={newPet.MaLoaiTC}
                                        onChange={(e) => setNewPet({...newPet, MaLoaiTC: e.target.value})}
                                    >
                                        <option value="">Chọn loại thú cưng</option>
                                        {petTypes.map(type => (
                                            <option key={type.MaLoaiTC} value={type.MaLoaiTC}>
                                                {type.TenLoai}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Giống</label>
                                    <input 
                                        style={inputStyle}
                                        placeholder="Giống"
                                        value={newPet.Giong}
                                        onChange={(e) => setNewPet({...newPet, Giong: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ngày sinh</label>
                                    <input 
                                        style={inputStyle}
                                        type="date"
                                        value={newPet.NgaySinh}
                                        onChange={(e) => setNewPet({...newPet, NgaySinh: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Giới tính <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <select 
                                        style={inputStyle}
                                        value={newPet.GioiTinh}
                                        onChange={(e) => setNewPet({...newPet, GioiTinh: e.target.value})}
                                    >
                                        <option value="Đực">Đực</option>
                                        <option value="Cái">Cái</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cân nặng (kg)</label>
                                    <input 
                                        style={inputStyle}
                                        type="number"
                                        step="0.1"
                                        placeholder="Cân nặng"
                                        value={newPet.CanNang}
                                        onChange={(e) => setNewPet({...newPet, CanNang: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tình trạng sức khỏe</label>
                                    <textarea 
                                        style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                                        placeholder="Tình trạng sức khỏe"
                                        value={newPet.TinhTrangSK}
                                        onChange={(e) => setNewPet({...newPet, TinhTrangSK: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setShowPetModal(false)}
                                style={{...buttonStyle, backgroundColor: '#95a5a6'}}
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleRegisterPet}
                                style={{...buttonStyle, backgroundColor: '#27ae60'}}
                                disabled={!customer}
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>💰 Thanh toán</h2>
                        
                        {/* Customer Search */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>Tìm khách hàng</h3>
                            <div style={{ position: 'relative' }}>
                                <input
                                    style={inputStyle}
                                    placeholder="Nhập tên hoặc số điện thoại khách hàng..."
                                    value={paymentSearchQuery}
                                    onChange={(e) => setPaymentSearchQuery(e.target.value)}
                                    disabled={!!paymentCustomer}
                                />
                                
                                {showPaymentSearchResults && !paymentCustomer && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        zIndex: 1000,
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        {paymentSearchResults.map(customer => (
                                            <div
                                                key={customer.MaKhachHang}
                                                onClick={() => handleSelectPaymentCustomer(customer)}
                                                style={{
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #eee',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                <strong>{customer.HoTen}</strong> - {customer.SoDienThoai}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {paymentCustomer && (
                                    <button
                                        onClick={handleResetPaymentSearch}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            padding: '5px 10px',
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Đổi khách
                                    </button>
                                )}
                            </div>
                            
                            {paymentCustomer && (
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                                    ✓ Đã chọn: <strong>{paymentCustomer.HoTen}</strong> - {paymentCustomer.SoDienThoai}
                                </div>
                            )}
                        </div>
                        
                        {/* Pending Invoices */}
                        {paymentCustomer && pendingInvoices.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3>Hóa đơn chưa thanh toán</h3>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Mã HĐ</th>
                                            <th style={thStyle}>Loại</th>
                                            <th style={thStyle}>Ngày tạo</th>
                                            <th style={thStyle}>Chi tiết</th>
                                            <th style={thStyle}>Tổng tiền</th>
                                            <th style={thStyle}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingInvoices.map(invoice => (
                                            <tr key={invoice.MaHoaDon}>
                                                <td style={tdStyle}>{invoice.MaHoaDon.substring(0, 8)}...</td>
                                                <td style={tdStyle}>{invoice.LoaiGiaoDich}</td>
                                                <td style={tdStyle}>{new Date(invoice.NgayTao).toLocaleDateString('vi-VN')}</td>
                                                <td style={tdStyle}>{invoice.ChiTiet}</td>
                                                <td style={tdStyle}>{invoice.TongTienThucTra?.toLocaleString()} đ</td>
                                                <td style={tdStyle}>
                                                    <button
                                                        onClick={() => handleCompletePayment(invoice)}
                                                        style={{...buttonStyle, backgroundColor: '#27ae60', padding: '5px 10px'}}
                                                    >
                                                        Xác nhận thanh toán
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {paymentCustomer && pendingInvoices.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                                Không có hóa đơn chưa thanh toán
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    handleResetPaymentSearch();
                                }}
                                style={{...buttonStyle, backgroundColor: '#95a5a6'}}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
