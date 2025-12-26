# API Quản lý Chi nhánh

## Base URL
`http://localhost:3000/api/branch`

## Authentication
Tất cả các endpoint yêu cầu token JWT trong header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Lấy doanh thu chi nhánh theo dịch vụ và sản phẩm
**GET** `/revenue`

**Query Parameters:**
- `MaChiNhanh` (required): Mã chi nhánh
- `TuNgay` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `DenNgay` (optional): Ngày kết thúc (YYYY-MM-DD)

**Stored Procedure:** `SP_BaoCao_DoanhThu_ChiNhanh_ChiTiet`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Ngay": "2024-01-01",
      "DoanhThuBanHang": 5000000,
      "DoanhThuDichVu": 3000000,
      "TongCong": 8000000
    }
  ]
}
```

---

### 2. Lấy danh sách hóa đơn đặt hàng theo khoảng ngày
**GET** `/orders`

**Query Parameters:**
- `MaChiNhanh` (required): Mã chi nhánh
- `TuNgay` (required): Ngày bắt đầu (YYYY-MM-DD)
- `DenNgay` (required): Ngày kết thúc (YYYY-MM-DD)

**Stored Procedure:** `SP_ThongKe_DonHang_TheoNgay`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaDonHang": 1,
      "TenKhachHang": "Nguyễn Văn A",
      "NgayDat": "2024-01-01",
      "LoaiDon": "Online",
      "TrangThai": "Hoàn tất",
      "TongTien": 500000
    }
  ]
}
```

---

### 3. Xem danh sách nhân viên và đánh giá
**GET** `/employee-ratings`

**Stored Procedure:** `SP_Xem_DanhGia_NhanVien`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaNhanVien": 1,
      "HoTen": "Trần Thị B",
      "ChucVu": "Thu ngân",
      "DiemThaiDoTB": 4.5
    }
  ]
}
```

---

### 4. Xem hiệu suất làm việc của nhân viên
**GET** `/employee-performance`

**Query Parameters:**
- `MaChiNhanh` (optional): Mã chi nhánh
- `TuNgay` (required): Ngày bắt đầu (YYYY-MM-DD)
- `DenNgay` (required): Ngày kết thúc (YYYY-MM-DD)

**Stored Procedure:** `sp_XemHieuSuatNhanVien`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "HoTen": "Lê Văn C",
      "ChucVu": "Bác sĩ",
      "DoanhSoBanHang": 0,
      "DoanhSoDichVu": 10000000,
      "DiemHaiLongTB": 4.7
    }
  ]
}
```

---

### 5. Xem thống kê sản phẩm bán chạy
**GET** `/top-products`

**Query Parameters:**
- `MaChiNhanh` (required): Mã chi nhánh
- `TuNgay` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `DenNgay` (optional): Ngày kết thúc (YYYY-MM-DD)

**Stored Procedure:** `SP_ThongKe_SanPham_BanChay`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "TenSanPham": "Thức ăn cho chó",
      "TenLoaiSanPham": "Thức ăn",
      "TongSoLuongBan": 100,
      "TongDoanhThu": 5000000,
      "SoLuotDonHang": 30
    }
  ]
}
```

---

### 6. Xem tồn kho của chi nhánh
**GET** `/inventory`

**Query Parameters:**
- `MaChiNhanh` (required): Mã chi nhánh

**Database Query:** Direct query từ bảng `TONKHO`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaTonKho": 1,
      "MaSanPham": 10,
      "TenSanPham": "Vitamin cho mèo",
      "TenLoaiSanPham": "Thuốc & Vitamin",
      "SoLuong": 25,
      "NgayCapNhat": "2024-01-15",
      "Gia": 150000
    }
  ]
}
```

---

## Lưu ý
- Tất cả endpoint đều yêu cầu xác thực JWT token
- Các tham số ngày phải theo format YYYY-MM-DD
- Mã chi nhánh được lấy từ thông tin user đã đăng nhập
- Khi số lượng tồn kho < 10, sản phẩm được highlight màu đỏ trong UI
- **Đã loại bỏ** thống kê dịch vụ hot (SP_ThongKe_DichVu_Hot) vì SP này không hỗ trợ filter theo chi nhánh (lấy toàn hệ thống)
