-- =====================================================================
-- Stored Procedures: Quản lý khách hàng
-- =====================================================================

USE PetCareX;
GO

-- =====================================================================
-- Kiểm tra khách hàng tồn tại theo SĐT
-- =====================================================================
CREATE OR ALTER PROCEDURE SP_KiemTra_KhachHang
    @SoDienThoai VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        KH.MaKhachHang,
        KH.HoTen,
        KH.SoDienThoai,
        KH.Email,
        KH.CCCD,
        KH.GioiTinh,
        KH.NgaySinh,
        
        -- Thông tin thẻ thành viên (nếu có)
        TV.MaThe,
        TV.HangThanhVien,
        TV.DiemTichLuy,
        TV.TongChiTieuNam,
        TV.NgayCap,
        TV.TrangThai AS TrangThaiThe
        
    FROM KhachHang KH
    LEFT JOIN TheThanhVien TV ON KH.MaKhachHang = TV.MaKhachHang
    WHERE KH.SoDienThoai = @SoDienThoai;
END;
GO

-- =====================================================================
-- Tạo khách hàng mới (Trigger sẽ tự động tạo thẻ thành viên)
-- =====================================================================
CREATE OR ALTER PROCEDURE SP_TaoMoi_KhachHang_VaThe
    @HoTen NVARCHAR(100),
    @SoDienThoai VARCHAR(15),
    @Email VARCHAR(100) = NULL,
    @CCCD VARCHAR(20) = NULL,
    @GioiTinh NVARCHAR(5) = NULL,
    @NgaySinh DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    DECLARE @MaKhachHang UNIQUEIDENTIFIER;
    DECLARE @OutputTable TABLE (MaKhachHang UNIQUEIDENTIFIER);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Kiểm tra SĐT đã tồn tại chưa
        IF EXISTS (SELECT 1 FROM KhachHang WHERE SoDienThoai = @SoDienThoai)
        BEGIN
            ROLLBACK;
            RAISERROR(N'Số điện thoại đã tồn tại trong hệ thống', 16, 1);
            RETURN;
        END;

        -- Tạo khách hàng mới (Trigger TR_KhachHang_AfterInsert_TaoThe sẽ tự động tạo thẻ)
        INSERT INTO KhachHang (HoTen, SoDienThoai, Email, CCCD, GioiTinh, NgaySinh)
        OUTPUT INSERTED.MaKhachHang INTO @OutputTable
        VALUES (@HoTen, @SoDienThoai, @Email, @CCCD, @GioiTinh, @NgaySinh);
        
        SELECT @MaKhachHang = MaKhachHang FROM @OutputTable;

        COMMIT TRANSACTION;

        -- Đợi trigger chạy xong, sau đó trả về thông tin khách hàng và thẻ
        WAITFOR DELAY '00:00:00.1'; -- Đợi 100ms để đảm bảo trigger đã chạy
        
        SELECT 
            KH.MaKhachHang,
            KH.HoTen,
            KH.SoDienThoai,
            KH.Email,
            KH.CCCD,
            KH.GioiTinh,
            KH.NgaySinh,
            
            TV.MaThe,
            TV.HangThanhVien,
            TV.DiemTichLuy,
            TV.TongChiTieuNam,
            TV.NgayCap,
            TV.TrangThai AS TrangThaiThe
            
        FROM KhachHang KH
        LEFT JOIN TheThanhVien TV ON KH.MaKhachHang = TV.MaKhachHang
        WHERE KH.MaKhachHang = @MaKhachHang;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- =====================================================================
-- Ví dụ sử dụng:
-- =====================================================================

-- Kiểm tra khách hàng tồn tại
EXEC SP_KiemTra_KhachHang @SoDienThoai = '0901234567';

-- Tạo khách hàng mới kèm thẻ
EXEC SP_TaoMoi_KhachHang_VaThe 
    @HoTen = N'Nguyễn Văn A',
    @SoDienThoai = '0901234567',
    @Email = 'nguyenvana@email.com',
    @CCCD = '079123456789',
    @GioiTinh = N'Nam',
    @NgaySinh = '1990-01-15';

GO
