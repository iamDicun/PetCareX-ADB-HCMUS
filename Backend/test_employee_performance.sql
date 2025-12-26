-- Test query để kiểm tra doanh số dịch vụ của bác sĩ
-- Thay @TestBacSi bằng MaNhanVien của 1 bác sĩ bất kỳ

DECLARE @TestBacSi UNIQUEIDENTIFIER = (
    SELECT TOP 1 MaNhanVien 
    FROM NhanVien 
    WHERE ChucVu = N'Bác sĩ thú y'
);

DECLARE @TuNgay DATE = DATEADD(DAY, -30, GETDATE());
DECLARE @DenNgay DATE = GETDATE();

PRINT N'=== Kiểm tra thông tin bác sĩ ===';
SELECT MaNhanVien, HoTen, ChucVu 
FROM NhanVien 
WHERE MaNhanVien = @TestBacSi;

PRINT N'=== Kiểm tra số lượng lịch hẹn ===';
SELECT 
    COUNT(*) AS TongLichHen,
    COUNT(DISTINCT LH.MaLichHen) AS LichHenKhacNhau,
    LH.TrangThai,
    COUNT(*) AS SoLuong
FROM ChiTietLichHen CT
JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen
WHERE CT.MaBacSi = @TestBacSi
  AND LH.NgayGioHen BETWEEN @TuNgay AND @DenNgay
GROUP BY LH.TrangThai;

PRINT N'=== Kiểm tra chi tiết dịch vụ ===';
SELECT 
    LH.MaLichHen,
    LH.NgayGioHen,
    LH.TrangThai,
    DV.TenDichVu,
    CT.DonGiaThucTe,
    CT.MaBacSi
FROM ChiTietLichHen CT
JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen
JOIN DichVu DV ON CT.MaDichVu = DV.MaDichVu
WHERE CT.MaBacSi = @TestBacSi
  AND LH.NgayGioHen BETWEEN @TuNgay AND @DenNgay
ORDER BY LH.NgayGioHen DESC;

PRINT N'=== Tổng doanh số (tất cả trạng thái) ===';
SELECT 
    ISNULL(SUM(CT.DonGiaThucTe), 0) AS TongDoanhSo_TatCa
FROM ChiTietLichHen CT
JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen
WHERE CT.MaBacSi = @TestBacSi
  AND LH.NgayGioHen BETWEEN @TuNgay AND @DenNgay;

PRINT N'=== Tổng doanh số (chỉ Hoàn tất) ===';
SELECT 
    ISNULL(SUM(CT.DonGiaThucTe), 0) AS TongDoanhSo_HoanTat
FROM ChiTietLichHen CT
JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen
WHERE CT.MaBacSi = @TestBacSi
  AND LH.NgayGioHen BETWEEN @TuNgay AND @DenNgay
  AND LH.TrangThai = N'Hoàn tất';
