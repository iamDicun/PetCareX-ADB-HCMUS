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
    
    // Products and Services
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    
    // For appointments
    const [appointmentDateTime, setAppointmentDateTime] = useState('');
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    
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
    const [selectedItem, setSelectedItem] = useState(null);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (user?.MaChiNhanh) {
            loadPendingData();
        }
    }, [user]);
    
    useEffect(() => {
        if (user?.MaChiNhanh) {
            loadPendingAppointments();
        }
    }, [user, appointmentPage]);

    const loadPendingData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const ordersRes = await fetch(`${API_URL}/staff/orders/pending?branchId=${user.MaChiNhanh}`, { headers });
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
            
            const appointmentsRes = await fetch(`${API_URL}/staff/appointments/pending?branchId=${user.MaChiNhanh}&page=${appointmentPage}&limit=10`, { headers });
            const appointmentsData = await appointmentsRes.json();
            
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
                const res = await fetch(`${API_URL}/staff/products`, { headers });
                const data = await res.json();
                if (data.success) setProducts(data.products);
            } else {
                const res = await fetch(`${API_URL}/staff/services`, { headers });
                const data = await res.json();
                if (data.success) setServices(data.services);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleFindCustomer = async () => {
        if (!customerName || !customerPhone) {
            alert('Vui lòng nhập đầy đủ tên và số điện thoại');
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
                body: JSON.stringify({ name: customerName, phoneNum: customerPhone })
            });
            
            const data = await res.json();
            if (data.success) {
                setCustomer(data.customer);
                
                // Load pets if appointment
                if (createType === 'appointment') {
                    const petsRes = await fetch(`${API_URL}/staff/customer/${data.customer.MaKhachHang}/pets`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const petsData = await petsRes.json();
                    if (petsData.success) setCustomerPets(petsData.pets);
                }
            }
        } catch (error) {
            console.error('Error finding customer:', error);
            alert('Lỗi khi tìm khách hàng');
        }
    };

    const handleCheckAvailableDoctors = async () => {
        if (!appointmentDateTime) {
            alert('Vui lòng chọn thời gian');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${API_URL}/staff/doctors/available?branchId=${user.MaChiNhanh}&dateTime=${appointmentDateTime}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const data = await res.json();
            if (data.success) {
                setAvailableDoctors(data.doctors);
                if (data.doctors.length === 0) {
                    alert('Không có bác sĩ trống trong thời gian này');
                }
            }
        } catch (error) {
            console.error('Error checking doctors:', error);
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

    const handleSubmitCreate = async () => {
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
                if (!selectedPet) {
                    alert('Vui lòng chọn thú cưng');
                    return;
                }
                if (!appointmentDateTime) {
                    alert('Vui lòng chọn thời gian');
                    return;
                }
                if (!selectedDoctor) {
                    alert('Vui lòng chọn bác sĩ');
                    return;
                }
                
                const appointmentData = {
                    maKhachHang: customer.MaKhachHang,
                    maThuCung: selectedPet,
                    maChiNhanh: user.MaChiNhanh,
                    maNhanVien: user.MaNhanVien,
                    ngayGioHen: appointmentDateTime,
                    services: selectedItems.map(item => ({
                        maDichVu: item.MaDichVu,
                        maBacSi: selectedDoctor,
                        donGia: item.GiaNiemYet
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
        setAppointmentDateTime('');
        setAvailableDoctors([]);
        setSelectedDoctor('');
    };

    const handleViewDetails = async (item, type) => {
        setSelectedItem(item);
        setDetailsType(type);
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
            if (data.success) setDetailsData(data.details);
        } catch (error) {
            console.error('Error loading details:', error);
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
                </div>
                <button onClick={handleLogout} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>Đăng xuất</button>
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
                customerPets={customerPets}
                selectedPet={selectedPet}
                setSelectedPet={setSelectedPet}
                appointmentDateTime={appointmentDateTime}
                setAppointmentDateTime={setAppointmentDateTime}
                availableDoctors={availableDoctors}
                selectedDoctor={selectedDoctor}
                setSelectedDoctor={setSelectedDoctor}
                products={products}
                services={services}
                selectedItems={selectedItems}
                onFindCustomer={handleFindCustomer}
                onCheckDoctors={handleCheckAvailableDoctors}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onQuantityChange={handleQuantityChange}
                onClose={handleCloseCreateModal}
                onSubmit={handleSubmitCreate}
                modalOverlayStyle={modalOverlayStyle}
                modalContentStyle={modalContentStyle}
                buttonStyle={buttonStyle}
                inputStyle={inputStyle}
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
        </div>
    );
};

export default StaffDashboard;
