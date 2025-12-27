import { poolPromise } from '../Config/db.js';
import sql from 'mssql';

const companyManagerService = {
    // SP f: Thống kê dịch vụ hot theo đánh giá và số lượt đặt
    getHotServices: async (top = 10, fromDate = null, toDate = null) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Top', sql.Int, top)
                .input('TuNgay', sql.Date, fromDate)
                .input('DenNgay', sql.Date, toDate)
                .execute('SP_ThongKe_DichVu_Hot');
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getHotServices:', error);
            return { success: false, message: error.message };
        }
    },

    // SP g: Thống kê doanh thu toàn hệ thống
    getSystemRevenue: async (year) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Nam', sql.Int, year)
                .execute('SP_BaoCao_DoanhThu_ToanHeThong');
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getSystemRevenue:', error);
            return { success: false, message: error.message };
        }
    },

    // SP i: Thống kê dịch vụ doanh thu cao nhất (Top N tháng)
    getTopRevenueServices: async (months) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('SoThangGanNhat', sql.Int, months)
                .execute('SP_Top_DichVu_DoanhThu');
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getTopRevenueServices:', error);
            return { success: false, message: error.message };
        }
    },

    // SP e: Xem danh sách nhân viên và đánh giá
    getEmployeeRatings: async (branchId = null) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaChiNhanh', sql.UniqueIdentifier, branchId)
                .execute('SP_Xem_DanhGia_NhanVien');
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getEmployeeRatings:', error);
            return { success: false, message: error.message };
        }
    },

    // SP k: Thống kê sản phẩm bán chạy
    getBestSellingProducts: async (top = 10, branchId = null, fromDate = null, toDate = null) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Top', sql.Int, top)
                .input('MaChiNhanh', sql.UniqueIdentifier, branchId)
                .input('TuNgay', sql.Date, fromDate)
                .input('DenNgay', sql.Date, toDate)
                .execute('SP_ThongKe_SanPham_BanChay');
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getBestSellingProducts:', error);
            return { success: false, message: error.message };
        }
    },

    // Get all branches for dropdown
    getAllBranches: async () => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`SELECT MaChiNhanh, TenChiNhanh, DiaChi 
                        FROM ChiNhanh 
                        WHERE TrangThai = N'Hoạt động'`);
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getAllBranches:', error);
            return { success: false, message: error.message };
        }
    },

    // Get pending import requests
    getPendingImportRequests: async () => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT 
                        ycn.MaYeuCau,
                        ycn.NgayYeuCau,
                        ycn.TrangThai,
                        cn.TenChiNhanh,
                        cn.DiaChi,
                        COUNT(ct.MaSanPham) AS SoLuongSanPham,
                        SUM(ct.SoLuong) AS TongSoLuong
                    FROM YeuCauNhapHang ycn
                    JOIN ChiNhanh cn ON ycn.MaChiNhanh = cn.MaChiNhanh
                    LEFT JOIN ChiTietYeuCauNhap ct ON ycn.MaYeuCau = ct.MaYeuCau
                    WHERE ycn.TrangThai IN (N'Mới', N'Đã duyệt')
                    GROUP BY ycn.MaYeuCau, ycn.NgayYeuCau, ycn.TrangThai, cn.TenChiNhanh, cn.DiaChi
                    ORDER BY ycn.NgayYeuCau DESC
                `);
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getPendingImportRequests:', error);
            return { success: false, message: error.message };
        }
    },

    // Get import request details
    getImportRequestDetails: async (requestId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaYeuCau', sql.UniqueIdentifier, requestId)
                .query(`
                    SELECT 
                        ct.MaSanPham,
                        sp.TenSanPham,
                        lsp.TenLoai,
                        ct.SoLuong,
                        sp.GiaBan,
                        (ct.SoLuong * sp.GiaBan) AS ThanhTien
                    FROM ChiTietYeuCauNhap ct
                    JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
                    JOIN LoaiSanPham lsp ON sp.MaLoai = lsp.MaLoai
                    WHERE ct.MaYeuCau = @MaYeuCau
                `);
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getImportRequestDetails:', error);
            return { success: false, message: error.message };
        }
    },

    // Approve import request
    approveImportRequest: async (requestId, newStatus) => {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('MaYeuCau', sql.UniqueIdentifier, requestId)
                .input('TrangThai', sql.NVarChar, newStatus)
                .query(`
                    UPDATE YeuCauNhapHang 
                    SET TrangThai = @TrangThai 
                    WHERE MaYeuCau = @MaYeuCau
                `);
            
            return { success: true, message: 'Cập nhật trạng thái thành công' };
        } catch (error) {
            console.error('Error in approveImportRequest:', error);
            return { success: false, message: error.message };
        }
    },

    // Get all employees for transfer
    getAllEmployees: async () => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT 
                        nv.MaNhanVien,
                        nv.HoTen,
                        nv.ChucVu,
                        nv.SoDienThoai,
                        nv.MaChiNhanh,
                        cn.TenChiNhanh,
                        nv.NgayVaoLam
                    FROM NhanVien nv
                    LEFT JOIN ChiNhanh cn ON nv.MaChiNhanh = cn.MaChiNhanh
                    WHERE nv.NgayNghiViec IS NULL
                    ORDER BY cn.TenChiNhanh, nv.HoTen
                `);
            
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error('Error in getAllEmployees:', error);
            return { success: false, message: error.message };
        }
    },

    // Transfer employee to new branch
    transferEmployee: async (employeeId, newBranchId, reason) => {
        try {
            const pool = await poolPromise;
            
            // Update employee branch
            await pool.request()
                .input('MaNhanVien', sql.UniqueIdentifier, employeeId)
                .input('MaChiNhanh', sql.UniqueIdentifier, newBranchId)
                .query(`
                    UPDATE NhanVien 
                    SET MaChiNhanh = @MaChiNhanh 
                    WHERE MaNhanVien = @MaNhanVien
                `);
            
            // Note: The trigger TR_GhiLichSuDieuDong will automatically log this transfer
            
            return { success: true, message: 'Điều động nhân viên thành công' };
        } catch (error) {
            console.error('Error in transferEmployee:', error);
            return { success: false, message: error.message };
        }
    }
};

export default companyManagerService;
