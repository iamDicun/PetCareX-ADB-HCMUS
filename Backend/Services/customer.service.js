import { poolPromise } from '../Config/db.js';
import sql from 'mssql';

async function findByPhoneNum(sdt) {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('sdt', sql.VarChar, sdt)
            .query('SELECT TOP 1 * FROM KhachHang WHERE SoDienThoai = @sdt');
        
        
        return result.recordset[0] || null;
    } catch (error) {
        console.error('[findByPhoneNum] Error:', error.message, error);
        throw error;
    }
}

async function getProducts() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM SanPham WHERE TrangThai = 1');
        return result.recordset;
    } catch (error) {
        console.error('[getProducts] Error:', error.message, error);
        throw error;
    }
}

async function getServices() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM DichVu');
        return result.recordset;
    } catch (error) {
        console.error('[getServices] Error:', error.message, error);
        throw error;
    }
}

async function search(keyword) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('keyword', sql.NVarChar, `%${keyword}%`)
            .query(`
                SELECT 'Product' as Type, MaSanPham as ID, TenSanPham as Name, GiaBan as Price, MoTa as Description 
                FROM SanPham 
                WHERE TenSanPham LIKE @keyword AND TrangThai = 1
                UNION ALL
                SELECT 'Service' as Type, MaDichVu as ID, TenDichVu as Name, GiaNiemYet as Price, MoTa as Description
                FROM DichVu 
                WHERE TenDichVu LIKE @keyword
            `);
        return result.recordset;
    } catch (error) {
        console.error('[search] Error:', error.message, error);
        throw error;
    }
}

async function registerPet(data) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKhachHang', sql.UniqueIdentifier, data.MaKhachHang)
            .input('MaLoaiTC', sql.VarChar, data.MaLoaiTC)
            .input('TenThuCung', sql.NVarChar, data.TenThuCung)
            .input('Giong', sql.NVarChar, data.Giong)
            .input('NgaySinh', sql.Date, data.NgaySinh)
            .input('GioiTinh', sql.NVarChar, data.GioiTinh)
            .input('CanNang', sql.Float, data.CanNang)
            .input('TinhTrangSK', sql.NVarChar, data.TinhTrangSK)
            .query(`
                INSERT INTO ThuCung (MaKhachHang, MaLoaiTC, TenThuCung, Giong, NgaySinh, GioiTinh, CanNang, TinhTrangSK)
                VALUES (@MaKhachHang, @MaLoaiTC, @TenThuCung, @Giong, @NgaySinh, @GioiTinh, @CanNang, @TinhTrangSK)
            `);
        return result;
    } catch (error) {
        console.error('[registerPet] Error:', error.message, error);
        throw error;
    }
}

async function getPetTypes() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM LoaiThuCung');
        return result.recordset;
    } catch (error) {
        console.error('[getPetTypes] Error:', error.message, error);
        throw error;
    }
}

async function createOrder(data) {
    // data: { MaKhachHang, MaChiNhanh, ChiTiet: [{ MaSanPham, SoLuong }] }
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();
        
        // Create Order
        const request = new sql.Request(transaction);
        const orderResult = await request
            .input('MaKhachHang', sql.UniqueIdentifier, data.MaKhachHang)
            .input('MaChiNhanh', sql.UniqueIdentifier, data.MaChiNhanh)
            .input('LoaiDon', sql.NVarChar, 'Online')
            .query(`
                INSERT INTO DonHang (MaKhachHang, MaChiNhanh, LoaiDon, TrangThai, NgayDat)
                OUTPUT INSERTED.MaDonHang
                VALUES (@MaKhachHang, @MaChiNhanh, @LoaiDon, N'Chờ xác nhận', GETDATE())
            `);
            
        const maDonHang = orderResult.recordset[0].MaDonHang;

        // Create Order Details
        for (const item of data.ChiTiet) {
            const detailRequest = new sql.Request(transaction);
            // Get Product Price
            const priceResult = await detailRequest
                .input('MaSanPham', sql.UniqueIdentifier, item.MaSanPham)
                .query('SELECT GiaBan FROM SanPham WHERE MaSanPham = @MaSanPham');
            
            const giaBan = priceResult.recordset[0].GiaBan;
            const thanhTien = giaBan * item.SoLuong;

            await detailRequest
                .input('MaDonHang', sql.UniqueIdentifier, maDonHang)
                .input('SoLuong', sql.Int, item.SoLuong)
                .input('DonGia', sql.Decimal, giaBan)
                .input('ThanhTien', sql.Decimal, thanhTien)
                .query(`
                    INSERT INTO ChiTietDonHang (MaDonHang, MaSanPham, SoLuong, DonGia, ThanhTien)
                    VALUES (@MaDonHang, @MaSanPham, @SoLuong, @DonGia, @ThanhTien)
                `);
        }

        // Update Total Amount in DonHang
        const updateRequest = new sql.Request(transaction);
        await updateRequest
            .input('MaDonHang', sql.UniqueIdentifier, maDonHang)
            .query(`
                UPDATE DonHang 
                SET TongTien = (SELECT SUM(ThanhTien) FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang),
                    TongTienThucTra = (SELECT SUM(ThanhTien) FROM ChiTietDonHang WHERE MaDonHang = @MaDonHang)
                WHERE MaDonHang = @MaDonHang
            `);

        await transaction.commit();
        return { success: true, maDonHang };
    } catch (error) {
        await transaction.rollback();
        console.error('[createOrder] Error:', error.message, error);
        throw error;
    }
}

async function createAppointment(data) {
    // data: { MaKhachHang, MaThuCung, NgayGioHen, MaChiNhanh, DichVu: [MaDichVu] }
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();
        
        const request = new sql.Request(transaction);
        const apptResult = await request
            .input('MaKhachHang', sql.UniqueIdentifier, data.MaKhachHang)
            .input('MaThuCung', sql.UniqueIdentifier, data.MaThuCung)
            .input('NgayGioHen', sql.DateTime, data.NgayGioHen)
            .input('MaChiNhanh', sql.UniqueIdentifier, data.MaChiNhanh)
            .query(`
                INSERT INTO LichHen (MaKhachHang, MaThuCung, NgayGioHen, MaChiNhanh, TrangThai, NgayTao)
                OUTPUT INSERTED.MaLichHen
                VALUES (@MaKhachHang, @MaThuCung, @NgayGioHen, @MaChiNhanh, N'Chờ xác nhận', GETDATE())
            `);
            
        const maLichHen = apptResult.recordset[0].MaLichHen;

        for (const maDichVu of data.DichVu) {
            const detailRequest = new sql.Request(transaction);
            // Get Service Price
            const priceResult = await detailRequest
                .input('MaDichVu', sql.UniqueIdentifier, maDichVu)
                .query('SELECT GiaNiemYet FROM DichVu WHERE MaDichVu = @MaDichVu');
            
            const gia = priceResult.recordset[0].GiaNiemYet;

            await detailRequest
                .input('MaLichHen', sql.UniqueIdentifier, maLichHen)
                .input('DonGiaDuKien', sql.Decimal, gia)
                .query(`
                    INSERT INTO ChiTietLichHen (MaLichHen, MaDichVu, DonGiaDuKien)
                    VALUES (@MaLichHen, @MaDichVu, @DonGiaDuKien)
                `);
        }

        await transaction.commit();
        return { success: true, maLichHen };
    } catch (error) {
        await transaction.rollback();
        console.error('[createAppointment] Error:', error.message, error);
        throw error;
    }
}

async function getHistory(customerId) {
    try {
        const pool = await poolPromise;
        const orders = await pool.request()
            .input('MaKhachHang', sql.UniqueIdentifier, customerId)
            .query(`
                SELECT 
                    'Order' as Type, 
                    DH.MaDonHang as ID, 
                    DH.NgayDat as Date, 
                    DH.TrangThai as Status, 
                    ISNULL(HD.TongTienThucTra, 0) as Total
                FROM DonHang DH
                LEFT JOIN HoaDon HD ON DH.MaHoaDon = HD.MaHoaDon
                WHERE DH.MaKhachHang = @MaKhachHang
                ORDER BY DH.NgayDat DESC
            `);
            
        const appointments = await pool.request()
            .input('MaKhachHang', sql.UniqueIdentifier, customerId)
            .query(`
                SELECT 
                    'Appointment' as Type, 
                    LH.MaLichHen as ID, 
                    LH.NgayGioHen as Date, 
                    LH.TrangThai as Status, 
                    ISNULL(HD.TongTienThucTra, 0) as Total
                FROM LichHen LH
                LEFT JOIN HoaDon HD ON LH.MaHoaDon = HD.MaHoaDon
                WHERE LH.MaKhachHang = @MaKhachHang
                ORDER BY LH.NgayGioHen DESC
            `);
            
        return [...orders.recordset, ...appointments.recordset].sort((a, b) => new Date(b.Date) - new Date(a.Date));
    } catch (error) {
        console.error('[getHistory] Error:', error.message, error);
        throw error;
    }
}

async function getBranches() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT MaChiNhanh, TenChiNhanh FROM ChiNhanh WHERE TrangThai = N\'Hoạt động\'');
        return result.recordset;
    } catch (error) {
        console.error('[getBranches] Error:', error.message, error);
        throw error;
    }
}

async function getCustomerPets(customerId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaKhachHang', sql.UniqueIdentifier, customerId)
            .query('SELECT * FROM ThuCung WHERE MaKhachHang = @MaKhachHang');
        return result.recordset;
    } catch (error) {
        console.error('[getCustomerPets] Error:', error.message, error);
        throw error;
    }
}

async function getSuitableProducts(petId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaThuCung', sql.UniqueIdentifier, petId)
            .execute('SP_TimSanPhamPhuHop');
        return result.recordset;
    } catch (error) {
        console.error('[getSuitableProducts] Error:', error.message, error);
        throw error;
    }
}

export default {
    findByPhoneNum,
    getProducts,
    getServices,
    search,
    registerPet,
    getPetTypes,
    createOrder,
    createAppointment,
    getHistory,
    getBranches,
    getCustomerPets,
    getSuitableProducts
};