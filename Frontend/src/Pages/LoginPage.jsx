import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { cusLogin } = useAuth();
  const [hoten, setHoten] = useState("");
  const [sdt, setSdt] = useState("");
  
  const navigate = useNavigate();

  const handleLogin = async () => {
    const ok = await cusLogin(hoten, sdt);
    if (!ok) {
      alert("Sai tài khoản hoặc mật khẩu");
    } else {
      navigate("/CustomerPage");
    }
  };

  return (
    <>
      <input value={hoten} onChange={(e) => setHoten(e.target.value)} placeholder="Họ tên" />
      <input value={sdt} type="text" onChange={(e) => setSdt(e.target.value)} placeholder="Số điện thoại" />
      <button onClick={handleLogin}>Đăng nhập</button>
    </>
  );
};

export default LoginPage;
