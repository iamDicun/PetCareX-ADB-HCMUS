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
        
        // Create Order without invoice (will be created when staff confirms)
        const request = new sql.Request(transaction);
        const orderResult = await request
            .input('MaKhachHang', sql.UniqueIdentifier, data.MaKhachHang)
            .input('MaChiNhanh', sql.UniqueIdentifier, data.MaChiNhanh)
            .input('LoaiDon', sql.NVarChar, 'Online')
            .query(`
                INSERT INTO DonHang (MaKhachHang, MaChiNhanh, LoaiDon, TrangThai, NgayDat)
                OUTPUT INSERTED.MaDonHang
                VALUES (@MaKhachHang, @MaChiNhanh, @LoaiDon, N'Chờ xử lý', GETDATE())
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

            await detailRequest
                .input('MaDonHang', sql.UniqueIdentifier, maDonHang)
                .input('SoLuong', sql.Int, item.SoLuong)
                .input('DonGiaBan', sql.Decimal, giaBan)
                .query(`
                    INSERT INTO ChiTietDonHang (MaDonHang, MaSanPham, SoLuong, DonGiaBan)
                    VALUES (@MaDonHang, @MaSanPham, @SoLuong, @DonGiaBan)
                `);
        }

        await transaction.commit();
        return { success: true, maDonHang };
    } catch (error) {
        await transaction.rollback();
        console.error('[createOrder] Error:', error.message, error);
        throw error;
    }
}

async function createAppointment(data) {
    // data: { MaKhachHang, MaThuCung, NgayGioHen, MaChiNhanh, DichVu: [{ MaDichVu, MaBacSi? }] }
    console.log('[createAppointment] Starting appointment creation:', JSON.stringify(data, null, 2));
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();
        console.log('[createAppointment] Transaction started');
        
        // Create appointment without invoice (will be created when staff confirms)
        const appointmentDate = new Date(data.NgayGioHen);
        console.log('[createAppointment] Parsed appointment date:', appointmentDate);
        
        const request = new sql.Request(transaction);
        const apptResult = await request
            .input('MaKhachHang', sql.UniqueIdentifier, data.MaKhachHang)
            .input('MaThuCung', sql.UniqueIdentifier, data.MaThuCung)
            .input('NgayGioHen', sql.DateTime, appointmentDate)
            .input('MaChiNhanh', sql.UniqueIdentifier, data.MaChiNhanh)
            .query(`
                INSERT INTO LichHen (MaKhachHang, MaThuCung, NgayGioHen, MaChiNhanh, TrangThai, KenhDat)
                OUTPUT INSERTED.MaLichHen
                VALUES (@MaKhachHang, @MaThuCung, @NgayGioHen, @MaChiNhanh, N'Chờ xác nhận', N'Online')
            `);
            
        const maLichHen = apptResult.recordset[0].MaLichHen;
        console.log('[createAppointment] LichHen created:', maLichHen);

        // Get available vets at branch if needed for random assignment
        const vetsRequest = new sql.Request(transaction);
        const availableVets = await vetsRequest
            .input('MaChiNhanh', sql.UniqueIdentifier, data.MaChiNhanh)
            .query(`
                SELECT MaNhanVien 
                FROM NhanVien 
                WHERE MaChiNhanh = @MaChiNhanh 
                AND ChucVu = N'Bác sĩ thú y' 
                AND (NgayNghiViec IS NULL OR NgayNghiViec > GETDATE())
            `);
        
        console.log(`[createAppointment] Found ${availableVets.recordset.length} available vets at branch`);

        for (const dichVu of data.DichVu) {
            const detailRequest = new sql.Request(transaction);
            
            // Get Service Price
            const priceResult = await detailRequest
                .input('MaDichVu', sql.UniqueIdentifier, dichVu.MaDichVu)
                .query('SELECT GiaNiemYet FROM DichVu WHERE MaDichVu = @MaDichVu');
            
            const gia = priceResult.recordset[0].GiaNiemYet;

            // Assign vet: use provided MaBacSi or random from available vets
            let maBacSi = dichVu.MaBacSi;
            
            // Handle empty string or null/undefined - treat them all as "no vet selected"
            if (!maBacSi || maBacSi === '' || maBacSi === 'null' || maBacSi === 'undefined') {
                if (availableVets.recordset.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableVets.recordset.length);
                    maBacSi = availableVets.recordset[randomIndex].MaNhanVien;
                    console.log(`[createAppointment] Random vet assigned for service ${dichVu.MaDichVu}:`, maBacSi);
                } else {
                    maBacSi = null;
                    console.log(`[createAppointment] No vet available for service ${dichVu.MaDichVu}`);
                }
            } else {
                console.log(`[createAppointment] Vet selected by user for service ${dichVu.MaDichVu}:`, maBacSi);
            }

            console.log(`[createAppointment] Inserting ChiTietLichHen - Service: ${dichVu.MaDichVu}, Vet: ${maBacSi}, Price: ${gia}`);
            await detailRequest
                .input('MaLichHen', sql.UniqueIdentifier, maLichHen)
                .input('MaBacSi', maBacSi ? sql.UniqueIdentifier : sql.VarChar, maBacSi)
                .input('DonGiaThucTe', sql.Decimal, gia)
                .query(`
                    INSERT INTO ChiTietLichHen (MaLichHen, MaDichVu, MaBacSi, DonGiaThucTe)
                    VALUES (@MaLichHen, @MaDichVu, @MaBacSi, @DonGiaThucTe)
                `);
        }

        console.log(`[createAppointment] All services inserted successfully. Committing transaction...`);
        await transaction.commit();
        console.log('[createAppointment] Appointment created successfully:', maLichHen);
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
        const result = await pool.request().query('SELECT MaChiNhanh, TenChiNhanh, DiaChi FROM ChiNhanh WHERE TrangThai = N\'Hoạt động\'');
        return result.recordset;
    } catch (error) {
        console.error('[getBranches] Error:', error.message, error);
        throw error;
    }
}

async function getAvailableVets(branchId, appointmentTime) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaChiNhanh', sql.UniqueIdentifier, branchId)
            .input('NgayGioHen', sql.DateTime, appointmentTime)
            .query(`
                SELECT 
                    NV.MaNhanVien,
                    NV.HoTen
                FROM NhanVien NV
                WHERE NV.MaChiNhanh = @MaChiNhanh
                AND NV.ChucVu = N'Bác sĩ thú y'
                AND (NV.NgayNghiViec IS NULL OR NV.NgayNghiViec > GETDATE())
                AND NV.MaNhanVien NOT IN (
                    SELECT DISTINCT CTL.MaBacSi
                    FROM ChiTietLichHen CTL
                    INNER JOIN LichHen LH ON CTL.MaLichHen = LH.MaLichHen
                    WHERE LH.MaChiNhanh = @MaChiNhanh
                    AND LH.TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận')
                    AND ABS(DATEDIFF(MINUTE, LH.NgayGioHen, @NgayGioHen)) < 120
                    AND CTL.MaBacSi IS NOT NULL
                )
            `);
        return result.recordset;
    } catch (error) {
        console.error('[getAvailableVets] Error:', error.message, error);
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

async function getUpcomingVaccinations(petId = null, dateLimit = null) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaThuCung', sql.UniqueIdentifier, petId)
            .input('NgayGioiHan', sql.Date, dateLimit)
            .execute('SP_DanhSachTiemDinhKy');
        return result.recordset;
    } catch (error) {
        console.error('[getUpcomingVaccinations] Error:', error.message, error);
        throw error;
    }
}

async function getPetMedicalHistory(petId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaThuCung', sql.UniqueIdentifier, petId)
            .execute('SP_TraCuuLichSuKham');
        return result.recordset;
    } catch (error) {
        console.error('[getPetMedicalHistory] Error:', error.message, error);
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

async function getConfirmedInvoices(customerId) {
    try {
        const pool = await poolPromise;
        
        // Lấy hóa đơn từ đơn hàng có trạng thái "Sẵn sàng để lấy" hoặc "Đã xác nhận"
        const orderInvoices = await pool.request()
            .input('MaKhachHang', sql.UniqueIdentifier, customerId)
            .query(`
                SELECT DISTINCT
                    HD.MaHoaDon,
                    HD.NgayTao,
                    DH.NgayDat as NgayGiaoDich,
                    HD.TongPhu,
                    HD.TongTienGiam,
                    HD.DiemLoyaltySuDung,
                    HD.TienGiamTuDiem,
                    HD.TongTienThucTra,
                    DH.MaDonHang as MaGiaoDich,
                    DH.TrangThai,
                    N'Đơn hàng' as LoaiGiaoDich,
                    CN.TenChiNhanh,
                    NV.HoTen as NhanVienXuLy,
                    CASE WHEN DG.MaDanhGia IS NOT NULL THEN 1 ELSE 0 END as DaDanhGia
                FROM DonHang DH
                LEFT JOIN HoaDon HD ON DH.MaHoaDon = HD.MaHoaDon
                LEFT JOIN ChiNhanh CN ON DH.MaChiNhanh = CN.MaChiNhanh
                LEFT JOIN NhanVien NV ON DH.MaNhanVienSale = NV.MaNhanVien
                LEFT JOIN DanhGia DG ON HD.MaHoaDon = DG.MaHoaDon
                WHERE DH.MaKhachHang = @MaKhachHang
                AND DH.TrangThai = N'Hoàn tất'
                AND HD.MaHoaDon IS NOT NULL
            `);
        
        // Lấy hóa đơn từ lịch hẹn có trạng thái "Đã xác nhận"
        const appointmentInvoices = await pool.request()
            .input('MaKhachHang', sql.UniqueIdentifier, customerId)
            .query(`
                SELECT DISTINCT
                    HD.MaHoaDon,
                    HD.NgayTao,
                    LH.NgayGioHen as NgayGiaoDich,
                    HD.TongPhu,
                    HD.TongTienGiam,
                    HD.DiemLoyaltySuDung,
                    HD.TienGiamTuDiem,
                    HD.TongTienThucTra,
                    LH.MaLichHen as MaGiaoDich,
                    LH.TrangThai,
                    N'Lịch hẹn' as LoaiGiaoDich,
                    CN.TenChiNhanh,
                    NV.HoTen as NhanVienXuLy,
                    CASE WHEN DG.MaDanhGia IS NOT NULL THEN 1 ELSE 0 END as DaDanhGia
                FROM LichHen LH
                LEFT JOIN HoaDon HD ON LH.MaHoaDon = HD.MaHoaDon
                LEFT JOIN ChiNhanh CN ON LH.MaChiNhanh = CN.MaChiNhanh
                LEFT JOIN NhanVien NV ON LH.MaNVTao = NV.MaNhanVien
                LEFT JOIN DanhGia DG ON HD.MaHoaDon = DG.MaHoaDon
                WHERE LH.MaKhachHang = @MaKhachHang
                AND LH.TrangThai = N'Hoàn tất'
                AND HD.MaHoaDon IS NOT NULL
            `);
        
        // Gộp kết quả và sắp xếp theo ngày giao dịch
        const allInvoices = [...orderInvoices.recordset, ...appointmentInvoices.recordset]
            .sort((a, b) => new Date(b.NgayGiaoDich) - new Date(a.NgayGiaoDich));
        
        return allInvoices;
    } catch (error) {
        console.error('[getConfirmedInvoices] Error:', error.message, error);
        throw error;
    }
}

async function getAppointmentDetails(appointmentId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('appointmentId', sql.UniqueIdentifier, appointmentId)
            .query(`
                SELECT 
                    lh.MaLichHen,
                    lh.NgayGioHen,
                    lh.TrangThai,
                    cn.TenChiNhanh,
                    cn.DiaChi AS DiaChiChiNhanh,
                    tc.TenThuCung,
                    ltc.TenLoai AS LoaiThuCung,
                    tc.Giong,
                    tc.CanNang,
                    STRING_AGG(dv.TenDichVu, ', ') AS DichVu,
                    STRING_AGG(nv.HoTen, ', ') AS BacSi,
                    hsk.TrieuChung,
                    hsk.ChuanDoan,
                    hsk.NgayTaiKham,
                    CASE 
                        WHEN STRING_AGG(ctlh.KetQua, '') IS NULL THEN N'Trống'
                        ELSE STRING_AGG(ISNULL(ctlh.KetQua, ''), ' | ')
                    END AS KetQua
                FROM LichHen lh
                JOIN ChiNhanh cn ON cn.MaChiNhanh = lh.MaChiNhanh
                JOIN ThuCung tc ON tc.MaThuCung = lh.MaThuCung
                JOIN LoaiThuCung ltc ON ltc.MaLoaiTC = tc.MaLoaiTC
                JOIN ChiTietLichHen ctlh ON ctlh.MaLichHen = lh.MaLichHen
                JOIN DichVu dv ON dv.MaDichVu = ctlh.MaDichVu
                LEFT JOIN NhanVien nv ON nv.MaNhanVien = ctlh.MaBacSi
                LEFT JOIN HoSoKham hsk ON hsk.MaLichHen = lh.MaLichHen
                WHERE lh.MaLichHen = @appointmentId
                GROUP BY 
                    lh.MaLichHen, lh.NgayGioHen, lh.TrangThai,
                    cn.TenChiNhanh, cn.DiaChi,
                    tc.TenThuCung, ltc.TenLoai, tc.Giong, tc.CanNang,
                    hsk.TrieuChung, hsk.ChuanDoan, hsk.NgayTaiKham
            `);
        return result.recordset[0];
    } catch (error) {
        console.error('[getAppointmentDetails] Error:', error.message, error);
        throw error;
    }
}

async function getOrderDetails(orderId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('orderId', sql.UniqueIdentifier, orderId)
            .query(`
                SELECT 
                    dh.MaDonHang,
                    dh.NgayDat,
                    dh.TrangThai,
                    dh.LoaiDon,
                    cn.TenChiNhanh,
                    cn.DiaChi AS DiaChiChiNhanh,
                    ctdh.MaSanPham,
                    sp.TenSanPham,
                    ctdh.SoLuong,
                    ctdh.DonGiaBan,
                    (ctdh.SoLuong * ctdh.DonGiaBan) AS ThanhTien
                FROM DonHang dh
                JOIN ChiNhanh cn ON cn.MaChiNhanh = dh.MaChiNhanh
                JOIN ChiTietDonHang ctdh ON ctdh.MaDonHang = dh.MaDonHang
                JOIN SanPham sp ON sp.MaSanPham = ctdh.MaSanPham
                WHERE dh.MaDonHang = @orderId
            `);
        return result.recordset;
    } catch (error) {
        console.error('[getOrderDetails] Error:', error.message, error);
        throw error;
    }
}

async function submitRating(ratingData) {
    try {
        const pool = await poolPromise;
        
        // Check if already rated
        const checkResult = await pool.request()
            .input('MaHoaDon', sql.UniqueIdentifier, ratingData.maHoaDon)
            .query('SELECT MaDanhGia FROM DanhGia WHERE MaHoaDon = @MaHoaDon');
        
        if (checkResult.recordset.length > 0) {
            throw new Error('Hóa đơn này đã được đánh giá');
        }
        
        // Get branch from invoice
        const invoiceResult = await pool.request()
            .input('MaHoaDon', sql.UniqueIdentifier, ratingData.maHoaDon)
            .query('SELECT MaChiNhanh FROM HoaDon WHERE MaHoaDon = @MaHoaDon');
        
        if (invoiceResult.recordset.length === 0) {
            throw new Error('Không tìm thấy hóa đơn');
        }
        
        const maChiNhanh = invoiceResult.recordset[0].MaChiNhanh;
        
        // Insert rating
        await pool.request()
            .input('MaHoaDon', sql.UniqueIdentifier, ratingData.maHoaDon)
            .input('MaChiNhanh', sql.UniqueIdentifier, maChiNhanh)
            .input('DiemChatLuong', sql.Int, ratingData.diemChatLuong)
            .input('DiemThaiDo', sql.Int, ratingData.diemThaiDo)
            .input('BinhLuan', sql.NVarChar, ratingData.binhLuan || null)
            .query(`
                INSERT INTO DanhGia (MaHoaDon, MaChiNhanh, DiemChatLuong, DiemThaiDo, BinhLuan)
                VALUES (@MaHoaDon, @MaChiNhanh, @DiemChatLuong, @DiemThaiDo, @BinhLuan)
            `);
        
        return true;
    } catch (error) {
        console.error('[submitRating] Error:', error.message, error);
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
    getAvailableVets,
    getCustomerPets,
    getSuitableProducts,
    getConfirmedInvoices,
    getUpcomingVaccinations,
    getPetMedicalHistory,
    getAppointmentDetails,
    getOrderDetails,
    submitRating
};