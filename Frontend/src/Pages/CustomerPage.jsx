import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [pets, setPets] = useState([]);
    const [history, setHistory] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [suitableProducts, setSuitableProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [availableVets, setAvailableVets] = useState([]);
    const [showHistoryDetails, setShowHistoryDetails] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutBranch, setCheckoutBranch] = useState('');

    // Forms state (removed newPet - no longer allowing pet registration)
    const [booking, setBooking] = useState({
        MaChiNhanh: '', MaThuCung: '', NgayGioHen: '', DichVu: [] // Array of {MaDichVu, MaBacSi}
    });
    
    // Initialize cart from localStorage
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('petcareCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('petcareCart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchData();
    }, [user]);

    useEffect(() => {
        if (booking.MaChiNhanh && booking.NgayGioHen) {
            fetchAvailableVets(booking.MaChiNhanh, booking.NgayGioHen);
        }
    }, [booking.MaChiNhanh, booking.NgayGioHen]);

    const fetchData = async () => {
        try {
            const [prodRes, servRes, petRes, histRes, branchRes] = await Promise.all([
                fetch('http://localhost:5000/api/customer/products').then(res => res.json()),
                fetch('http://localhost:5000/api/customer/services').then(res => res.json()),
                fetch(`http://localhost:5000/api/customer/pets/${user.MaKhachHang}`).then(res => res.json()),
                fetch(`http://localhost:5000/api/customer/history/${user.MaKhachHang}`).then(res => res.json()),
                fetch('http://localhost:5000/api/customer/branches').then(res => res.json())
            ]);

            if (prodRes.success) setProducts(prodRes.data);
            if (servRes.success) setServices(servRes.data);
            if (histRes.success) setHistory(histRes.data);
            if (branchRes.success) setBranches(branchRes.data);
            
            if (petRes.success) {
                setPets(petRes.data);
                // Fetch suitable products for all pets
                if (petRes.data.length > 0) {
                    const suitableProds = await Promise.all(
                        petRes.data.map(pet => 
                            fetch(`http://localhost:5000/api/customer/suitable-products/${pet.MaThuCung}`)
                                .then(res => res.json())
                                .then(data => data.success ? data.data : [])
                        )
                    );
                    // Flatten and deduplicate products
                    const allSuitable = [...new Map(suitableProds.flat().map(item => [item.MaSanPham, item])).values()];
                    setSuitableProducts(allSuitable);
                }
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchInvoices = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/customer/invoices/confirmed/${user.MaKhachHang}`);
            const data = await res.json();
            if (data.success) {
                setInvoices(data.data);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const fetchAvailableVets = async (branchId, appointmentTime) => {
        if (!branchId || !appointmentTime) return;
        try {
            const res = await fetch(`http://localhost:5000/api/customer/branches/${branchId}/available-vets?appointmentTime=${appointmentTime}`);
            const data = await res.json();
            if (data.success) {
                setAvailableVets(data.data);
            }
        } catch (error) {
            console.error('Error fetching vets:', error);
            setAvailableVets([]);
        }
    };

    const handleViewHistoryDetails = async (historyItem) => {
        if (historyItem.Type === 'Appointment') {
            try {
                const res = await fetch(`http://localhost:5000/api/customer/appointment/${historyItem.ID}/details`);
                const data = await res.json();
                if (data.success) {
                    setSelectedHistoryItem({ ...data.data, Type: 'Appointment' });
                    setShowHistoryDetails(true);
                }
            } catch (error) {
                console.error('Error fetching appointment details:', error);
                alert('Không thể tải chi tiết lịch hẹn');
            }
        } else if (historyItem.Type === 'Order') {
            try {
                const res = await fetch(`http://localhost:5000/api/customer/order/${historyItem.ID}/details`);
                const data = await res.json();
                if (data.success) {
                    setSelectedHistoryItem({ items: data.data, Type: 'Order' });
                    setShowHistoryDetails(true);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                alert('Không thể tải chi tiết đơn hàng');
            }
        }
    };

    const handleSearch = async () => {
        if (!searchKeyword.trim()) return;
        try {
            const res = await fetch(`http://localhost:5000/api/customer/search?keyword=${searchKeyword}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.data);
                setActiveTab('search');
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.MaSanPham === product.MaSanPham);
        if (existingItem) {
            setCart(cart.map(item => item.MaSanPham === product.MaSanPham ? { ...item, SoLuong: item.SoLuong + 1 } : item));
        } else {
            setCart([...cart, { ...product, SoLuong: 1 }]);
        }
        alert(`Đã thêm ${product.TenSanPham} vào giỏ hàng`);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setShowCheckoutModal(true);
    };

    const confirmCheckout = async () => {
        if (!checkoutBranch) {
            alert('Vui lòng chọn chi nhánh');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/customer/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    MaKhachHang: user.MaKhachHang,
                    MaChiNhanh: checkoutBranch,
                    ChiTiet: cart.map(item => ({ MaSanPham: item.MaSanPham, SoLuong: item.SoLuong }))
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Đặt hàng thành công!');
                setCart([]);
                setShowCheckoutModal(false);
                setCheckoutBranch('');
                fetchData();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert('Lỗi khi đặt hàng');
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/customer/appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...booking, MaKhachHang: user.MaKhachHang })
            });
            const data = await res.json();
            if (data.success) {
                alert('Đặt lịch thành công!');
                fetchData();
                setBooking({ MaChiNhanh: '', MaThuCung: '', NgayGioHen: '', DichVu: [] });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Booking error:", error);
        }
    };

    const toggleServiceSelection = (serviceId) => {
        const existingIndex = booking.DichVu.findIndex(s => s.MaDichVu === serviceId);
        if (existingIndex >= 0) {
            setBooking({ ...booking, DichVu: booking.DichVu.filter((_, idx) => idx !== existingIndex) });
        } else {
            setBooking({ ...booking, DichVu: [...booking.DichVu, { MaDichVu: serviceId, MaBacSi: null }] });
        }
    };

    const updateServiceVet = (serviceId, vetId) => {
        setBooking({
            ...booking,
            DichVu: booking.DichVu.map(s => s.MaDichVu === serviceId ? { ...s, MaBacSi: vetId || null } : s)
        });
    };

    const handleViewSuitableProducts = async (petId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/customer/suitable-products/${petId}`);
            const data = await res.json();
            if (data.success) {
                setSelectedPet(pets.find(p => p.MaThuCung === petId));
                setSuitableProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching suitable products:', error);
        }
    };

    // Styles
    const containerStyle = { padding: '20px', fontFamily: 'Arial, sans-serif' };
    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' };
    const navStyle = { display: 'flex', gap: '10px' };
    const tabStyle = (isActive) => ({ padding: '10px 20px', cursor: 'pointer', backgroundColor: isActive ? '#3498db' : '#ecf0f1', color: isActive ? 'white' : 'black', borderRadius: '5px' });
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' };
    const cardStyle = { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
    const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' };
    const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
    const buttonStyle = { padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2>Xin chào, {user?.HoTen}</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            style={inputStyle} 
                            placeholder="Tìm kiếm..." 
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <button onClick={handleSearch} style={{...buttonStyle, backgroundColor: '#3498db'}}>Tìm</button>
                    </div>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>Đăng xuất</button>
            </div>

            <div style={{...navStyle, marginBottom: '20px'}}>
                <div style={tabStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}>Sản phẩm</div>
                <div style={tabStyle(activeTab === 'services')} onClick={() => setActiveTab('services')}>Dịch vụ</div>
                <div style={tabStyle(activeTab === 'pets')} onClick={() => setActiveTab('pets')}>Thú cưng</div>
                <div style={tabStyle(activeTab === 'booking')} onClick={() => setActiveTab('booking')}>Đặt lịch</div>
                <div style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>Lịch sử</div>
                <div style={tabStyle(activeTab === 'invoices')} onClick={() => { setActiveTab('invoices'); fetchInvoices(); }}>Hóa đơn</div>
                <div style={tabStyle(activeTab === 'cart')} onClick={() => setActiveTab('cart')}>Giỏ hàng ({cart.reduce((acc, item) => acc + item.SoLuong, 0)})</div>
            </div>

            {activeTab === 'products' && (
                <div>
                    {suitableProducts.length > 0 && (
                        <div style={{marginBottom: '30px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px'}}>
                            <h3>🐾 Sản phẩm phù hợp cho thú cưng của bạn</h3>
                            <div style={gridStyle}>
                                {suitableProducts.map(p => (
                                    <div key={p.MaSanPham} style={{...cardStyle, borderColor: '#4caf50', borderWidth: '2px'}}>
                                        <span style={{backgroundColor: '#4caf50', color: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '12px'}}>Được đề xuất</span>
                                        <h3>{p.TenSanPham}</h3>
                                        <p>Giá: {p.GiaBan.toLocaleString()} VND</p>
                                        {p.MoTa && <p style={{fontSize: '13px', color: '#666', marginTop: '8px'}}>{p.MoTa}</p>}
                                        <p style={{fontSize: '12px', color: '#555'}}>Phù hợp với: {p.PhuHopVoiLoai}</p>
                                        <button onClick={() => addToCart(p)} style={buttonStyle}>Thêm vào giỏ</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <h3>Tất cả sản phẩm</h3>
                    <div style={gridStyle}>
                        {products.map(p => (
                            <div key={p.MaSanPham} style={cardStyle}>
                                <h3>{p.TenSanPham}</h3>
                                <p>Giá: {p.GiaBan.toLocaleString()} VND</p>
                                {p.MoTa && <p style={{fontSize: '13px', color: '#666', marginTop: '8px', marginBottom: '10px'}}>{p.MoTa}</p>}
                                <button onClick={() => addToCart(p)} style={buttonStyle}>Thêm vào giỏ</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div style={gridStyle}>
                    {services.map(s => (
                        <div key={s.MaDichVu} style={cardStyle}>
                            <h3>{s.TenDichVu}</h3>
                            <p>Giá: {s.GiaNiemYet.toLocaleString()} VND</p>
                            <p>{s.MoTa}</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'search' && (
                <div>
                    <h3>Kết quả tìm kiếm</h3>
                    <div style={gridStyle}>
                        {searchResults.map((item, idx) => (
                            <div key={idx} style={cardStyle}>
                                <span style={{fontSize: '12px', color: '#7f8c8d'}}>{item.Type}</span>
                                <h3>{item.Name}</h3>
                                <p>Giá: {item.Price.toLocaleString()} VND</p>
                                {item.Type === 'Product' && <button onClick={() => addToCart({MaSanPham: item.ID, TenSanPham: item.Name, GiaBan: item.Price})} style={buttonStyle}>Thêm vào giỏ</button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'pets' && (
                <div>
                    <h3>Danh sách thú cưng của bạn</h3>
                    <div style={gridStyle}>
                        {pets.map(p => (
                            <div key={p.MaThuCung} style={cardStyle}>
                                <h4>{p.TenThuCung}</h4>
                                <p>Giống: {p.Giong}</p>
                                <p>Cân nặng: {p.CanNang} kg</p>
                                <button 
                                    onClick={() => handleViewSuitableProducts(p.MaThuCung)} 
                                    style={{...buttonStyle, backgroundColor: '#9b59b6', marginTop: '10px'}}
                                >
                                    Xem sản phẩm phù hợp
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {selectedPet && suitableProducts.length > 0 && (
                        <div style={{marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px'}}>
                            <h3>Sản phẩm phù hợp cho {selectedPet.TenThuCung}</h3>
                            <div style={gridStyle}>
                                {suitableProducts.map(sp => (
                                    <div key={sp.MaSanPham} style={cardStyle}>
                                        <h4>{sp.TenSanPham}</h4>
                                        <p>Giá: {sp.GiaBan.toLocaleString()} VND</p>
                                        <p style={{fontSize: '12px', color: '#7f8c8d'}}>Phù hợp với: {sp.PhuHopVoiLoai}</p>
                                        <button onClick={() => addToCart(sp)} style={buttonStyle}>Thêm vào giỏ</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'booking' && (
                <div style={{maxWidth: '600px', margin: '0 auto'}}>
                    <h3>Đặt lịch hẹn</h3>
                    <form onSubmit={handleBookAppointment} style={formStyle}>
                        <label style={{fontWeight: 'bold', marginBottom: '5px'}}>Nhập ID Chi nhánh (hoặc chọn từ danh sách - demo nhập tay):</label>
                        <input 
                            style={inputStyle} 
                            type="text" 
                            placeholder="Nhập ID chi nhánh" 
                            value={booking.MaChiNhanh} 
                            onChange={e => setBooking({...booking, MaChiNhanh: e.target.value})} 
                            required 
                        />
                        <select style={inputStyle} value={booking.MaChiNhanh} onChange={e => setBooking({...booking, MaChiNhanh: e.target.value})}>
                            <option value="">-- Hoặc chọn từ danh sách --</option>
                            {branches.map(b => (
                                <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                                    {b.TenChiNhanh} - {b.DiaChi || 'Không có địa chỉ'}
                                </option>
                            ))}
                        </select>
                        <select style={inputStyle} value={booking.MaThuCung} onChange={e => setBooking({...booking, MaThuCung: e.target.value})} required>
                            <option value="">Chọn thú cưng</option>
                            {pets.map(p => <option key={p.MaThuCung} value={p.MaThuCung}>{p.TenThuCung}</option>)}
                        </select>
                        <input style={inputStyle} type="datetime-local" value={booking.NgayGioHen} onChange={e => setBooking({...booking, NgayGioHen: e.target.value})} required />
                        
                        <h4>Chọn dịch vụ:</h4>
                        <div style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '10px'}}>
                            {services.map(s => {
                                const selectedService = booking.DichVu.find(d => d.MaDichVu === s.MaDichVu);
                                return (
                                    <div key={s.MaDichVu} style={{marginBottom: '15px', padding: '10px', backgroundColor: selectedService ? '#e3f2fd' : 'transparent', borderRadius: '5px'}}>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <input 
                                                type="checkbox" 
                                                checked={!!selectedService}
                                                onChange={() => toggleServiceSelection(s.MaDichVu)}
                                            />
                                            <span style={{fontWeight: 'bold'}}>{s.TenDichVu}</span>
                                            <span style={{color: '#666'}}>- {s.GiaNiemYet.toLocaleString()} VND</span>
                                        </label>
                                        
                                        {selectedService && availableVets.length > 0 && (
                                            <div style={{marginTop: '10px', marginLeft: '30px'}}>
                                                <label style={{fontSize: '14px', color: '#555'}}>Chọn bác sĩ (tùy chọn):</label>
                                                <select 
                                                    style={{...inputStyle, marginTop: '5px', width: '100%'}}
                                                    value={selectedService.MaBacSi || ''}
                                                    onChange={(e) => updateServiceVet(s.MaDichVu, e.target.value)}
                                                >
                                                    <option value="">Ngẫu nhiên</option>
                                                    {availableVets.map(v => (
                                                        <option key={v.MaNhanVien} value={v.MaNhanVien}>
                                                            {v.HoTen}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        
                                        {selectedService && availableVets.length === 0 && booking.MaChiNhanh && booking.NgayGioHen && (
                                            <div style={{marginTop: '5px', marginLeft: '30px', fontSize: '12px', color: '#ff9800'}}>
                                                ⚠️ Không có bác sĩ khả dụng tại thời điểm này
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button type="submit" style={buttonStyle}>Đặt lịch</button>
                    </form>
                </div>
            )}

            {activeTab === 'cart' && (
                <div>
                    <h3>Giỏ hàng</h3>
                    {cart.length === 0 ? <p>Giỏ hàng trống</p> : (
                        <div>
                            {cart.map((item, idx) => (
                                <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee'}}>
                                    <span>{item.TenSanPham} (x{item.SoLuong})</span>
                                    <span>{(item.GiaBan * item.SoLuong).toLocaleString()} VND</span>
                                </div>
                            ))}
                            <div style={{marginTop: '20px', textAlign: 'right'}}>
                                <h4>Tổng cộng: {cart.reduce((acc, item) => acc + item.GiaBan * item.SoLuong, 0).toLocaleString()} VND</h4>
                                <button onClick={handleCheckout} style={buttonStyle}>Thanh toán</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div>
                    <h3>Lịch sử hoạt động</h3>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{backgroundColor: '#f2f2f2'}}>
                                <th style={{padding: '10px', border: '1px solid #ddd'}}>Loại</th>
                                <th style={{padding: '10px', border: '1px solid #ddd'}}>Ngày</th>
                                <th style={{padding: '10px', border: '1px solid #ddd'}}>Trạng thái</th>
                                <th style={{padding: '10px', border: '1px solid #ddd'}}>Tổng tiền</th>
                                <th style={{padding: '10px', border: '1px solid #ddd'}}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, idx) => (
                                <tr key={idx}>
                                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{h.Type === 'Order' ? 'Đơn hàng' : 'Lịch hẹn'}</td>
                                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{new Date(h.Date).toLocaleString()}</td>
                                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{h.Status}</td>
                                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{h.Total ? h.Total.toLocaleString() : '-'}</td>
                                    <td style={{padding: '10px', border: '1px solid #ddd'}}>
                                        <button 
                                            onClick={() => handleViewHistoryDetails(h)}
                                            style={{...buttonStyle, backgroundColor: '#3498db', padding: '5px 15px', fontSize: '14px'}}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'invoices' && (
                <div>
                    <h3>🧾 Hóa đơn đã xác nhận</h3>
                    <p style={{color: '#666', marginBottom: '20px'}}>Danh sách hóa đơn từ đơn hàng và lịch hẹn đã được xác nhận hoặc sẵn sàng để lấy</p>
                    {invoices.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                            <p>Chưa có hóa đơn nào</p>
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {invoices.map((invoice, idx) => (
                                <div key={idx} style={{...cardStyle, borderLeft: '4px solid #2ecc71'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                                        <h4 style={{margin: 0}}>Hóa đơn #{invoice.MaHoaDon.substring(0, 8)}</h4>
                                        <span style={{backgroundColor: invoice.LoaiGiaoDich === 'Đơn hàng' ? '#3498db' : '#9b59b6', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px'}}>
                                            {invoice.LoaiGiaoDich}
                                        </span>
                                    </div>
                                    <div style={{fontSize: '14px', color: '#555', marginBottom: '5px'}}>
                                        <strong>Chi nhánh:</strong> {invoice.TenChiNhanh}
                                    </div>
                                    <div style={{fontSize: '14px', color: '#555', marginBottom: '5px'}}>
                                        <strong>Nhân viên:</strong> {invoice.NhanVienXuLy || 'Chưa xác định'}
                                    </div>
                                    <div style={{fontSize: '14px', color: '#555', marginBottom: '5px'}}>
                                        <strong>Ngày:</strong> {new Date(invoice.NgayGiaoDich).toLocaleString()}
                                    </div>
                                    <div style={{fontSize: '14px', color: '#555', marginBottom: '10px'}}>
                                        <strong>Trạng thái:</strong> <span style={{color: '#27ae60', fontWeight: 'bold'}}>{invoice.TrangThai}</span>
                                    </div>
                                    <div style={{borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px'}}>
                                        <div style={{fontSize: '13px', color: '#777', marginBottom: '3px'}}>Tổng phụ: {invoice.TongPhu.toLocaleString()} VND</div>
                                        {invoice.TongTienGiam > 0 && (
                                            <div style={{fontSize: '13px', color: '#e74c3c', marginBottom: '3px'}}>Giảm giá: -{invoice.TongTienGiam.toLocaleString()} VND</div>
                                        )}
                                        {invoice.DiemLoyaltySuDung > 0 && (
                                            <div style={{fontSize: '13px', color: '#f39c12', marginBottom: '3px'}}>Điểm loyalty: {invoice.DiemLoyaltySuDung} điểm (-{invoice.TienGiamTuDiem.toLocaleString()} VND)</div>
                                        )}
                                        <div style={{fontSize: '16px', fontWeight: 'bold', color: '#2ecc71', marginTop: '8px'}}>
                                            Tổng thanh toán: {invoice.TongTienThucTra.toLocaleString()} VND
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* History Details Modal */}
            {showHistoryDetails && selectedHistoryItem && (
                <div style={{
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
                }} onClick={() => setShowHistoryDetails(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        padding: '25px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '15px'}}>
                            <h2 style={{margin: 0, color: '#2c3e50'}}>
                                {selectedHistoryItem.Type === 'Order' ? '🛒 Chi tiết đơn hàng' : '📋 Chi tiết lịch hẹn'}
                            </h2>
                            <button onClick={() => setShowHistoryDetails(false)} style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '28px',
                                cursor: 'pointer',
                                color: '#7f8c8d'
                            }}>×</button>
                        </div>

                        {selectedHistoryItem.Type === 'Order' ? (
                            <div style={{display: 'grid', gap: '15px'}}>
                                <div style={{padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '8px'}}>
                                    <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>🏥 Thông tin chi nhánh</h3>
                                    <p style={{margin: '5px 0'}}><strong>Chi nhánh:</strong> {selectedHistoryItem.items[0]?.TenChiNhanh}</p>
                                    <p style={{margin: '5px 0'}}><strong>Địa chỉ:</strong> {selectedHistoryItem.items[0]?.DiaChiChiNhanh}</p>
                                </div>

                                <div style={{padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px'}}>
                                    <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>📦 Thông tin đơn hàng</h3>
                                    <p style={{margin: '5px 0'}}><strong>Ngày đặt:</strong> {new Date(selectedHistoryItem.items[0]?.NgayDat).toLocaleString('vi-VN')}</p>
                                    <p style={{margin: '5px 0'}}><strong>Loại đơn:</strong> {selectedHistoryItem.items[0]?.LoaiDon}</p>
                                    <p style={{margin: '5px 0'}}><strong>Trạng thái:</strong> <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: selectedHistoryItem.items[0]?.TrangThai === 'Hoàn tất' ? '#d4edda' : '#fff3cd',
                                        color: selectedHistoryItem.items[0]?.TrangThai === 'Hoàn tất' ? '#155724' : '#856404'
                                    }}>{selectedHistoryItem.items[0]?.TrangThai}</span></p>
                                </div>

                                <div style={{padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px'}}>
                                    <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>🛍️ Sản phẩm</h3>
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <thead>
                                            <tr style={{borderBottom: '2px solid #ddd'}}>
                                                <th style={{padding: '8px', textAlign: 'left'}}>Sản phẩm</th>
                                                <th style={{padding: '8px', textAlign: 'center'}}>SL</th>
                                                <th style={{padding: '8px', textAlign: 'right'}}>Đơn giá</th>
                                                <th style={{padding: '8px', textAlign: 'right'}}>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedHistoryItem.items.map((item, idx) => (
                                                <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                                                    <td style={{padding: '8px'}}>{item.TenSanPham}</td>
                                                    <td style={{padding: '8px', textAlign: 'center'}}>{item.SoLuong}</td>
                                                    <td style={{padding: '8px', textAlign: 'right'}}>{item.DonGiaBan.toLocaleString()} VND</td>
                                                    <td style={{padding: '8px', textAlign: 'right'}}>{item.ThanhTien.toLocaleString()} VND</td>
                                                </tr>
                                            ))}
                                            <tr style={{borderTop: '2px solid #ddd', fontWeight: 'bold'}}>
                                                <td colSpan="3" style={{padding: '8px', textAlign: 'right'}}>Tổng cộng:</td>
                                                <td style={{padding: '8px', textAlign: 'right', color: '#27ae60', fontSize: '16px'}}>
                                                    {selectedHistoryItem.items.reduce((sum, item) => sum + item.ThanhTien, 0).toLocaleString()} VND
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div style={{display: 'grid', gap: '15px'}}>
                            <div style={{padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '8px'}}>
                                <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>🏥 Thông tin chi nhánh</h3>
                                <p style={{margin: '5px 0'}}><strong>Chi nhánh:</strong> {selectedHistoryItem.TenChiNhanh}</p>
                                <p style={{margin: '5px 0'}}><strong>Địa chỉ:</strong> {selectedHistoryItem.DiaChiChiNhanh}</p>
                            </div>

                            <div style={{padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px'}}>
                                <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>🐾 Thông tin thú cưng</h3>
                                <p style={{margin: '5px 0'}}><strong>Tên:</strong> {selectedHistoryItem.TenThuCung}</p>
                                <p style={{margin: '5px 0'}}><strong>Loại:</strong> {selectedHistoryItem.LoaiThuCung}</p>
                                {selectedHistoryItem.Giong && (
                                    <p style={{margin: '5px 0'}}><strong>Giống:</strong> {selectedHistoryItem.Giong}</p>
                                )}
                                <p style={{margin: '5px 0'}}><strong>Cân nặng:</strong> {selectedHistoryItem.CanNang} kg</p>
                            </div>

                            <div style={{padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px'}}>
                                <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>🩺 Thông tin khám</h3>
                                <p style={{margin: '5px 0'}}><strong>Ngày giờ:</strong> {new Date(selectedHistoryItem.NgayGioHen).toLocaleString('vi-VN')}</p>
                                <p style={{margin: '5px 0'}}><strong>Trạng thái:</strong> <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: selectedHistoryItem.TrangThai === 'Hoàn tất' ? '#d4edda' : '#fff3cd',
                                    color: selectedHistoryItem.TrangThai === 'Hoàn tất' ? '#155724' : '#856404'
                                }}>{selectedHistoryItem.TrangThai}</span></p>
                                <p style={{margin: '5px 0'}}><strong>Dịch vụ:</strong> {selectedHistoryItem.DichVu}</p>
                                {selectedHistoryItem.BacSi && (
                                    <p style={{margin: '5px 0'}}><strong>Bác sĩ:</strong> {selectedHistoryItem.BacSi}</p>
                                )}
                            </div>

                            {selectedHistoryItem.TrieuChung && (
                                <div style={{padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px'}}>
                                    <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>📝 Hồ sơ khám bệnh</h3>
                                    <p style={{margin: '5px 0'}}><strong>Triệu chứng:</strong> {selectedHistoryItem.TrieuChung}</p>
                                    <p style={{margin: '5px 0'}}><strong>Chuẩn đoán:</strong> {selectedHistoryItem.ChuanDoan}</p>
                                    {selectedHistoryItem.NgayTaiKham && (
                                        <p style={{margin: '5px 0'}}><strong>Ngày tái khám:</strong> {new Date(selectedHistoryItem.NgayTaiKham).toLocaleDateString('vi-VN')}</p>
                                    )}
                                </div>
                            )}

                            {selectedHistoryItem.KetQua && selectedHistoryItem.KetQua !== 'Trống' && (
                                <div style={{padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px'}}>
                                    <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>✅ Kết quả dịch vụ</h3>
                                    <p style={{margin: '5px 0', whiteSpace: 'pre-wrap'}}>{selectedHistoryItem.KetQua}</p>
                                </div>
                            )}
                        </div>
                        )}

                        <button onClick={() => setShowHistoryDetails(false)} style={{
                            ...buttonStyle,
                            backgroundColor: '#95a5a6',
                            width: '100%',
                            marginTop: '20px'
                        }}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div style={{
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
                }} onClick={() => setShowCheckoutModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        padding: '25px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{margin: '0 0 20px 0', color: '#2c3e50'}}>🛒 Thanh toán đơn hàng</h2>
                        
                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '8px'}}>
                                Chọn chi nhánh để nhận hàng:
                            </label>
                            <select 
                                style={inputStyle}
                                value={checkoutBranch}
                                onChange={(e) => setCheckoutBranch(e.target.value)}
                            >
                                <option value="">-- Chọn chi nhánh --</option>
                                {branches.map(b => (
                                    <option key={b.MaChiNhanh} value={b.MaChiNhanh}>
                                        {b.TenChiNhanh} - {b.DiaChi || 'Không có địa chỉ'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                            <h4 style={{margin: '0 0 10px 0'}}>Tóm tắt đơn hàng:</h4>
                            <p style={{margin: '5px 0'}}>Số sản phẩm: {cart.reduce((acc, item) => acc + item.SoLuong, 0)}</p>
                            <p style={{margin: '5px 0', fontSize: '16px', fontWeight: 'bold', color: '#27ae60'}}>
                                Tổng tiền: {cart.reduce((acc, item) => acc + (item.GiaBan * item.SoLuong), 0).toLocaleString()} VND
                            </p>
                        </div>

                        <div style={{display: 'flex', gap: '10px'}}>
                            <button 
                                onClick={() => {
                                    setShowCheckoutModal(false);
                                    setCheckoutBranch('');
                                }}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#95a5a6',
                                    flex: 1
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={confirmCheckout}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#27ae60',
                                    flex: 1
                                }}
                            >
                                Xác nhận đặt hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPage;