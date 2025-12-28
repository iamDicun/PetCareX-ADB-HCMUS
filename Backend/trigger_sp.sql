use PetCareX
go
CREATE TRIGGER TR_KhachHang_AfterInsert_TaoThe
ON KhachHang
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu không có dữ liệu thì thoát ngay
    IF NOT EXISTS (SELECT 1 FROM INSERTED) RETURN;

    -- Chèn vào bảng TheThanhVien
    INSERT INTO TheThanhVien (
        MaThe, 
        MaKhachHang, 
        HangThanhVien, 
        DiemTichLuy, 
        TongChiTieuNam, 
        NgayCap, 
        TrangThai
    )
    SELECT 
        -- Logic: Thay thế 'KH' bằng 'THE' để giữ nguyên phần số
        -- Ví dụ: KH00001234 -> THE00001234
        REPLACE(i.MaKhachHang, 'KH', 'THE'), 
        i.MaKhachHang,
        N'Cơ bản',                -- Hạng mặc định
        0,                        -- Điểm ban đầu
        0,                        -- Chi tiêu ban đầu
        GETDATE(),                -- Ngày cấp
        N'Active'                 -- Trạng thái (N'...' để hỗ trợ Unicode nếu cần)
    FROM INSERTED i
    -- Đảm bảo không insert trùng nếu thẻ đã tồn tại (an toàn dữ liệu)
    WHERE NOT EXISTS (
        SELECT 1 FROM TheThanhVien t WHERE t.MaKhachHang = i.MaKhachHang
    );
    
    -- (Tùy chọn) In thông báo cho mục đích debug, nên bỏ khi chạy thực tế để tăng tốc
    -- PRINT N'>> Đã tạo thẻ thành viên.';
END;
GO



-- Trigger cập nhật chi tiêu khi LỊCH HẸN hoàn tất
CREATE OR ALTER TRIGGER TR_LichHen_AfterUpdate_ChiTieu
ON LichHen
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ chạy khi TrangThai thay đổi sang "Hoàn tất"
    IF NOT UPDATE(TrangThai) RETURN;

    DECLARE @ChiTieuMoi TABLE (
        MaKhachHang UNIQUEIDENTIFIER, 
        TienChiTieu DECIMAL(18, 0)
    );

    -- Lấy số tiền từ hóa đơn của lịch hẹn vừa hoàn tất
    INSERT INTO @ChiTieuMoi (MaKhachHang, TienChiTieu)
    SELECT 
        HD.MaKhachHang, 
        ISNULL(HD.TongTienThucTra, 0)
    FROM INSERTED i
    JOIN DELETED d ON i.MaLichHen = d.MaLichHen
    JOIN HoaDon HD ON i.MaHoaDon = HD.MaHoaDon
    WHERE i.TrangThai = N'Hoàn tất' 
      AND d.TrangThai <> N'Hoàn tất'
      AND i.MaHoaDon IS NOT NULL
      AND HD.MaKhachHang IS NOT NULL;

    -- Nếu không có gì thì thoát
    IF NOT EXISTS (SELECT 1 FROM @ChiTieuMoi) RETURN;

    -- Cập nhật chi tiêu vào thẻ
    UPDATE T
    SET T.TongChiTieuNam = T.TongChiTieuNam + CT.TienChiTieu
    FROM TheThanhVien T
    JOIN @ChiTieuMoi CT ON T.MaKhachHang = CT.MaKhachHang;

    -- Xét nâng hạng tự động
    UPDATE T
    SET HangThanhVien = CASE 
        WHEN T.TongChiTieuNam >= 12000000 THEN N'VIP'
        WHEN T.TongChiTieuNam >= 5000000 THEN N'Thân thiết'
        ELSE N'Cơ bản'
    END
    FROM TheThanhVien T
    JOIN @ChiTieuMoi CT ON T.MaKhachHang = CT.MaKhachHang;
END;
GO

-- Trigger cập nhật chi tiêu khi ĐƠN HÀNG hoàn tất
CREATE OR ALTER TRIGGER TR_DonHang_AfterUpdate_ChiTieu
ON DonHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ chạy khi TrangThai thay đổi sang "Hoàn tất"
    IF NOT UPDATE(TrangThai) RETURN;

    DECLARE @ChiTieuMoi TABLE (
        MaKhachHang UNIQUEIDENTIFIER, 
        TienChiTieu DECIMAL(18, 0)
    );

    -- Lấy số tiền từ hóa đơn của đơn hàng vừa hoàn tất
    INSERT INTO @ChiTieuMoi (MaKhachHang, TienChiTieu)
    SELECT 
        HD.MaKhachHang, 
        ISNULL(HD.TongTienThucTra, 0)
    FROM INSERTED i
    JOIN DELETED d ON i.MaDonHang = d.MaDonHang
    JOIN HoaDon HD ON i.MaHoaDon = HD.MaHoaDon
    WHERE i.TrangThai = N'Hoàn tất' 
      AND d.TrangThai <> N'Hoàn tất'
      AND i.MaHoaDon IS NOT NULL
      AND HD.MaKhachHang IS NOT NULL;

    -- Nếu không có gì thì thoát
    IF NOT EXISTS (SELECT 1 FROM @ChiTieuMoi) RETURN;

    -- Cập nhật chi tiêu vào thẻ
    UPDATE T
    SET T.TongChiTieuNam = T.TongChiTieuNam + CT.TienChiTieu
    FROM TheThanhVien T
    JOIN @ChiTieuMoi CT ON T.MaKhachHang = CT.MaKhachHang;

    -- Xét nâng hạng tự động
    UPDATE T
    SET HangThanhVien = CASE 
        WHEN T.TongChiTieuNam >= 12000000 THEN N'VIP'
        WHEN T.TongChiTieuNam >= 5000000 THEN N'Thân thiết'
        ELSE N'Cơ bản'
    END
    FROM TheThanhVien T
    JOIN @ChiTieuMoi CT ON T.MaKhachHang = CT.MaKhachHang;
END;
GO
CREATE OR ALTER TRIGGER TR_GhiLichSuDieuDong
ON NhanVien
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu cột MaChiNhanh có nằm trong lệnh UPDATE
    IF UPDATE(MaChiNhanh)
    BEGIN
        INSERT INTO LichSuDieuDong (
            MaNhanVien,
            NgayBatDau,
            ChucVu,
            MaChiNhanhCu,
            MaChiNhanhMoi,
            LyDo
        )
        SELECT
            i.MaNhanVien,
            GETDATE(), 
            i.ChucVu,
            d.MaChiNhanh, -- Chi nhánh cũ (từ bảng deleted)
            i.MaChiNhanh, -- Chi nhánh mới (từ bảng inserted)
            N'Chuyển chi nhánh'
        FROM inserted i
        JOIN deleted d ON i.MaNhanVien = d.MaNhanVien
        WHERE 
            -- Logic so sánh an toàn: Coi NULL là GUID rỗng để so sánh
            -- Nếu khác nhau thì mới insert
            ISNULL(i.MaChiNhanh, '00000000-0000-0000-0000-000000000000') 
            <> 
            ISNULL(d.MaChiNhanh, '00000000-0000-0000-0000-000000000000');
    END
END;
GO

-- Trigger f: Cập nhật hồ sơ thú cưng
CREATE TRIGGER TR_CapNhatHoSoThuCung
ON HoSoKham
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Cập nhật CanNang mới nhất vào bảng ThuCung
    UPDATE TC
    SET 
        TC.CanNang = i.CanNang,
        TC.TinhTrangSK = i.ChuanDoan -- Cập nhật thêm thông tin chẩn đoán
    FROM
        ThuCung TC
    INNER JOIN
        LichHen LH ON TC.MaThuCung = LH.MaThuCung
    INNER JOIN
        inserted i ON LH.MaLichHen = i.MaLichHen
    WHERE
        i.CanNang IS NOT NULL AND i.CanNang > 0;
END
GO

IF OBJECT_ID('SP_TraCuuLichSuKham', 'P') IS NOT NULL
    DROP PROCEDURE SP_TraCuuLichSuKham;
GO

CREATE PROCEDURE SP_TraCuuLichSuKham
    @MaThuCung UNIQUEIDENTIFIER
AS
BEGIN
    -- Mục đích: Xem lịch sử các lần khám đã hoàn thành của thú cưng
    SELECT 
        LH.NgayGioHen,
        DV.TenDichVu,
        HSK.TrieuChung,
        HSK.ChuanDoan,
        CTLH.KetQua,
        HSK.NgayTaiKham,
        NV.HoTen AS BacSiThucHien
    FROM LichHen LH
    JOIN ChiTietLichHen CTLH ON LH.MaLichHen = CTLH.MaLichHen
    JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
    -- Sử dụng LEFT JOIN với Hồ sơ khám vì có thể có dịch vụ (như Spa) không tạo hồ sơ bệnh án
    LEFT JOIN HoSoKham HSK ON LH.MaLichHen = HSK.MaLichHen 
    LEFT JOIN NhanVien NV ON CTLH.MaBacSi = NV.MaNhanVien
    WHERE 
        LH.MaThuCung = @MaThuCung 
        AND LH.TrangThai = N'Hoàn tất' -- Chỉ lấy các lịch hẹn đã xong
    ORDER BY 
        LH.NgayGioHen DESC; -- Mới nhất lên đầu
END;
GO

-- =============================================================
-- b) DANH SÁCH THÚ CƯNG CẦN TIÊM ĐỊNH KỲ (SẮP TỚI)
-- Tên SP: SP_DanhSachTiemDinhKy
-- =============================================================
IF OBJECT_ID('SP_DanhSachTiemDinhKy', 'P') IS NOT NULL
    DROP PROCEDURE SP_DanhSachTiemDinhKy;
GO

CREATE or alter PROCEDURE SP_DanhSachTiemDinhKy
    @NgayGioiHan DATE = NULL,          -- Nếu NULL thì lấy không giới hạn tương lai
    @MaThuCung UNIQUEIDENTIFIER = NULL -- Nếu NULL thì lấy tất cả thú cưng
AS
BEGIN
    -- Mục đích: Tìm các lịch hẹn tiêm chủng sắp tới (chưa bị hủy)
    -- Lưu ý: Do bảng DichVu không có cột Flag xác định là "Tiêm", 
    -- ta sẽ lọc theo TenDichVu hoặc LoaiDichVu có chứa từ khóa "Tiêm" hoặc "VacXin".
    
    SELECT 
        TC.MaThuCung,
        TC.TenThuCung,
        KH.HoTen AS TenChu,
        KH.SoDienThoai,
        DV.TenDichVu,
        LH.NgayGioHen,
        LH.TrangThai
    FROM LichHen LH
    JOIN ChiTietLichHen CTLH ON LH.MaLichHen = CTLH.MaLichHen
    JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
    JOIN ThuCung TC ON LH.MaThuCung = TC.MaThuCung
    JOIN KhachHang KH ON TC.MaKhachHang = KH.MaKhachHang
    WHERE 
        LH.NgayGioHen >= GETDATE() -- Lấy từ hiện tại trở đi
        AND LH.TrangThai NOT LIKE N'%Hủy%' -- Bỏ qua các đơn đã hủy (Hủy, Đã hủy-...)
        AND (DV.TenDichVu LIKE N'%Tiêm%' OR DV.LoaiDichVu LIKE N'%Tiêm%' OR DV.TenDichVu LIKE N'%Vaccine%')
        -- Lọc theo thú cưng (nếu có tham số)
        AND (@MaThuCung IS NULL OR TC.MaThuCung = @MaThuCung)
        -- Lọc theo giới hạn ngày (nếu có tham số)
        AND (@NgayGioiHan IS NULL OR CAST(LH.NgayGioHen AS DATE) <= @NgayGioiHan)
    ORDER BY 
        LH.NgayGioHen ASC; -- Ưu tiên ngày gần nhất
END;
GO

-- =============================================================
-- c) THỐNG KÊ TÌM SẢN PHẨM PHÙ HỢP
-- Tên SP: SP_TimSanPhamPhuHop
-- =============================================================
IF OBJECT_ID('SP_TimSanPhamPhuHop', 'P') IS NOT NULL
    DROP PROCEDURE SP_TimSanPhamPhuHop;
GO

CREATE PROCEDURE SP_TimSanPhamPhuHop
    @MaThuCung UNIQUEIDENTIFIER = NULL,
    @MaLoaiTC VARCHAR(20) = NULL
AS
BEGIN
    -- 1. Kiểm tra đầu vào: Cả 2 đều NULL thì báo lỗi
    IF @MaThuCung IS NULL AND @MaLoaiTC IS NULL
    BEGIN
        RAISERROR(N'Vui lòng cung cấp Mã Thú Cưng hoặc Mã Loại Thú Cưng.', 16, 1);
        RETURN;
    END

    -- Biến tạm để lưu Loại thú cưng cần tìm
    DECLARE @TargetMaLoaiTC VARCHAR(20);

    -- 2. Xử lý logic ưu tiên
    IF @MaThuCung IS NOT NULL
    BEGIN
        -- Nếu có Mã Thú Cưng, tìm loại của thú cưng đó trong DB
        SELECT @TargetMaLoaiTC = MaLoaiTC 
        FROM ThuCung 
        WHERE MaThuCung = @MaThuCung;

        -- Nếu không tìm thấy thú cưng (ví dụ ID sai), kết thúc
        IF @TargetMaLoaiTC IS NULL
        BEGIN
            PRINT N'Không tìm thấy thông tin thú cưng với ID đã nhập.';
            RETURN;
        END
    END
    ELSE
    BEGIN
        -- Nếu không có Mã Thú Cưng, dùng Mã Loại trực tiếp
        SET @TargetMaLoaiTC = @MaLoaiTC;
    END

    -- 3. Truy vấn trả về danh sách sản phẩm
    SELECT 
        SP.MaSanPham,
        SP.TenSanPham,
        SP.GiaBan,
        LTC.TenLoai AS PhuHopVoiLoai,
        SP.TrangThai
    FROM SanPham SP
    JOIN SanPhamPhuHop SPPH ON SP.MaSanPham = SPPH.MaSanPham
    JOIN LoaiThuCung LTC ON SPPH.MaLoaiTC = LTC.MaLoaiTC
    WHERE 
        SPPH.MaLoaiTC = @TargetMaLoaiTC
        AND SP.TrangThai = 1 -- Chỉ lấy sản phẩm đang hoạt động
    ORDER BY 
        SP.GiaBan ASC;
END;
GO

-- SP d: Danh sách hóa đơn đặt hàng theo ngày
CREATE OR ALTER PROCEDURE SP_ThongKe_DonHang_TheoNgay
    @TuNgay DATE,
    @DenNgay DATE,
    @MaChiNhanh UNIQUEIDENTIFIER = NULL -- Nếu NULL thì lấy hết
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        dh.MaDonHang,
        kh.HoTen AS TenKhachHang,
        nv.HoTen AS NhanVienSale,
        cn.TenChiNhanh,
        dh.NgayDat,
        dh.LoaiDon,
        dh.TrangThai,
        ISNULL(SUM(ct.ThanhTien), 0) AS TongTien
    FROM DonHang dh
    JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
    LEFT JOIN NhanVien nv ON dh.MaNhanVienSale = nv.MaNhanVien
    JOIN ChiNhanh cn ON dh.MaChiNhanh = cn.MaChiNhanh
    LEFT JOIN ChiTietDonHang ct ON dh.MaDonHang = ct.MaDonHang
    WHERE CAST(dh.NgayDat AS DATE) BETWEEN @TuNgay AND @DenNgay
      AND (@MaChiNhanh IS NULL OR dh.MaChiNhanh = @MaChiNhanh)
    GROUP BY dh.MaDonHang, kh.HoTen, nv.HoTen, cn.TenChiNhanh, dh.NgayDat, dh.LoaiDon, dh.TrangThai
    ORDER BY dh.NgayDat DESC;
END;
GO



-- SP e: Xem danh sách nhân viên và đánh giá
CREATE OR ALTER PROCEDURE SP_Xem_DanhGia_NhanVien
    @MaChiNhanh UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        nv.MaNhanVien,
        nv.HoTen,
        nv.ChucVu,
        cn.TenChiNhanh,
        COUNT(dg.MaDanhGia) AS SoLuotDanhGia,
        CAST(AVG(CAST(dg.DiemThaiDo AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS DiemThaiDoTB
    FROM NhanVien nv
    JOIN ChiNhanh cn ON nv.MaChiNhanh = cn.MaChiNhanh
    LEFT JOIN HoaDon hd ON nv.MaNhanVien = hd.MaNhanVienThuNgan -- Hoặc nhân viên sale tùy nghiệp vụ
    LEFT JOIN DanhGia dg ON hd.MaHoaDon = dg.MaHoaDon
    WHERE (@MaChiNhanh IS NULL OR nv.MaChiNhanh = @MaChiNhanh)
    GROUP BY nv.MaNhanVien, nv.HoTen, nv.ChucVu, cn.TenChiNhanh
    ORDER BY DiemThaiDoTB DESC;
END;
GO



-- SP f: Thống kê dịch vụ hot theo đánh giá và số lượt đặt
CREATE OR ALTER PROCEDURE SP_ThongKe_DichVu_Hot
    @Top INT = 10,
    @TuNgay DATE = NULL, -- Optional
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Nếu không truyền ngày, mặc định lấy 30 ngày gần nhất
    IF @TuNgay IS NULL SET @TuNgay = DATEADD(DAY, -30, GETDATE());
    IF @DenNgay IS NULL SET @DenNgay = GETDATE();

    SELECT TOP (@Top)
        dv.TenDichVu,
        dv.LoaiDichVu,
        COUNT(ctlh.MaLichHen) AS SoLuotDat,
        CAST(AVG(CAST(dg.DiemChatLuong AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS DiemChatLuongTB
    FROM DichVu dv
    JOIN ChiTietLichHen ctlh ON dv.MaDichVu = ctlh.MaDichVu
    JOIN LichHen lh ON ctlh.MaLichHen = lh.MaLichHen
    LEFT JOIN HoaDon hd ON lh.MaHoaDon = hd.MaHoaDon
    LEFT JOIN DanhGia dg ON hd.MaHoaDon = dg.MaHoaDon
    WHERE lh.NgayGioHen BETWEEN @TuNgay AND @DenNgay
      AND lh.TrangThai = N'Hoàn tất'
    GROUP BY dv.MaDichVu, dv.TenDichVu, dv.LoaiDichVu
    ORDER BY SoLuotDat DESC, DiemChatLuongTB DESC;
END;
GO


-- SP k: Thống kê sản phẩm bán chạy
CREATE OR ALTER PROCEDURE SP_ThongKe_SanPham_BanChay
    @Top INT = 10,                        -- Lấy Top bao nhiêu sản phẩm (Mặc định 10)
    @MaChiNhanh UNIQUEIDENTIFIER = NULL,  -- NULL = Xem toàn hệ thống
    @TuNgay DATE = NULL,                  -- Mặc định NULL = Lấy 30 ngày gần nhất
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @TuNgay IS NULL SET @TuNgay = DATEADD(DAY, -30, GETDATE());
    IF @DenNgay IS NULL SET @DenNgay = GETDATE();

    SELECT TOP (@Top)
        sp.TenSanPham,
        lsp.TenLoai,

        SUM(ct.SoLuong) AS TongSoLuongBan,
        
        SUM(ct.ThanhTien) AS TongDoanhThu,
        
        COUNT(DISTINCT dh.MaDonHang) AS SoLuotDonHang
        
    FROM SanPham sp
    JOIN LoaiSanPham lsp ON sp.MaLoai = lsp.MaLoai
    JOIN ChiTietDonHang ct ON sp.MaSanPham = ct.MaSanPham
    JOIN DonHang dh ON ct.MaDonHang = dh.MaDonHang
    
    WHERE dh.TrangThai = N'Hoàn tất' -- Quan trọng: Chỉ tính các đơn đã bán thành công
      AND (@MaChiNhanh IS NULL OR dh.MaChiNhanh = @MaChiNhanh)
      AND (CAST(dh.NgayDat AS DATE) BETWEEN @TuNgay AND @DenNgay)
      
    GROUP BY sp.MaSanPham, sp.TenSanPham, lsp.TenLoai
    ORDER BY TongSoLuongBan DESC; -- Sắp xếp từ cao xuống thấp
END;
GO
-- =============================================================
-- g) THỐNG KÊ DOANH THU TOÀN HỆ THỐNG
-- Tên SP: SP_BaoCao_DoanhThu_ToanHeThong
-- =============================================================
IF OBJECT_ID('SP_BaoCao_DoanhThu_ToanHeThong', 'P') IS NOT NULL
    DROP PROCEDURE SP_BaoCao_DoanhThu_ToanHeThong;
GO

CREATE PROCEDURE SP_BaoCao_DoanhThu_ToanHeThong
    @Nam INT
AS
BEGIN
    -- Mục đích: Tổng hợp doanh thu thực tế (sau khi trừ KM/Điểm) của tất cả chi nhánh theo từng tháng
    SELECT 
        CN.MaChiNhanh,
        CN.TenChiNhanh,
        MONTH(HD.NgayTao) AS Thang,
        SUM(HD.TongTienThucTra) AS TongDoanhThu
    FROM HoaDon HD
    JOIN ChiNhanh CN ON HD.MaChiNhanh = CN.MaChiNhanh
    WHERE 
        YEAR(HD.NgayTao) = @Nam
    GROUP BY 
        CN.MaChiNhanh, 
        CN.TenChiNhanh, 
        MONTH(HD.NgayTao)
    ORDER BY 
        CN.TenChiNhanh, 
        MONTH(HD.NgayTao);
END;
GO

-- =============================================================
-- h) THỐNG KÊ DOANH THU CHI NHÁNH CHI TIẾT (Bán hàng vs Dịch vụ)
-- Tên SP: SP_BaoCao_DoanhThu_ChiNhanh_ChiTiet
-- =============================================================
IF OBJECT_ID('SP_BaoCao_DoanhThu_ChiNhanh_ChiTiet', 'P') IS NOT NULL
    DROP PROCEDURE SP_BaoCao_DoanhThu_ChiNhanh_ChiTiet;
GO

CREATE PROCEDURE SP_BaoCao_DoanhThu_ChiNhanh_ChiTiet
    @MaChiNhanh UNIQUEIDENTIFIER,
    @TuNgay DATE,
    @DenNgay DATE
AS
BEGIN
    -- Mục đích: Tách dòng tiền Doanh thu từ Bán hàng (DonHang) và Dịch vụ (LichHen)
    -- Logic: Một Hóa đơn sẽ được liên kết với Đơn hàng HOẶC Lịch hẹn
    
    SELECT 
        CAST(HD.NgayTao AS DATE) AS Ngay,
        
        -- Tính tổng tiền các hóa đơn liên kết với Đơn Hàng (Bán lẻ)
        SUM(CASE 
            WHEN DH.MaDonHang IS NOT NULL THEN HD.TongTienThucTra 
            ELSE 0 
        END) AS DoanhThuBanHang,

        -- Tính tổng tiền các hóa đơn liên kết với Lịch Hẹn (Dịch vụ)
        SUM(CASE 
            WHEN LH.MaLichHen IS NOT NULL THEN HD.TongTienThucTra 
            ELSE 0 
        END) AS DoanhThuDichVu,

        -- Tổng cộng
        SUM(HD.TongTienThucTra) AS TongCong

    FROM HoaDon HD
    -- Join để xác định nguồn gốc hóa đơn
    LEFT JOIN DonHang DH ON HD.MaHoaDon = DH.MaHoaDon
    LEFT JOIN LichHen LH ON HD.MaHoaDon = LH.MaHoaDon
    WHERE 
        HD.MaChiNhanh = @MaChiNhanh
        AND CAST(HD.NgayTao AS DATE) BETWEEN @TuNgay AND @DenNgay
    GROUP BY 
        CAST(HD.NgayTao AS DATE)
    ORDER BY 
        Ngay DESC;
END;
GO

-- =============================================================
-- i) THỐNG KÊ DỊCH VỤ DOANH THU CAO NHẤT (Top N Tháng)
-- Tên SP: SP_Top_DichVu_DoanhThu
-- =============================================================
IF OBJECT_ID('SP_Top_DichVu_DoanhThu', 'P') IS NOT NULL
    DROP PROCEDURE SP_Top_DichVu_DoanhThu;
GO

CREATE PROCEDURE SP_Top_DichVu_DoanhThu
    @SoThangGanNhat INT
AS
BEGIN
    -- Xác định ngày bắt đầu dựa trên số tháng lùi lại
    DECLARE @NgayBatDau DATE = DATEADD(MONTH, -@SoThangGanNhat, GETDATE());

    -- Mục đích: Tìm dịch vụ mang lại nhiều tiền nhất (Dựa trên ChiTietLichHen.DonGiaThucTe)
    SELECT TOP 10
        DV.TenDichVu,
        DV.LoaiDichVu,
        COUNT(CTLH.MaLichHen) AS SoLuotSuDung, -- Đếm số lần dịch vụ được thực hiện
        SUM(CTLH.DonGiaThucTe) AS TongDoanhThu
    FROM ChiTietLichHen CTLH
    JOIN LichHen LH ON CTLH.MaLichHen = LH.MaLichHen
    JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
    WHERE 
        LH.TrangThai = N'Hoàn tất' -- Chỉ tính các ca đã làm xong và thu tiền
        AND LH.NgayGioHen >= @NgayBatDau
    GROUP BY 
        DV.MaDichVu, 
        DV.TenDichVu,
        DV.LoaiDichVu
    ORDER BY 
        TongDoanhThu DESC; -- Sắp xếp doanh thu cao nhất lên đầu
END;
GO

CREATE PROCEDURE sp_XemHieuSuatNhanVien
    @NguoiYeuCau UNIQUEIDENTIFIER,       -- ID người đang xem
    @MaChiNhanhXem UNIQUEIDENTIFIER = NULL, -- NULL = Xem hết (nếu là Admin)
    @TuNgay DATE,
    @DenNgay DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Role NVARCHAR(50), @MyBranch UNIQUEIDENTIFIER;
    
    SELECT @Role = ChucVu, @MyBranch = MaChiNhanh 
    FROM NhanVien WHERE MaNhanVien = @NguoiYeuCau;


    IF @Role <> N'Quản lý cấp công ty' SET @MaChiNhanhXem = @MyBranch;

    SELECT 
        NV.HoTen, 
        NV.ChucVu, 
        CN.TenChiNhanh,

        (SELECT ISNULL(SUM(TongTienThucTra), 0) FROM HoaDon HD 
         WHERE HD.MaNhanVien = NV.MaNhanVien 
           AND HD.NgayTao BETWEEN @TuNgay AND @DenNgay) AS DoanhSoBan,

        (SELECT ISNULL(SUM(CT.DonGiaThucTe), 0) FROM ChiTietLichHen CT 
         JOIN LichHen LH ON CT.MaLichHen = LH.MaLichHen
         WHERE CT.MaBacSi = NV.MaNhanVien 
           AND LH.NgayGioHen BETWEEN @TuNgay AND @DenNgay) AS DoanhSoDichVu

    FROM NhanVien NV
    JOIN ChiNhanh CN ON NV.MaChiNhanh = CN.MaChiNhanh
    WHERE (@MaChiNhanhXem IS NULL OR NV.MaChiNhanh = @MaChiNhanhXem)
    ORDER BY DoanhSoBan DESC, DoanhSoDichVu DESC;
END;


CREATE PROCEDURE sp_TraCuuLichBanBacSi
    @MaBacSi UNIQUEIDENTIFIER,
    @NgayXem DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        CN.TenChiNhanh,
        CN.ThoiGianMoCua,
        CN.ThoiGianDongCua
    FROM NhanVien NV
    JOIN ChiNhanh CN ON NV.MaChiNhanh = CN.MaChiNhanh
    WHERE NV.MaNhanVien = @MaBacSi;
    SELECT 
        LH.MaLichHen,
        LH.NgayGioHen AS ThoiGianBatDau,
        
        -- Tính thời gian kết thúc (End Time)
        DATEADD(MINUTE, 
            ISNULL(
                (SELECT SUM(DV.ThoiGianThucHienDuKien)
                 FROM ChiTietLichHen CTLH 
                 JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
                 WHERE CTLH.MaLichHen = LH.MaLichHen), 
            30), 
            LH.NgayGioHen
        ) AS ThoiGianKetThuc,
        
        LH.TrangThai
    FROM LichHen LH
    WHERE LH.MaNVTao = @MaBacSi      AND CAST(LH.NgayGioHen AS DATE) = @NgayXem
      AND LH.TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận', N'Hoàn tất')
    ORDER BY LH.NgayGioHen ASC;
END;


CREATE PROCEDURE sp_TuDongTinhLuongVaKPI
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. TÍNH DOANH THU TOÀN CÔNG TY (Cho KPI Giám đốc)
    DECLARE @DoanhThuGlobal DECIMAL(18,0);
    SELECT @DoanhThuGlobal = ISNULL(SUM(TongThucTra), 0)
    FROM HoaDon
    WHERE MONTH(NgayTao) = @Thang AND YEAR(NgayTao) = @Nam;

    -- 2. TÍNH TOÁN VÀ HIỂN THỊ KẾT QUẢ (Không lưu vào DB)
    SELECT 
        NV.MaNhanVien,
        NV.HoTen,
        NV.ChucVu,
        NV.LuongCoBan,

        -- A. TÍNH PHỤ CẤP (Hard-code theo Text)
        CASE 
            WHEN NV.ChucVu = N'Quản lý cấp công ty' THEN 10000000
            WHEN NV.ChucVu = N'Quản lý chi nhánh' THEN 5000000
            WHEN NV.ChucVu = N'Bác sĩ thú y' AND NV.CoPhaiTruongNhom = 1 THEN 3000000
            ELSE 0 
        END AS PhuCap,

        -- B. TÍNH THƯỞNG KPI
        CASE 
            -- KPI Sale: 5% Doanh số cá nhân
            WHEN NV.ChucVu = N'Nhân viên bán hàng' THEN (
                SELECT ISNULL(SUM(TongThucTra), 0) * 0.05
                FROM HoaDon HD 
                WHERE HD.MaNhanVienThuNgan = NV.MaNhanVien 
                  AND MONTH(HD.NgayTao) = @Thang AND YEAR(HD.NgayTao) = @Nam
            )
            -- KPI Bác sĩ: 10% Doanh số dịch vụ
            WHEN NV.ChucVu = N'Bác sĩ thú y' THEN (
                SELECT ISNULL(SUM(CTLH.DonGiaThucTe), 0) * 0.10
                FROM ChiTietLichHen CTLH
                JOIN LichHen LH ON CTLH.MaLichHen = LH.MaLichHen
                WHERE CTLH.MaBacSi = NV.MaNhanVien 
                  AND MONTH(LH.NgayGioHen) = @Thang AND YEAR(LH.NgayGioHen) = @Nam
            )
            -- KPI Quản lý CN: 1% Doanh thu Chi nhánh
            WHEN NV.ChucVu = N'Quản lý chi nhánh' THEN (
                SELECT ISNULL(SUM(TongThucTra), 0) * 0.01
                FROM HoaDon HD
                WHERE HD.MaChiNhanh = NV.MaChiNhanh
                  AND MONTH(HD.NgayTao) = @Thang AND YEAR(HD.NgayTao) = @Nam
            )
            -- KPI Giám đốc: 0.5% Doanh thu Global
            WHEN NV.ChucVu = N'Quản lý cấp công ty' THEN (
                @DoanhThuGlobal * 0.005
            )
            ELSE 0 
        END AS ThuongKPI,

        -- C. TỔNG THỰC LĨNH (Cộng dồn logic trên)
        (
         NV.LuongCoBan + 
         -- Logic Phụ cấp (Lặp lại)
         CASE 
            WHEN NV.ChucVu = N'Quản lý cấp công ty' THEN 10000000
            WHEN NV.ChucVu = N'Quản lý chi nhánh' THEN 5000000
            WHEN NV.ChucVu = N'Bác sĩ thú y' AND NV.CoPhaiTruongNhom = 1 THEN 3000000
            ELSE 0 
         END +
         -- Logic KPI (Lặp lại)
         CASE 
            WHEN NV.ChucVu = N'Nhân viên bán hàng' THEN (SELECT ISNULL(SUM(TongThucTra), 0) * 0.05 FROM HoaDon HD WHERE HD.MaNhanVienThuNgan = NV.MaNhanVien AND MONTH(HD.NgayTao) = @Thang AND YEAR(HD.NgayTao) = @Nam)
            WHEN NV.ChucVu = N'Bác sĩ thú y' THEN (SELECT ISNULL(SUM(CTLH.DonGiaThucTe), 0) * 0.10 FROM ChiTietLichHen CTLH JOIN LichHen LH ON CTLH.MaLichHen = LH.MaLichHen WHERE CTLH.MaBacSi = NV.MaNhanVien AND MONTH(LH.NgayGioHen) = @Thang AND YEAR(LH.NgayGioHen) = @Nam)
            WHEN NV.ChucVu = N'Quản lý chi nhánh' THEN (SELECT ISNULL(SUM(TongThucTra), 0) * 0.01 FROM HoaDon HD WHERE HD.MaChiNhanh = NV.MaChiNhanh AND MONTH(HD.NgayTao) = @Thang AND YEAR(HD.NgayTao) = @Nam)
            WHEN NV.ChucVu = N'Quản lý cấp công ty' THEN (@DoanhThuGlobal * 0.005)
            ELSE 0 
         END
        ) AS TongThucLinh

    FROM NhanVien NV
    WHERE NV.NgayNghiViec IS NULL 
       OR (MONTH(NV.NgayNghiViec) = @Thang AND YEAR(NV.NgayNghiViec) = @Nam);
END;
GO

-- Trigger a: Tự động giữ tồn kho khi tạo đơn Online
CREATE OR ALTER TRIGGER TR_ChiTietDonHang_GiuTonKho
ON ChiTietDonHang
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE k
        SET k.SoLuongTamGiu = k.SoLuongTamGiu + i.SoLuong
        FROM ChiTietKhoHang k
        JOIN INSERTED i ON k.MaSanPham = i.MaSanPham
        JOIN DonHang d ON i.MaDonHang = d.MaDonHang
        JOIN KhoHang kh ON d.MaChiNhanh = kh.MaChiNhanh
        WHERE d.LoaiDon = N'Online' AND k.MaKho = kh.MaKho;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO


-- Trigger d: Tự động trừ tồn kho của chi nhánh khi thanh toán
CREATE OR ALTER TRIGGER TR_DonHang_CapNhatTrangThai_Kho
ON DonHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Chỉ xử lý nếu cột TrangThai có sự thay đổi
    IF NOT UPDATE(TrangThai) RETURN;

    -- Bảng tạm để lưu danh sách các đơn hàng cần xử lý
    -- Giúp code gọn gàng và xử lý theo lô tốt hơn
    DECLARE @DanhSachXuLy TABLE (
        MaDonHang UNIQUEIDENTIFIER,
        LoaiDon NVARCHAR(20),
        TrangThaiMoi NVARCHAR(20),
        TrangThaiCu NVARCHAR(20),
        MaChiNhanh UNIQUEIDENTIFIER
    );

    INSERT INTO @DanhSachXuLy
    SELECT i.MaDonHang, i.LoaiDon, i.TrangThai, d.TrangThai, i.MaChiNhanh
    FROM INSERTED i JOIN DELETED d ON i.MaDonHang = d.MaDonHang
    WHERE i.TrangThai <> d.TrangThai; -- Chỉ lấy đơn có thay đổi trạng thái

    BEGIN TRY
        -- ---------------------------------------------------------
        -- TRƯỜNG HỢP 1: ĐƠN HÀNG THÀNH CÔNG (Hoàn tất)
        -- ---------------------------------------------------------
        
        -- 1.1. Với Đơn ONLINE: Trừ Vật Lý + Trừ Tạm Giữ
        UPDATE k
        SET k.SoLuongVatLy = k.SoLuongVatLy - ctd.SoLuong,
            k.SoLuongTamGiu = k.SoLuongTamGiu - ctd.SoLuong
        FROM ChiTietKhoHang k
        JOIN KhoHang kh ON k.MaKho = kh.MaKho
        JOIN @DanhSachXuLy ds ON kh.MaChiNhanh = ds.MaChiNhanh
        JOIN ChiTietDonHang ctd ON ds.MaDonHang = ctd.MaDonHang AND k.MaSanPham = ctd.MaSanPham
        WHERE ds.TrangThaiMoi = N'Hoàn tất' 
          AND ds.LoaiDon = N'Online';

        -- 1.2. Với Đơn TẠI QUẦY: Chỉ Trừ Vật Lý (Vì tại quầy ko giữ hàng trước đó)
        UPDATE k
        SET k.SoLuongVatLy = k.SoLuongVatLy - ctd.SoLuong
        FROM ChiTietKhoHang k
        JOIN KhoHang kh ON k.MaKho = kh.MaKho
        JOIN @DanhSachXuLy ds ON kh.MaChiNhanh = ds.MaChiNhanh
        JOIN ChiTietDonHang ctd ON ds.MaDonHang = ctd.MaDonHang AND k.MaSanPham = ctd.MaSanPham
        WHERE ds.TrangThaiMoi = N'Hoàn tất' 
          AND ds.LoaiDon = N'Tại quầy';

        -- ---------------------------------------------------------
        -- TRƯỜNG HỢP 2: ĐƠN HÀNG BỊ HỦY (Trả lại Tạm giữ cho đơn Online)
        -- ---------------------------------------------------------
        
        -- Nếu đơn Online bị hủy -> Phải trừ Tạm Giữ đi (để hàng quay lại trạng thái Khả dụng)
        UPDATE k
        SET k.SoLuongTamGiu = k.SoLuongTamGiu - ctd.SoLuong
        FROM ChiTietKhoHang k
        JOIN KhoHang kh ON k.MaKho = kh.MaKho
        JOIN @DanhSachXuLy ds ON kh.MaChiNhanh = ds.MaChiNhanh
        JOIN ChiTietDonHang ctd ON ds.MaDonHang = ctd.MaDonHang AND k.MaSanPham = ctd.MaSanPham
        WHERE ds.LoaiDon = N'Online'
          AND ds.TrangThaiMoi LIKE N'%hủy%' -- Bắt các trạng thái: Đã hủy-Quá hạn, Đã hủy-Khách hủy...
          AND ds.TrangThaiCu <> N'Hoàn tất'; -- Đề phòng trường hợp hủy đơn đã xong (hiếm gặp nhưng an toàn)

        -- ---------------------------------------------------------
        -- KIỂM TRA AN TOÀN KHO
        -- ---------------------------------------------------------
        IF EXISTS (SELECT 1 FROM ChiTietKhoHang WHERE SoLuongVatLy < 0 OR SoLuongTamGiu < 0)
        BEGIN
            RAISERROR(N'Lỗi: Tồn kho bị âm sau khi xử lý đơn hàng. Giao dịch bị hủy.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    END CATCH
END;
GO

-- SP: Thống kê doanh thu thuốc theo chi nhánh
CREATE OR ALTER PROCEDURE SP_ThongKe_DoanhThu_Thuoc
    @MaChiNhanh UNIQUEIDENTIFIER,
    @TuNgay DATE,
    @DenNgay DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        SP.TenSanPham AS TenThuoc,
        SUM(TT.SoLuong) AS TongSoLuong,
        SUM(TT.SoLuong * SP.GiaBan) AS DoanhThu
    FROM LichHen LH
    JOIN HoSoKham HSK ON LH.MaLichHen = HSK.MaLichHen
    JOIN ToaThuoc TT ON HSK.MaHoSo = TT.MaHoSo
    JOIN SanPham SP ON TT.MaSanPham = SP.MaSanPham
    WHERE LH.MaChiNhanh = @MaChiNhanh
      AND LH.TrangThai = N'Hoàn tất'
      AND CAST(LH.NgayGioHen AS DATE) BETWEEN @TuNgay AND @DenNgay
    GROUP BY SP.MaSanPham, SP.TenSanPham
    ORDER BY DoanhThu DESC;
END;
GO

--trigerr g
USE PetCareX_test_TR;
GO

CREATE OR ALTER TRIGGER TR_LichHen_HoanTat_TruKhoToaThuoc
ON LichHen
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ chạy khi trạng thái chuyển sang 'Hoàn tất'
    IF NOT UPDATE(TrangThai) RETURN;

    -- Kiểm tra: Chỉ xử lý các lịch hẹn vừa chuyển sang 'Hoàn tất'
    -- (Tránh trường hợp update cột khác mà vẫn bị trừ kho lại)
    DECLARE @DanhSachHoanTat TABLE (MaLichHen UNIQUEIDENTIFIER, MaChiNhanh UNIQUEIDENTIFIER);

    INSERT INTO @DanhSachHoanTat (MaLichHen, MaChiNhanh)
    SELECT i.MaLichHen, i.MaChiNhanh
    FROM INSERTED i
    JOIN DELETED d ON i.MaLichHen = d.MaLichHen
    WHERE i.TrangThai = N'Hoàn tất' AND d.TrangThai <> N'Hoàn tất';

    -- Nếu không có đơn nào hoàn tất thì dừng
    IF NOT EXISTS (SELECT 1 FROM @DanhSachHoanTat) RETURN;

    BEGIN TRY
        -- Thực hiện trừ kho vật lý
        -- Logic: Tìm Thuốc trong Toa -> Tìm Kho của Chi nhánh -> Trừ Số lượng
        UPDATE K
        SET K.SoLuongVatLy = K.SoLuongVatLy - TT.SoLuong
        FROM ChiTietKhoHang K
        JOIN KhoHang KH ON K.MaKho = KH.MaKho -- Xác định kho
        JOIN @DanhSachHoanTat DS ON KH.MaChiNhanh = DS.MaChiNhanh -- Khớp chi nhánh
        JOIN HoSoKham HSK ON DS.MaLichHen = HSK.MaLichHen -- Lấy hồ sơ
        JOIN ToaThuoc TT ON HSK.MaHoSo = TT.MaHoSo -- Lấy thuốc
        WHERE K.MaSanPham = TT.MaSanPham; -- Khớp sản phẩm

        -- Kiểm tra âm kho
        IF EXISTS (SELECT 1 FROM ChiTietKhoHang WHERE SoLuongVatLy < 0)
        BEGIN
            RAISERROR(N'Lỗi: Kho thuốc không đủ để xuất toa. Giao dịch bị hủy.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

    END TRY
    BEGIN CATCH
        DECLARE @Err NVARCHAR(MAX) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO


-- trigger h
USE PetCareX;
GO

CREATE OR ALTER TRIGGER TR_YeuCauNhapHang_HoanTat_TangKho
ON YeuCauNhapHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Chỉ xử lý khi trạng thái chuyển sang 'Hoàn tất'
    IF NOT UPDATE(TrangThai) RETURN;

    -- Tìm các đơn vừa được duyệt Hoàn tất
    DECLARE @DanhSachNhap TABLE (MaYeuCau UNIQUEIDENTIFIER, MaChiNhanh UNIQUEIDENTIFIER);
    
    INSERT INTO @DanhSachNhap
    SELECT i.MaYeuCau, i.MaChiNhanh
    FROM INSERTED i
    JOIN DELETED d ON i.MaYeuCau = d.MaYeuCau
    WHERE i.TrangThai = N'Hoàn tất' AND d.TrangThai <> N'Hoàn tất';

    IF NOT EXISTS (SELECT 1 FROM @DanhSachNhap) RETURN;

    BEGIN TRY
        -- 2. Đảm bảo sản phẩm đã có trong kho (Insert nếu thiếu)
        INSERT INTO ChiTietKhoHang (MaKho, MaSanPham, SoLuongVatLy, SoLuongTamGiu)
        SELECT DISTINCT
            KH.MaKho,
            CT.MaSanPham,
            0, 0
        FROM @DanhSachNhap DS
        JOIN ChiTietYeuCauNhap CT ON DS.MaYeuCau = CT.MaYeuCau
        JOIN KhoHang KH ON DS.MaChiNhanh = KH.MaChiNhanh
        WHERE NOT EXISTS (
            SELECT 1 FROM ChiTietKhoHang KCheck 
            WHERE KCheck.MaKho = KH.MaKho AND KCheck.MaSanPham = CT.MaSanPham
        );

        -- 3. Cộng kho
        UPDATE K
        SET K.SoLuongVatLy = K.SoLuongVatLy + CT.SoLuong,
            K.NgayCapNhatCuoi = GETDATE()
        FROM ChiTietKhoHang K
        JOIN KhoHang KH ON K.MaKho = KH.MaKho
        JOIN @DanhSachNhap DS ON KH.MaChiNhanh = DS.MaChiNhanh
        JOIN ChiTietYeuCauNhap CT ON DS.MaYeuCau = CT.MaYeuCau AND K.MaSanPham = CT.MaSanPham;

    END TRY
    BEGIN CATCH
        -- Ghi log hoặc throw lỗi tùy nhu cầu
        DECLARE @Err NVARCHAR(MAX) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO


-- =============================================================
-- STORED PROCEDURE: Thống kê dịch vụ hot (được đặt nhiều nhất)
-- =============================================================
GO

CREATE OR ALTER PROCEDURE SP_ThongKe_DichVu_Hot_ChiNhanh
    @MaChiNhanh UNIQUEIDENTIFIER,
    @TuNgay DATE = NULL,
    @DenNgay DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Thiết lập mặc định nếu không có ngày
    IF @TuNgay IS NULL SET @TuNgay = DATEADD(MONTH, -3, GETDATE());
    IF @DenNgay IS NULL SET @DenNgay = GETDATE();
    
    -- Truy vấn toàn bộ dữ liệu, không giới hạn TOP
    SELECT 
        DV.MaDichVu,
        DV.TenDichVu,
        DV.LoaiDichVu,
        DV.GiaNiemYet,
        DV.MoTa,
        DV.ThoiGianThucHienDuKien,
        COUNT(DISTINCT CTLH.MaLichHen) AS SoLuotDat,
        COUNT(CTLH.MaDichVu) AS TongSoLanDichVu,
        SUM(CTLH.DonGiaThucTe) AS TongDoanhThu,
        AVG(CTLH.DonGiaThucTe) AS GiaTrungBinh,
        MIN(LH.NgayGioHen) AS NgayDatDauTien,
        MAX(LH.NgayGioHen) AS NgayDatGanNhat,
        COUNT(DISTINCT LH.MaKhachHang) AS SoKhachHangSuDung
    FROM DichVu DV
    LEFT JOIN ChiTietLichHen CTLH ON DV.MaDichVu = CTLH.MaDichVu
    LEFT JOIN LichHen LH ON CTLH.MaLichHen = LH.MaLichHen 
        AND LH.MaChiNhanh = @MaChiNhanh
        AND LH.TrangThai != N'Hủy'
        AND CAST(LH.NgayGioHen AS DATE) BETWEEN @TuNgay AND @DenNgay
    WHERE EXISTS (
        SELECT 1 FROM CauHinhDichVu CHDV 
        WHERE CHDV.MaDichVu = DV.MaDichVu 
        AND CHDV.MaChiNhanh = @MaChiNhanh 
        AND CHDV.TrangThai = 1
    )
    GROUP BY 
        DV.MaDichVu, 
        DV.TenDichVu, 
        DV.LoaiDichVu, 
        DV.GiaNiemYet,
        DV.MoTa,
        DV.ThoiGianThucHienDuKien
    ORDER BY SoLuotDat DESC, TongDoanhThu DESC;
END;
GO


-- =============================================================