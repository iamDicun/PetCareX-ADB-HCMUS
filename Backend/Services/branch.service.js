import sql from 'mssql';
import { poolPromise } from '../Config/db.js';
import customerService from './customer.service.js';

// Lấy doanh thu chi nhánh theo dịch vụ và sản phẩm
const getRevenueByServiceAndProduct = async (MaChiNhanh, TuNgay, DenNgay) => {
    try {
        console.log('=== Service getRevenueByServiceAndProduct ===');
        console.log('MaChiNhanh:', MaChiNhanh);
        console.log('TuNgay:', TuNgay, 'Type:', typeof TuNgay);
        console.log('DenNgay:', DenNgay, 'Type:', typeof DenNgay);
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, MaChiNhanh)
            .input('TuNgay', sql.Date, TuNgay)
            .input('DenNgay', sql.Date, DenNgay)
            .execute('SP_BaoCao_DoanhThu_ChiNhanh_ChiTiet');
        
        console.log('Result count:', result.recordset?.length);
        return result.recordset;
    } catch (error) {
        console.error('Lỗi trong getRevenueByServiceAndProduct:', error);
        throw error;
    }
};

// Lấy danh sách hóa đơn đặt hàng theo khoảng ngày
const getOrdersByDateRange = async (MaChiNhanh, TuNgay, DenNgay, page = 1, limit = 10) => {
    try {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        
        const result = await pool.request()
            .input('MACHINHANH', sql.UniqueIdentifier, MaChiNhanh)
            .input('TUNGAY', sql.Date, TuNgay)
            .input('DENNGAY', sql.Date, DenNgay)
            .execute('SP_ThongKe_DonHang_TheoNgay');
        
        // Apply pagination to results
        const data = result.recordset || [];
        const total = data.length;
        const paginatedData = data.slice(offset, offset + limit);
        
        return {
            data: paginatedData,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Lỗi trong getOrdersByDateRange:', error);
        throw error;
    }
};

// Xem danh sách nhân viên và đánh giá
const getEmployeeRatings = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .execute('SP_Xem_DanhGia_NhanVien');
        
        return result.recordset;
    } catch (error) {
        console.error('Lỗi trong getEmployeeRatings:', error);
        throw error;
    }
};

// Xem hiệu suất làm việc của nhân viên
const getEmployeePerformance = async (MaNhanVien, MaChiNhanh, TuNgay, DenNgay, page = 1, limit = 10) => {
    try {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        
        // Debug log
        console.log('=== getEmployeePerformance Parameters ===');
        console.log('MaNhanVien:', MaNhanVien);
        console.log('MaChiNhanh:', MaChiNhanh);
        console.log('TuNgay:', TuNgay);
        console.log('DenNgay:', DenNgay);
        
        const result = await pool.request()
            .input('NguoiYeuCau', sql.UniqueIdentifier, MaNhanVien)
            .input('MaChiNhanhXem', sql.UniqueIdentifier, MaChiNhanh)
            .input('TuNgay', sql.Date, TuNgay)
            .input('DenNgay', sql.Date, DenNgay)
            .execute('sp_XemHieuSuatNhanVien');
        
        console.log('SP Result - Total records:', result.recordset?.length);
        console.log('Sample record:', result.recordset?.[0]);
        
        // Apply pagination to results
        const data = result.recordset || [];
        const total = data.length;
        const paginatedData = data.slice(offset, offset + limit);
        
        return {
            data: paginatedData,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Lỗi trong getEmployeePerformance:', error);
        throw error;
    }
};

// Lấy thống kê sản phẩm bán chạy
const getTopProducts = async (MaChiNhanh, TuNgay, DenNgay) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, MaChiNhanh)
            .input('TuNgay', sql.Date, TuNgay)
            .input('DenNgay', sql.Date, DenNgay)
            .execute('SP_ThongKe_SanPham_BanChay');
        
        return result.recordset;
    } catch (error) {
        console.error('Lỗi trong getTopProducts:', error);
        throw error;
    }
};

// Lấy thống kê dịch vụ hot (được đặt nhiều nhất)
const getHotServices = async (MaChiNhanh, TuNgay, DenNgay) => {
    try {
        const pool = await poolPromise;
        
        console.log('=== getHotServices Service ===');
        console.log('Calling SP with params:', {
            MaChiNhanh,
            TuNgay: TuNgay || 'NULL (will use default)',
            DenNgay: DenNgay || 'NULL (will use default)'
        });
        
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, MaChiNhanh)
            .input('TuNgay', sql.Date, TuNgay || null)
            .input('DenNgay', sql.Date, DenNgay || null)
            .execute('SP_ThongKe_DichVu_Hot_ChiNhanh');
        
        console.log('SP returned:', result.recordset?.length || 0, 'records');
        
        return result.recordset;
    } catch (error) {
        console.error('Lỗi trong getHotServices:', error);
        throw error;
    }
};

// Xem tồn kho của chi nhánh
const getBranchInventory = async (MaChiNhanh, page = 1, limit = 10) => {
    try {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        
        // Query từ bảng ChiTietKhoHang
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, MaChiNhanh)
            .query(`
                SELECT 
                    ctkh.MaSanPham,
                    sp.TenSanPham,
                    lsp.TenLoai AS TenLoaiSanPham,
                    ctkh.SoLuongVatLy,
                    ctkh.SoLuongTamGiu,
                    ctkh.SoLuongKhaDung,
                    ctkh.NgayCapNhatCuoi,
                    sp.GiaBan
                FROM ChiTietKhoHang ctkh
                JOIN KhoHang kh ON ctkh.MaKho = kh.MaKho
                JOIN SanPham sp ON ctkh.MaSanPham = sp.MaSanPham
                JOIN LoaiSanPham lsp ON sp.MaLoai = lsp.MaLoai
                WHERE kh.MaChiNhanh = @MaChiNhanh
                ORDER BY ctkh.SoLuongKhaDung ASC
            `);
        
        // Apply pagination to results
        const data = result.recordset || [];
        const total = data.length;
        const paginatedData = data.slice(offset, offset + limit);
        
        return {
            data: paginatedData,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Lỗi trong getBranchInventory:', error);
        throw error;
    }
};

// Sử dụng hàm getProducts từ customer.service để tránh duplicate code
const getAllProducts = customerService.getProducts;

// Tạo yêu cầu nhập hàng
const createImportRequest = async (MaChiNhanh, items) => {
    try {
        const pool = await poolPromise;
        const transaction = pool.transaction();
        
        await transaction.begin();
        
        try {
            // Tạo yêu cầu nhập hàng
            const requestResult = await transaction.request()
                .input('MaChiNhanh', sql.UniqueIdentifier, MaChiNhanh)
                .input('TrangThai', sql.NVarChar, 'Mới')
                .query(`
                    INSERT INTO YeuCauNhapHang (MaChiNhanh, NgayYeuCau, TrangThai)
                    OUTPUT INSERTED.MaYeuCau
                    VALUES (@MaChiNhanh, GETDATE(), @TrangThai)
                `);
            
            const MaYeuCau = requestResult.recordset[0].MaYeuCau;
            
            // Thêm chi tiết yêu cầu nhập hàng
            for (const item of items) {
                await transaction.request()
                    .input('MaYeuCau', sql.UniqueIdentifier, MaYeuCau)
                    .input('MaSanPham', sql.UniqueIdentifier, item.MaSanPham)
                    .input('SoLuong', sql.Int, item.SoLuong)
                    .query(`
                        INSERT INTO ChiTietYeuCauNhap (MaYeuCau, MaSanPham, SoLuong)
                        VALUES (@MaYeuCau, @MaSanPham, @SoLuong)
                    `);
            }
            
            await transaction.commit();
            
            return { MaYeuCau };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Lỗi trong createImportRequest:', error);
        throw error;
    }
};

// Lấy lịch sử yêu cầu nhập hàng
const getImportHistory = async (MaChiNhanh, page = 1, limit = 10) => {
    try {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, MaChiNhanh)
            .query(`
                SELECT 
                    ycnh.MaYeuCau,
                    ycnh.NgayYeuCau,
                    ycnh.TrangThai,
                    COUNT(DISTINCT ctycn.MaSanPham) AS SoLoaiSanPham,
                    SUM(ctycn.SoLuong) AS TongSoLuong
                FROM YeuCauNhapHang ycnh
                LEFT JOIN ChiTietYeuCauNhap ctycn ON ycnh.MaYeuCau = ctycn.MaYeuCau
                WHERE ycnh.MaChiNhanh = @MaChiNhanh
                GROUP BY ycnh.MaYeuCau, ycnh.NgayYeuCau, ycnh.TrangThai
                ORDER BY ycnh.NgayYeuCau DESC
            `);
        
        // Apply pagination to results
        const data = result.recordset || [];
        const total = data.length;
        const paginatedData = data.slice(offset, offset + limit);
        
        return {
            data: paginatedData,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Lỗi trong getImportHistory:', error);
        throw error;
    }
};

// Lấy doanh thu thuốc
const getMedicineRevenue = async (MaChiNhanh, TuNgay, DenNgay) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, MaChiNhanh)
            .input('TuNgay', sql.Date, TuNgay)
            .input('DenNgay', sql.Date, DenNgay)
            .execute('SP_ThongKe_DoanhThu_Thuoc');
        
        return result.recordset;
    } catch (error) {
        console.error('Lỗi trong getMedicineRevenue:', error);
        throw error;
    }
};

// Lấy doanh thu theo ngày (lấy tất cả, phân trang ở frontend)
const getRevenueByDate = async ({ branchId, fromDate, toDate }) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('TuNgay', sql.Date, fromDate || new Date(new Date().setDate(new Date().getDate() - 30)))
            .input('DenNgay', sql.Date, toDate || new Date())
            .execute('SP_DoanhThu_TheoNgay_PhanTrang');
        
        const data = result.recordset || [];
        
        // Tính tổng cộng từ data
        const summary = {
            totalService: data.reduce((sum, row) => sum + (row.DoanhThuDichVu || 0), 0),
            totalProduct: data.reduce((sum, row) => sum + (row.DoanhThuBanHang || 0), 0),
            totalRevenue: data.reduce((sum, row) => sum + (row.TongDoanhThu || 0), 0),
            totalInvoices: data.reduce((sum, row) => sum + (row.SoHoaDon || 0), 0)
        };
        
        return {
            data: data,
            summary: summary
        };
    } catch (error) {
        console.error('Lỗi trong getRevenueByDate:', error);
        throw error;
    }
};

// Lấy danh sách lịch hẹn theo ngày
const getAppointmentsByDate = async ({ branchId, fromDate, toDate }) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, branchId)
            .input('TuNgay', sql.Date, fromDate || new Date(new Date().setDate(new Date().getDate() - 30)))
            .input('DenNgay', sql.Date, toDate || new Date())
            .execute('SP_LichHen_TheoNgay');
        
        return result.recordset || [];
    } catch (error) {
        console.error('Lỗi trong getAppointmentsByDate:', error);
        throw error;
    }
};

export default {
    getRevenueByServiceAndProduct,
    getOrdersByDateRange,
    getEmployeeRatings,
    getEmployeePerformance,
    getTopProducts,
    getHotServices,
    getBranchInventory,
    getAllProducts,
    createImportRequest,
    getImportHistory,
    getMedicineRevenue,
    getRevenueByDate,
    getAppointmentsByDate
};
