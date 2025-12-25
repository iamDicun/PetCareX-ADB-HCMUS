-- Tạo Database
CREATE DATABASE PetCareX;
GO
USE PetCareX;
GO

-- =============================================
-- 1. NHÓM DANH MỤC (TYPE - ANH TỰ NHẬP TAY)
-- =============================================

-- Bảng Loại Sản Phẩm (Manual Input)
CREATE TABLE LoaiSanPham (
    MaLoai VARCHAR(20) PRIMARY KEY, -- VD: FOOD, MED, ACC
    TenLoai NVARCHAR(50) NOT NULL
);

-- Bảng Loại Thú Cưng (Manual Input)
CREATE TABLE LoaiThuCung (
    MaLoaiTC VARCHAR(20) PRIMARY KEY, -- VD: DOG, CAT, BIRD
    TenLoai NVARCHAR(50)
);

-- =============================================
-- 2. NHÓM CẤU HÌNH & MASTER DATA (AUTO GUID)
-- =============================================

-- Bảng Chi Nhánh (Auto)
CREATE TABLE ChiNhanh (
    MaChiNhanh UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TenChiNhanh NVARCHAR(100) NOT NULL,
    DiaChi NVARCHAR(255),
    SoDienThoai VARCHAR(15),
    ThoiGianMoCua TIME(0),
    ThoiGianDongCua TIME(0),
    CoBaiDoXe BIT DEFAULT 0, -- 0: Không, 1: Có
    TrangThai NVARCHAR(20) DEFAULT N'Hoạt động',
    MaNhanVienQuanLy UNIQUEIDENTIFIER, -- Sẽ Add FK sau
    
    -- CHECK CONSTRAINT
    CONSTRAINT CK_ChiNhanh_ThoiGian CHECK (ThoiGianMoCua < ThoiGianDongCua),
    CONSTRAINT CK_ChiNhanh_TrangThai CHECK (TrangThai IN (N'Hoạt động', N'Vô hiệu hóa'))
);

-- Bảng Sản Phẩm (Auto)
CREATE TABLE SanPham (
    MaSanPham UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TenSanPham NVARCHAR(100) NOT NULL,

    MoTa NVARCHAR(MAX) NULL, 
    
    MaLoai VARCHAR(20) REFERENCES LoaiSanPham(MaLoai), 
    
    GiaBan DECIMAL(18, 0) DEFAULT 0, 
    NgayNhap DATE DEFAULT GETDATE(),
    TrangThai BIT DEFAULT 1,

    -- CHECK CONSTRAINT
    CONSTRAINT CK_SanPham_GiaBan CHECK (GiaBan >= 0)
);

-- Bảng Dịch Vụ (Auto)
CREATE TABLE DichVu (
    MaDichVu UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TenDichVu NVARCHAR(100) NOT NULL,
    GiaNiemYet DECIMAL(18, 0) DEFAULT 0,
    MoTa NVARCHAR(500),
    LoaiDichVu NVARCHAR(50), 
    ThoiGianThucHienDuKien INT,

    -- CHECK CONSTRAINT
    CONSTRAINT CK_DichVu_GiaNiemYet CHECK (GiaNiemYet >= 0)
);

-- Bảng Cấu Hình Dịch Vụ
CREATE TABLE CauHinhDichVu (
    MaChiNhanh UNIQUEIDENTIFIER REFERENCES ChiNhanh(MaChiNhanh),
    MaDichVu UNIQUEIDENTIFIER REFERENCES DichVu(MaDichVu),
    TrangThai BIT DEFAULT 1, -- Mặc định BIT là 0/1 (Active/Inactive)
    PRIMARY KEY (MaChiNhanh, MaDichVu)
);

-- Bảng Định Mức
CREATE TABLE DinhMucDichVu (
    MaDichVu UNIQUEIDENTIFIER REFERENCES DichVu(MaDichVu),
    MaSanPham UNIQUEIDENTIFIER REFERENCES SanPham(MaSanPham),
    SoLuongTieuHao DECIMAL(18, 2) DEFAULT 1,
    GhiChuSuDung NVARCHAR(100),                  
    PRIMARY KEY (MaDichVu, MaSanPham),
    
    -- CHECK CONSTRAINT
    CONSTRAINT CK_DinhMuc_SoLuong CHECK (SoLuongTieuHao > 0)
);

-- =============================================
-- 3. NHÓM NHÂN SỰ (AUTO GUID)
-- =============================================

CREATE TABLE NhanVien (
    MaNhanVien UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE,
    GioiTinh NVARCHAR(5),
    SoDienThoai VARCHAR(15),
    DiaChi NVARCHAR(255),
    NgayVaoLam DATE,
    NgayNghiViec DATE,
    ChucVu NVARCHAR(50), 
    CoPhaiTruongNhom BIT DEFAULT 0,
    LuongCoBan DECIMAL(18, 0),
    MaChiNhanh UNIQUEIDENTIFIER REFERENCES ChiNhanh(MaChiNhanh),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_NhanVien_GioiTinh CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),
    CONSTRAINT CK_NhanVien_Luong CHECK (LuongCoBan >= 0),
    CONSTRAINT CK_NhanVien_ChucVu 
    CHECK (ChucVu IN (
        N'Bác sĩ thú y', 
        N'Quản lý chi nhánh', 
        N'Nhân viên tiếp tân', 
        N'Nhân viên bán hàng', 
        N'Quản lý cấp công ty',
        N'Nhân viên chăm sóc'
    )),
    CONSTRAINT CK_NhanVien_NgayLam CHECK (NgayNghiViec IS NULL OR NgayVaoLam <= NgayNghiViec)
);

-- Add FK Quản lý
ALTER TABLE ChiNhanh
ADD CONSTRAINT FK_ChiNhanh_QuanLy FOREIGN KEY (MaNhanVienQuanLy) REFERENCES NhanVien(MaNhanVien);

CREATE TABLE LichSuDieuDong (
    MaDieuDong UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaNhanVien UNIQUEIDENTIFIER REFERENCES NhanVien(MaNhanVien),
    NgayBatDau DATE,
    NgayKetThuc DATE,
    ChucVu NVARCHAR(50),
    MaChiNhanhCu UNIQUEIDENTIFIER,
    MaChiNhanhMoi UNIQUEIDENTIFIER,
    LyDo NVARCHAR(255),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_DieuDong_Ngay CHECK (NgayKetThuc IS NULL OR NgayBatDau <= NgayKetThuc)
);

-- =============================================
-- 4. NHÓM KHÁCH HÀNG & THÚ CƯNG (AUTO GUID)
-- =============================================

CREATE TABLE KhachHang (
    MaKhachHang UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    HoTen NVARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(15) UNIQUE NOT NULL,
    Email VARCHAR(100),
    CCCD VARCHAR(20),
    GioiTinh NVARCHAR(5),
    NgaySinh DATE,

    -- CHECK CONSTRAINT
    CONSTRAINT CK_KhachHang_GioiTinh CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),
    CONSTRAINT CK_KhachHang_Email CHECK (Email LIKE '%@%') -- Check cơ bản
);

CREATE TABLE TheThanhVien (
    MaThe UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaKhachHang UNIQUEIDENTIFIER UNIQUE REFERENCES KhachHang(MaKhachHang),
    HangThanhVien NVARCHAR(20) DEFAULT N'Cơ bản',
    DiemTichLuy INT DEFAULT 0,
    TongChiTieuNam DECIMAL(18, 0) DEFAULT 0,
    NgayCap DATE DEFAULT GETDATE(),
    TrangThai NVARCHAR(20) DEFAULT 'Active',

    -- CHECK CONSTRAINT
    CONSTRAINT CK_TheTV_Diem CHECK (DiemTichLuy >= 0),
    CONSTRAINT CK_TheTV_ChiTieu CHECK (TongChiTieuNam >= 0),
    CONSTRAINT CK_TheTV_HangThanhVien CHECK (HangThanhVien IN (N'Cơ bản', N'Thân thiết', N'VIP')),
    CONSTRAINT CK_TheTV_TrangThai CHECK (TrangThai IN ('Active', 'Inactive', 'Locked'))
);

-- Bảng Sản Phẩm Phù Hợp
CREATE TABLE SanPhamPhuHop (
    MaSanPham UNIQUEIDENTIFIER REFERENCES SanPham(MaSanPham),
    MaLoaiTC VARCHAR(20) REFERENCES LoaiThuCung(MaLoaiTC), 
    PRIMARY KEY (MaSanPham, MaLoaiTC)
);

CREATE TABLE ThuCung (
    MaThuCung UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaKhachHang UNIQUEIDENTIFIER REFERENCES KhachHang(MaKhachHang),
    MaLoaiTC VARCHAR(20) REFERENCES LoaiThuCung(MaLoaiTC),
    TenThuCung NVARCHAR(50),
    Giong NVARCHAR(50),
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    CanNang FLOAT,
    TinhTrangSK NVARCHAR(255),
    NgayDangKy DATE DEFAULT GETDATE(),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_ThuCung_CanNang CHECK (CanNang > 0),
    CONSTRAINT CK_ThuCung_GioiTinh CHECK (GioiTinh IN (N'Đực', N'Cái', N'Lưỡng tính'))
);

-- =============================================
-- 5. NHÓM KHO VẬN (AUTO GUID)
-- =============================================

CREATE TABLE KhoHang (
    MaKho UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaChiNhanh UNIQUEIDENTIFIER UNIQUE REFERENCES ChiNhanh(MaChiNhanh),
    DiaChiKho NVARCHAR(255)
);

CREATE TABLE ChiTietKhoHang (
    MaKho UNIQUEIDENTIFIER REFERENCES KhoHang(MaKho),
    MaSanPham UNIQUEIDENTIFIER REFERENCES SanPham(MaSanPham),
    SoLuongVatLy INT DEFAULT 0,
    SoLuongTamGiu INT DEFAULT 0,
    SoLuongKhaDung AS (SoLuongVatLy - SoLuongTamGiu),
    NgayCapNhatCuoi DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (MaKho, MaSanPham),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_CTKho_SLVatLy CHECK (SoLuongVatLy >= 0),
    CONSTRAINT CK_CTKho_SLTamGiu CHECK (SoLuongTamGiu >= 0)
);

CREATE TABLE YeuCauNhapHang (
    MaYeuCau UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaChiNhanh UNIQUEIDENTIFIER REFERENCES ChiNhanh(MaChiNhanh),
    NgayYeuCau DATETIME DEFAULT GETDATE(),
    TrangThai NVARCHAR(20),
    
    -- CHECK CONSTRAINT
    CONSTRAINT CK_YCNhap_TrangThai CHECK (TrangThai IN (N'Mới', N'Đã duyệt', N'Đang nhập', N'Hoàn tất', N'Hủy'))
);

CREATE TABLE ChiTietYeuCauNhap (
    MaYeuCau UNIQUEIDENTIFIER REFERENCES YeuCauNhapHang(MaYeuCau),
    MaSanPham UNIQUEIDENTIFIER REFERENCES SanPham(MaSanPham),
    SoLuong INT,
    PRIMARY KEY (MaYeuCau, MaSanPham),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_CTYCNhap_SoLuong CHECK (SoLuong > 0)
);

-- =============================================
-- 6. NHÓM GIAO DỊCH (AUTO GUID)
-- =============================================

CREATE TABLE HoaDon (
    MaHoaDon UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    NgayTao DATETIME DEFAULT GETDATE(),
    

    TongPhu DECIMAL(18, 0) DEFAULT 0,           
    TongTienGiam DECIMAL(18, 0) DEFAULT 0,     
    DiemLoyaltySuDung INT DEFAULT 0,            
    TienGiamTuDiem DECIMAL(18, 0) DEFAULT 0,    
    TongTienThucTra DECIMAL(18, 0) DEFAULT 0,  
    

    MaNhanVien UNIQUEIDENTIFIER REFERENCES NhanVien(MaNhanVien),
    MaChiNhanh UNIQUEIDENTIFIER REFERENCES ChiNhanh(MaChiNhanh),
    
  
    MaKhachHang UNIQUEIDENTIFIER REFERENCES KhachHang(MaKhachHang),

   
    CONSTRAINT CK_HoaDon_TongPhu CHECK (TongPhu >= 0),
    CONSTRAINT CK_HoaDon_ThucTra CHECK (TongTienThucTra >= 0),
    CONSTRAINT CK_HoaDon_Diem CHECK (DiemLoyaltySuDung >= 0),
    CONSTRAINT CK_HoaDon_Giam CHECK (TongTienGiam >= 0 AND TienGiamTuDiem >= 0)
);

CREATE TABLE DonHang (
    MaDonHang UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaKhachHang UNIQUEIDENTIFIER REFERENCES KhachHang(MaKhachHang),
    MaChiNhanh UNIQUEIDENTIFIER REFERENCES ChiNhanh(MaChiNhanh),
    MaNhanVienSale UNIQUEIDENTIFIER REFERENCES NhanVien(MaNhanVien),
    NgayDat DATETIME DEFAULT GETDATE(),
    LoaiDon NVARCHAR(20),
    TrangThai NVARCHAR(20),
    HanGiuHang DATETIME,
    MaHoaDon UNIQUEIDENTIFIER REFERENCES HoaDon(MaHoaDon),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_DonHang_LoaiDon CHECK (LoaiDon IN (N'Tại quầy', N'Online')),
    CONSTRAINT CK_DonHang_TrangThai CHECK (TrangThai IN (N'Chờ xử lý', N'Sẵn sàng để lấy', N'Hoàn tất', N'Đã hủy-Quá hạn', N'Đã hủy-Khách hủy'))
);

CREATE TABLE ChiTietDonHang (
    MaDonHang UNIQUEIDENTIFIER REFERENCES DonHang(MaDonHang),
    MaSanPham UNIQUEIDENTIFIER REFERENCES SanPham(MaSanPham),
    SoLuong INT,
    DonGiaBan DECIMAL(18, 0),
    ThanhTien AS (SoLuong * DonGiaBan) PERSISTED,
    PRIMARY KEY (MaDonHang, MaSanPham),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_CTDonHang_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_CTDonHang_DonGia CHECK (DonGiaBan >= 0)
);

-- ---------------------------------------------
-- NHÁNH LỊCH HẸN
-- ---------------------------------------------

CREATE TABLE LichHen (
    MaLichHen UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaKhachHang UNIQUEIDENTIFIER REFERENCES KhachHang(MaKhachHang),
    MaThuCung UNIQUEIDENTIFIER REFERENCES ThuCung(MaThuCung),
    MaChiNhanh UNIQUEIDENTIFIER REFERENCES ChiNhanh(MaChiNhanh),
    MaNVTao UNIQUEIDENTIFIER REFERENCES NhanVien(MaNhanVien),
    NgayGioHen DATETIME,
    KenhDat NVARCHAR(20),
    TrangThai NVARCHAR(20),
    MaHoaDon UNIQUEIDENTIFIER REFERENCES HoaDon(MaHoaDon),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_LichHen_KenhDat CHECK (KenhDat IN (N'Online', N'Tại quầy')),
    CONSTRAINT CK_LichHen_TrangThai CHECK (TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận', N'Hoàn tất', N'Hủy'))
);

CREATE TABLE ChiTietLichHen (
    MaLichHen UNIQUEIDENTIFIER REFERENCES LichHen(MaLichHen),
    MaDichVu UNIQUEIDENTIFIER REFERENCES DichVu(MaDichVu),
    MaBacSi UNIQUEIDENTIFIER REFERENCES NhanVien(MaNhanVien),
    DonGiaThucTe DECIMAL(18, 0),
    KetQua NVARCHAR(MAX),
    ThoiGianThucHien DATETIME,
    PRIMARY KEY (MaLichHen, MaDichVu),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_CTLichHen_DonGia CHECK (DonGiaThucTe >= 0)
);

CREATE TABLE HoSoKham (
    MaHoSo UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaLichHen UNIQUEIDENTIFIER UNIQUE REFERENCES LichHen(MaLichHen),
    TrieuChung NVARCHAR(MAX),
    ChuanDoan NVARCHAR(MAX),
    CanNang FLOAT,
    NgayTaiKham DATE,

    -- CHECK CONSTRAINT
    CONSTRAINT CK_HoSoKham_CanNang CHECK (CanNang > 0),
    CONSTRAINT CK_HoSoKham_NgayTaiKham CHECK (NgayTaiKham >= GETDATE()) -- VD: Tái khám phải từ hôm nay trở đi
);

CREATE TABLE ToaThuoc (
    MaHoSo UNIQUEIDENTIFIER REFERENCES HoSoKham(MaHoSo),
    MaSanPham UNIQUEIDENTIFIER REFERENCES SanPham(MaSanPham),
    SoLuong INT,
    CachDung NVARCHAR(255),
    PRIMARY KEY (MaHoSo, MaSanPham),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_ToaThuoc_SoLuong CHECK (SoLuong > 0)
);

CREATE TABLE LichSuTiem (
    MaLichSuTiem UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaThuCung UNIQUEIDENTIFIER REFERENCES ThuCung(MaThuCung),
    MaDichVu UNIQUEIDENTIFIER REFERENCES DichVu(MaDichVu),
    SoLoVacXin VARCHAR(50),
    NgayTiem DATE DEFAULT GETDATE(),
    NgayTaiChung DATE,
    MaBacSi UNIQUEIDENTIFIER REFERENCES NhanVien(MaNhanVien),
    MaLichHen UNIQUEIDENTIFIER REFERENCES LichHen(MaLichHen),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_LichSuTiem_Ngay CHECK (NgayTaiChung IS NULL OR NgayTaiChung > NgayTiem)
);

-- =============================================
-- 7. NHÓM MARKETING & ĐÁNH GIÁ
-- =============================================

CREATE TABLE DanhGia (
    MaDanhGia UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    MaHoaDon UNIQUEIDENTIFIER UNIQUE REFERENCES HoaDon(MaHoaDon),
    MaChiNhanh UNIQUEIDENTIFIER REFERENCES ChiNhanh(MaChiNhanh),
    DiemChatLuong INT,
    DiemThaiDo INT,
    BinhLuan NVARCHAR(MAX),
    NgayDanhGia DATETIME DEFAULT GETDATE(),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_DanhGia_ChatLuong CHECK (DiemChatLuong BETWEEN 1 AND 5),
    CONSTRAINT CK_DanhGia_ThaiDo CHECK (DiemThaiDo BETWEEN 1 AND 5)
);

CREATE TABLE ChuongTrinhKhuyenMai (
    MaKhuyenMai UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    TenCT NVARCHAR(100),
    LoaiNgan NVARCHAR(20),
    LoaiDoiTuong NVARCHAR(20),
    GiaTriGiam DECIMAL(18, 0),
    PhanTramGiam FLOAT,
    NgayBD DATE,
    NgayKT DATE,
    TrangThai BIT DEFAULT 1,

    -- CHECK CONSTRAINT
    CONSTRAINT CK_KM_Ngay CHECK (NgayBD <= NgayKT),
    CONSTRAINT CK_KM_GiaTriGiam CHECK (GiaTriGiam >= 0),
    CONSTRAINT CK_KM_PhanTram CHECK (PhanTramGiam >= 0 AND PhanTramGiam <= 100),
    CONSTRAINT CK_KM_LoaiNgan CHECK (LoaiNgan IN (N'Cấp Sản phẩm', N'Cấp Hóa đơn')),
    CONSTRAINT CK_KM_LoaiDoiTuong CHECK (LoaiDoiTuong IN (N'Gói tiêm', N'Hạng TV', N'Đại trà'))
);
    
CREATE TABLE KhuyenMaiApDung (
    MaHoaDon UNIQUEIDENTIFIER REFERENCES HoaDon(MaHoaDon),
    MaKhuyenMai UNIQUEIDENTIFIER REFERENCES ChuongTrinhKhuyenMai(MaKhuyenMai),
    SoTienGiam DECIMAL(18, 0),
    PRIMARY KEY (MaHoaDon, MaKhuyenMai),

    -- CHECK CONSTRAINT
    CONSTRAINT CK_KMApDung_SoTien CHECK (SoTienGiam >= 0)
);
GO