-- Test query đơn giản để kiểm tra doanh thu bác sĩ

DECLARE @TuNgay DATE = DATEADD(DAY, -30, GETDATE());
DECLARE @DenNgay DATE = GETDATE();

-- Query 1: Tính doanh thu dịch vụ trực tiếp (KHÔNG dùng subquery)
SELECT 
    NV.MaNhanVien,
    NV.HoTen, 
    NV.ChucVu,
    COUNT(DISTINCT CT.MaLichHen) AS SoLuotDichVu,
    SUM(CT.DonGiaThucTe) AS TongDoanhSoDichVu,
    MIN(LH.NgayGioHen) AS LichHenDauTien,
    MAX(LH.NgayGioHen) AS LichHenCuoiCung
FROM NhanVien NV
LEFT JOIN ChiTietLichHen CT ON CT.MaBacSi = NV.MaNhanVien
LEFT JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen 
    AND LH.NgayGioHen BETWEEN @TuNgay AND @DenNgay
WHERE NV.ChucVu = N'Bác sĩ thú y'
GROUP BY NV.MaNhanVien, NV.HoTen, NV.ChucVu
ORDER BY TongDoanhSoDichVu DESC;

-- Query 2: So sánh với subquery trong SP hiện tại
SELECT 
    NV.HoTen,
    NV.ChucVu,
    
    -- Subquery như trong SP
    (SELECT ISNULL(SUM(CT.DonGiaThucTe), 0) 
     FROM ChiTietLichHen CT 
     JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen
     WHERE CT.MaBacSi = NV.MaNhanVien 
       AND LH.NgayGioHen BETWEEN @TuNgay AND @DenNgay) AS DoanhSoDichVu_Subquery

FROM NhanVien NV
WHERE NV.ChucVu = N'Bác sĩ thú y'
ORDER BY DoanhSoDichVu_Subquery DESC;

-- Query 3: Chi tiết từng record của 1 bác sĩ cụ thể
SELECT TOP 1 @TuNgay = MaNhanVien FROM NhanVien WHERE ChucVu = N'Bác sĩ thú y';

SELECT 
    LH.MaLichHen,
    LH.NgayGioHen,
    CT.MaDichVu,
    CT.DonGiaThucTe,
    CT.MaBacSi,
    NV.HoTen AS TenBacSi
FROM ChiTietLichHen CT
JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen
JOIN NhanVien NV ON CT.MaBacSi = NV.MaNhanVien
WHERE CT.MaBacSi = @TuNgay
  AND LH.NgayGioHen BETWEEN DATEADD(DAY, -30, GETDATE()) AND GETDATE()
ORDER BY LH.NgayGioHen DESC;
