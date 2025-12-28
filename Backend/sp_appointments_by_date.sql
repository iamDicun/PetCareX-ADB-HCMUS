-- =====================================================================
-- Stored Procedure: Lấy danh sách lịch hẹn theo khoảng thời gian
-- =====================================================================

USE PetCareX;
GO

CREATE OR ALTER PROCEDURE SP_LichHen_TheoNgay
    @MaChiNhanh UNIQUEIDENTIFIER = NULL,
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Mặc định lấy 30 ngày gần nhất nếu không truyền tham số
    IF @TuNgay IS NULL SET @TuNgay = DATEADD(DAY, -30, GETDATE());
    IF @DenNgay IS NULL SET @DenNgay = GETDATE();

    SELECT 
        LH.MaLichHen,
        CONVERT(VARCHAR(10), LH.NgayGioHen, 23) AS NgayHen,
        CONVERT(VARCHAR(5), LH.NgayGioHen, 108) AS GioHen,
        LH.NgayGioHen,
        LH.KenhDat,
        LH.TrangThai,
        
        -- Thông tin khách hàng
        KH.HoTen AS TenKhachHang,
        KH.SoDienThoai,
        KH.Email,
        
        -- Thông tin thú cưng
        TC.TenThuCung,
        TC.Tuoi,
        LTC.TenLoai AS LoaiThuCung,
        
        -- Thông tin bác sĩ (lấy từ ChiTietLichHen)
        BS.HoTen AS TenBacSi,
        
        -- Thông tin nhân viên tạo
        NV.HoTen AS NhanVienTao,
        
        -- Thông tin chi nhánh
        CN.TenChiNhanh
        
    FROM LichHen LH
    INNER JOIN KhachHang KH ON LH.MaKhachHang = KH.MaKhachHang
    INNER JOIN ThuCung TC ON LH.MaThuCung = TC.MaThuCung
    LEFT JOIN LoaiThuCung LTC ON TC.MaLoaiTC = LTC.MaLoaiTC
    LEFT JOIN NhanVien NV ON LH.MaNVTao = NV.MaNhanVien
    LEFT JOIN (
        -- Lấy bác sĩ đầu tiên của lịch hẹn (vì có thể có nhiều dịch vụ)
        SELECT CTL.MaLichHen, BS.HoTen
        FROM ChiTietLichHen CTL
        INNER JOIN NhanVien BS ON CTL.MaBacSi = BS.MaNhanVien
        WHERE CTL.MaBacSi IS NOT NULL
        GROUP BY CTL.MaLichHen, BS.HoTen
    ) BS ON LH.MaLichHen = BS.MaLichHen
    INNER JOIN ChiNhanh CN ON LH.MaChiNhanh = CN.MaChiNhanh
    WHERE CAST(LH.NgayGioHen AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaChiNhanh IS NULL OR LH.MaChiNhanh = @MaChiNhanh)
    ORDER BY LH.NgayGioHen DESC;
        
END;
GO

-- =====================================================================
-- Ví dụ sử dụng:
-- =====================================================================

-- Lấy tất cả lịch hẹn 30 ngày gần nhất
EXEC SP_LichHen_TheoNgay;

-- Lấy lịch hẹn theo chi nhánh và khoảng thời gian
EXEC SP_LichHen_TheoNgay 
    @MaChiNhanh = 'GUID-CUA-CHI-NHANH',
    @TuNgay = '2025-01-01',
    @DenNgay = '2025-12-28';

GO
