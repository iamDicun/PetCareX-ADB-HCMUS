import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const { cusLogin, staffLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('customer');
  const [hoten, setHoten] = useState("");
  const [sdt, setSdt] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    cccd: '',
    gioiTinh: 'Nam',
    ngaySinh: ''
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    let ok = false;
    if (activeTab === 'staff') {
        ok = await staffLogin(hoten, sdt);
        if (!ok) {
          alert("Sai thông tin đăng nhập");
          return;
        }
    } else {
        // Kiểm tra khách hàng tồn tại trước
        try {
          const response = await axios.get('http://localhost:5000/api/customer/check-customer', {
            params: { phoneNumber: sdt }
          });
          
          if (response.data.exists) {
            // Khách hàng đã tồn tại, kiểm tra tên
            const customer = response.data.data;
            if (customer.HoTen.toLowerCase() === hoten.toLowerCase()) {
              ok = await cusLogin(hoten, sdt);
            } else {
              alert("Tên khách hàng không khớp");
              return;
            }
          } else {
            // Khách hàng chưa tồn tại, hiển thị modal tạo mới
            setNewCustomerData({
              hoTen: hoten,
              soDienThoai: sdt,
              email: '',
              cccd: '',
              gioiTinh: 'Nam',
              ngaySinh: ''
            });
            setShowCreateModal(true);
            return;
          }
        } catch (error) {
          alert("Lỗi khi kiểm tra thông tin: " + (error.response?.data?.message || error.message));
          return;
        }
    }

    if (!ok) {
      alert("Sai thông tin đăng nhập");
    } else {
      if (activeTab === 'staff') {
          // Get user from localStorage to check position
          const userData = JSON.parse(localStorage.getItem('user'));
          const position = userData?.ChucVu;
          
          // Route based on position
          if (position === 'Nhân viên tiếp tân' || position === 'Nhân viên bán hàng') {
              navigate("/Staff/Dashboard");
          } else if (position === 'Bác sĩ thú y') {
              navigate("/Doctor/Dashboard");
          } else if (position === 'Nhân viên chăm sóc') {
              navigate("/CareStaff/Dashboard");
          } else if (position === 'Quản lý chi nhánh') {
              navigate("/BranchManager/Dashboard");
          } else if (position === 'Quản lý cấp công ty') {
              navigate("/CompanyManager/Dashboard");
          } else {
              // Default to staff dashboard for other positions
              navigate("/Staff/Dashboard");
          }
      } else {
          navigate("/CustomerPage");
      }
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    
    if (!newCustomerData.hoTen || !newCustomerData.soDienThoai) {
      alert('Họ tên và số điện thoại là bắt buộc');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/customer/create-customer-with-card',
        newCustomerData
      );

      if (response.data.success) {
        alert('Tạo tài khoản thành công! Vui lòng đăng nhập.');
        setShowCreateModal(false);
        // Reset form
        setHoten(newCustomerData.hoTen);
        setSdt(newCustomerData.soDienThoai);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#2c3e50'
  };

  const formStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px'
  };

  const buttonStyle = {
    padding: '10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  };

  const tabContainerStyle = {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd'
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isActive ? '#f1f1f1' : 'white',
    borderBottom: isActive ? '2px solid #3498db' : 'none',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleLogin}>
        <h2 style={{ textAlign: 'center', color: '#333', margin: '0 0 20px 0' }}>
            {activeTab === 'staff' ? 'Đăng nhập Nhân viên' : 'Đăng nhập Khách hàng'}
        </h2>
        <div style={tabContainerStyle}>
          <button
            type="button"
            style={tabStyle(activeTab === 'customer')}
            onClick={() => setActiveTab('customer')}
          >
            Khách hàng
          </button>

          <button
            type="button"
            style={tabStyle(activeTab === 'staff')}
            onClick={() => setActiveTab('staff')}
          >
            Nhân viên
          </button>
        </div>

        <input 
            style={inputStyle}
            value={hoten} 
            onChange={(e) => setHoten(e.target.value)} 
            placeholder="Họ tên" 
            required
        />
        <input 
            style={inputStyle}
            value={sdt} 
            type="text" 
            onChange={(e) => setSdt(e.target.value)} 
            placeholder="Số điện thoại" 
            required
        />
        <button type="submit" style={buttonStyle}>Đăng nhập</button>
      </form>

      {/* Modal tạo khách hàng mới */}
      {showCreateModal && (
        <div style={modalBackdropStyle} onClick={() => setShowCreateModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Tạo tài khoản khách hàng</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Không tìm thấy tài khoản. Vui lòng nhập thông tin đầy đủ để tạo tài khoản mới.
            </p>
            
            <form onSubmit={handleCreateCustomer}>
              <label style={labelStyle}>
                Họ tên <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={newCustomerData.hoTen}
                onChange={(e) => setNewCustomerData({...newCustomerData, hoTen: e.target.value})}
                style={inputStyle}
                required
              />

              <label style={labelStyle}>
                Số điện thoại <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="tel"
                value={newCustomerData.soDienThoai}
                style={{...inputStyle, backgroundColor: '#f0f0f0'}}
                disabled
              />

              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={newCustomerData.email}
                onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                placeholder="Nhập email"
                style={inputStyle}
              />

              <label style={labelStyle}>CCCD</label>
              <input
                type="text"
                value={newCustomerData.cccd}
                onChange={(e) => setNewCustomerData({...newCustomerData, cccd: e.target.value})}
                placeholder="Nhập số CCCD"
                style={inputStyle}
              />

              <label style={labelStyle}>Giới tính</label>
              <select
                value={newCustomerData.gioiTinh}
                onChange={(e) => setNewCustomerData({...newCustomerData, gioiTinh: e.target.value})}
                style={inputStyle}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>

              <label style={labelStyle}>Ngày sinh</label>
              <input
                type="date"
                value={newCustomerData.ngaySinh}
                onChange={(e) => setNewCustomerData({...newCustomerData, ngaySinh: e.target.value})}
                style={inputStyle}
              />

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  style={buttonStyle}
                  disabled={loading}
                >
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)} 
                  style={{...buttonStyle, backgroundColor: '#95a5a6'}}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const modalBackdropStyle = {
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

const labelStyle = {
  display: 'block',
  marginTop: '10px',
  marginBottom: '5px',
  fontWeight: 'bold',
  fontSize: '14px'
};

export default LoginPage;
