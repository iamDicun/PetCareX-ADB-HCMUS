import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { cusLogin, staffLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('customer');
  const [hoten, setHoten] = useState("");
  const [sdt, setSdt] = useState("");
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    let ok = false;
    if (activeTab === 'staff') {
        ok = await staffLogin(hoten, sdt);
    } else {
        ok = await cusLogin(hoten, sdt);
    }

    if (!ok) {
      alert("Sai thông tin đăng nhập");
    } else {
      if (activeTab === 'staff') {
          navigate("/Staff/Dashboard");
      } else {
          navigate("/CustomerPage");
      }
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
    </div>
  );
};

export default LoginPage;
