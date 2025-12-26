import { poolPromise } from '../Config/db.js';
import sql from 'mssql';

async function findByPhoneNum(sdt) {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('sdt', sql.VarChar, sdt)
            .query(`
                SELECT TOP 1 
                    nv.*, 
                    cn.TenChiNhanh,
                    cn.DiaChi
                FROM NhanVien nv
                LEFT JOIN ChiNhanh cn ON nv.MaChiNhanh = cn.MaChiNhanh
                WHERE nv.SoDienThoai = @sdt
            `);
        
        
        return result.recordset[0] || null;
    } catch (error) {
        console.error('[findByPhoneNum] Error:', error.message, error);
        throw error;
    }
}

async function findCustomerId(name, phoneNum) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phoneNum', sql.VarChar, phoneNum)
            .query('SELECT MaKhachHang FROM KhachHang WHERE HoTen = @name AND SoDienThoai = @phoneNum');
        return result.recordset;
    } catch (error) {
        console.error('[findCustomerId] Error:', error.message, error);
        throw error;
    }
}
async function findCusPets(cusId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('cusId', sql.Int, cusId)
            .query('SELECT * FROM ThuCung WHERE MaKhachHang = @cusId');
        return result.recordset;
    } catch (error) {
        console.error('[findCusPets] Error:', error.message, error);
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

async function findOrCreateCustomer(name, phoneNum) {
    try {
        const pool = await poolPromise;
        // Tìm khách hàng
        let result = await pool.request()
            .input('phoneNum', sql.VarChar, phoneNum)
            .query('SELECT * FROM KhachHang WHERE SoDienThoai = @phoneNum');
        
        if (result.recordset.length > 0) {
            return result.recordset[0];
        }
        
        // Tạo khách hàng mới nếu không tìm thấy
        result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phoneNum', sql.VarChar, phoneNum)
            .query(`
                INSERT INTO KhachHang (HoTen, SoDienThoai)
                OUTPUT INSERTED.*
                VALUES (@name, @phoneNum)
            `);
        
        return result.recordset[0];
    } catch (error) {
        console.error('[findOrCreateCustomer] Error:', error.message, error);
        throw error;
    }
}

async function getAvailableDoctors(branchId, dateTime) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('branchId', sql.UniqueIdentifier, branchId)
            .input('dateTime', sql.DateTime, dateTime)
            .query(`
                SELECT NV.MaNhanVien, NV.HoTen, NV.SoDienThoai
                FROM NhanVien NV
                WHERE NV.MaChiNhanh = @branchId 
                AND NV.ChucVu = N'Bác sĩ thú y'
                AND NV.NgayNghiViec IS NULL
                AND NOT EXISTS (
                    SELECT 1 
                    FROM LichHen LH
                    JOIN ChiTietLichHen CTLH ON LH.MaLichHen = CTLH.MaLichHen
                    JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
                    WHERE CTLH.MaBacSi = NV.MaNhanVien
                    AND LH.TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận')
                    AND (
                        -- Check if new appointment time falls within existing appointment window
                        (@dateTime >= LH.NgayGioHen AND @dateTime < DATEADD(MINUTE, ISNULL(DV.ThoiGianThucHienDuKien, 60), LH.NgayGioHen))
                        OR
                        -- Check if existing appointment falls within new appointment window (assuming 60 min default)
                        (LH.NgayGioHen >= @dateTime AND LH.NgayGioHen < DATEADD(MINUTE, 60, @dateTime))
                    )
                )
            `);
        return result.recordset;
    } catch (error) {
        console.error('[getAvailableDoctors] Error:', error.message, error);
        throw error;
    }
}

async function getAvailableCareStaff(branchId, dateTime) {
    try {
        const pool = await poolPromise;
        
        // First, check total care staff in branch
        const totalResult = await pool.request()
            .input('branchId', sql.UniqueIdentifier, branchId)
            .query(`
                SELECT COUNT(*) as Total
                FROM NhanVien NV
                WHERE NV.MaChiNhanh = @branchId 
                AND NV.ChucVu = N'Nhân viên chăm sóc'
                AND NV.NgayNghiViec IS NULL
            `);
        
        console.log(`[getAvailableCareStaff] Total care staff in branch: ${totalResult.recordset[0].Total}`);
        console.log(`[getAvailableCareStaff] Checking availability for time: ${dateTime}`);
        
        const result = await pool.request()
            .input('branchId', sql.UniqueIdentifier, branchId)
            .input('dateTime', sql.DateTime, dateTime)
            .query(`
                SELECT NV.MaNhanVien, NV.HoTen, NV.SoDienThoai
                FROM NhanVien NV
                WHERE NV.MaChiNhanh = @branchId 
                AND NV.ChucVu = N'Nhân viên chăm sóc'
                AND NV.NgayNghiViec IS NULL
                AND NOT EXISTS (
                    SELECT 1 
                    FROM LichHen LH
                    JOIN ChiTietLichHen CTLH ON LH.MaLichHen = CTLH.MaLichHen
                    JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
                    WHERE CTLH.MaBacSi = NV.MaNhanVien
                    AND LH.TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận')
                    AND (
                        -- Check if new appointment time falls within existing appointment window
                        (@dateTime >= LH.NgayGioHen AND @dateTime < DATEADD(MINUTE, ISNULL(DV.ThoiGianThucHienDuKien, 60), LH.NgayGioHen))
                        OR
                        -- Check if existing appointment falls within new appointment window (assuming 60 min default)
                        (LH.NgayGioHen >= @dateTime AND LH.NgayGioHen < DATEADD(MINUTE, 60, @dateTime))
                    )
                )
            `);
        
        console.log(`[getAvailableCareStaff] Available care staff: ${result.recordset.length}`);
        return result.recordset;
    } catch (error) {
        console.error('[getAvailableCareStaff] Error:', error.message, error);
        throw error;
    }
}

async function createOrder(orderData) {
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        
        try {
            // Tạo hóa đơn
            const hoaDonResult = await new sql.Request(transaction)
                .input('maNhanVien', sql.UniqueIdentifier, orderData.maNhanVien)
                .input('maChiNhanh', sql.UniqueIdentifier, orderData.maChiNhanh)
                .input('maKhachHang', sql.UniqueIdentifier, orderData.maKhachHang)
                .query(`
                    INSERT INTO HoaDon (MaNhanVien, MaChiNhanh, MaKhachHang, TongPhu, TongTienThucTra)
                    OUTPUT INSERTED.MaHoaDon
                    VALUES (@maNhanVien, @maChiNhanh, @maKhachHang, 0, 0)
                `);
            
            const maHoaDon = hoaDonResult.recordset[0].MaHoaDon;
            
            // Tạo đơn hàng
            const donHangResult = await new sql.Request(transaction)
                .input('maKhachHang', sql.UniqueIdentifier, orderData.maKhachHang)
                .input('maChiNhanh', sql.UniqueIdentifier, orderData.maChiNhanh)
                .input('maNhanVienSale', sql.UniqueIdentifier, orderData.maNhanVien)
                .input('loaiDon', sql.NVarChar, 'Tại quầy')
                .input('trangThai', sql.NVarChar, 'Sẵn sàng để lấy')
                .input('maHoaDon', sql.UniqueIdentifier, maHoaDon)
                .query(`
                    INSERT INTO DonHang (MaKhachHang, MaChiNhanh, MaNhanVienSale, LoaiDon, TrangThai, MaHoaDon)
                    OUTPUT INSERTED.MaDonHang
                    VALUES (@maKhachHang, @maChiNhanh, @maNhanVienSale, @loaiDon, @trangThai, @maHoaDon)
                `);
            
            const maDonHang = donHangResult.recordset[0].MaDonHang;
            
            // Thêm chi tiết đơn hàng
            let tongPhu = 0;
            for (const item of orderData.items) {
                await new sql.Request(transaction)
                    .input('maDonHang', sql.UniqueIdentifier, maDonHang)
                    .input('maSanPham', sql.UniqueIdentifier, item.maSanPham)
                    .input('soLuong', sql.Int, item.soLuong)
                    .input('donGia', sql.Decimal(18, 0), item.donGia)
                    .query(`
                        INSERT INTO ChiTietDonHang (MaDonHang, MaSanPham, SoLuong, DonGiaBan)
                        VALUES (@maDonHang, @maSanPham, @soLuong, @donGia)
                    `);
                tongPhu += item.soLuong * item.donGia;
            }
            
            // Cập nhật tổng tiền hóa đơn
            await new sql.Request(transaction)
                .input('maHoaDon', sql.UniqueIdentifier, maHoaDon)
                .input('tongPhu', sql.Decimal(18, 0), tongPhu)
                .query(`
                    UPDATE HoaDon 
                    SET TongPhu = @tongPhu, TongTienThucTra = @tongPhu
                    WHERE MaHoaDon = @maHoaDon
                `);
            
            await transaction.commit();
            return { maDonHang, maHoaDon };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('[createOrder] Error:', error.message, error);
        throw error;
    }
}

async function createAppointment(appointmentData) {
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        
        try {
            // Tạo hóa đơn chung
            const hoaDonResult = await new sql.Request(transaction)
                .input('maNhanVien', sql.UniqueIdentifier, appointmentData.maNhanVien)
                .input('maChiNhanh', sql.UniqueIdentifier, appointmentData.maChiNhanh)
                .input('maKhachHang', sql.UniqueIdentifier, appointmentData.maKhachHang)
                .query(`
                    INSERT INTO HoaDon (MaNhanVien, MaChiNhanh, MaKhachHang, TongPhu, TongTienThucTra)
                    OUTPUT INSERTED.MaHoaDon
                    VALUES (@maNhanVien, @maChiNhanh, @maKhachHang, 0, 0)
                `);
            
            const maHoaDon = hoaDonResult.recordset[0].MaHoaDon;
            
            let tongPhu = 0;
            const maLichHenList = [];
            
            // Tạo lịch hẹn riêng cho mỗi dịch vụ
            for (const service of appointmentData.services) {
                // Tạo lịch hẹn
                const lichHenResult = await new sql.Request(transaction)
                    .input('maKhachHang', sql.UniqueIdentifier, appointmentData.maKhachHang)
                    .input('maThuCung', sql.UniqueIdentifier, appointmentData.maThuCung)
                    .input('maChiNhanh', sql.UniqueIdentifier, appointmentData.maChiNhanh)
                    .input('maNVTao', sql.UniqueIdentifier, appointmentData.maNhanVien)
                    .input('ngayGioHen', sql.DateTime, service.ngayGioHen)
                    .input('kenhDat', sql.NVarChar, 'Tại quầy')
                    .input('trangThai', sql.NVarChar, 'Đã xác nhận')
                    .input('maHoaDon', sql.UniqueIdentifier, maHoaDon)
                    .query(`
                        INSERT INTO LichHen (MaKhachHang, MaThuCung, MaChiNhanh, MaNVTao, NgayGioHen, KenhDat, TrangThai, MaHoaDon)
                        OUTPUT INSERTED.MaLichHen
                        VALUES (@maKhachHang, @maThuCung, @maChiNhanh, @maNVTao, @ngayGioHen, @kenhDat, @trangThai, @maHoaDon)
                    `);
                
                const maLichHen = lichHenResult.recordset[0].MaLichHen;
                maLichHenList.push(maLichHen);
                
                // Thêm chi tiết lịch hẹn
                await new sql.Request(transaction)
                    .input('maLichHen', sql.UniqueIdentifier, maLichHen)
                    .input('maDichVu', sql.UniqueIdentifier, service.maDichVu)
                    .input('maBacSi', sql.UniqueIdentifier, service.maBacSi)
                    .input('donGia', sql.Decimal(18, 0), service.donGia)
                    .query(`
                        INSERT INTO ChiTietLichHen (MaLichHen, MaDichVu, MaBacSi, DonGiaThucTe)
                        VALUES (@maLichHen, @maDichVu, @maBacSi, @donGia)
                    `);
                
                tongPhu += service.donGia;
            }
            
            // Cập nhật tổng tiền hóa đơn
            await new sql.Request(transaction)
                .input('maHoaDon', sql.UniqueIdentifier, maHoaDon)
                .input('tongPhu', sql.Decimal(18, 0), tongPhu)
                .query(`
                    UPDATE HoaDon 
                    SET TongPhu = @tongPhu, TongTienThucTra = @tongPhu
                    WHERE MaHoaDon = @maHoaDon
                `);
            
            await transaction.commit();
            return { maLichHenList, maHoaDon };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('[createAppointment] Error:', error.message, error);
        throw error;
    }
}

async function getPendingOrders(branchId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('branchId', sql.UniqueIdentifier, branchId)
            .query(`
                SELECT 
                    DH.MaDonHang, DH.NgayDat, DH.TrangThai, DH.LoaiDon,
                    KH.HoTen AS TenKhachHang, KH.SoDienThoai,
                    HD.TongTienThucTra
                FROM DonHang DH
                JOIN KhachHang KH ON DH.MaKhachHang = KH.MaKhachHang
                LEFT JOIN HoaDon HD ON DH.MaHoaDon = HD.MaHoaDon
                WHERE DH.MaChiNhanh = @branchId
                AND DH.TrangThai = N'Chờ xử lý'
                ORDER BY DH.NgayDat DESC
            `);
        return result.recordset;
    } catch (error) {
        console.error('[getPendingOrders] Error:', error.message, error);
        throw error;
    }
}

async function getPendingAppointments(branchId, page = 1, limit = 10) {
    try {
        const pool = await poolPromise;
        const offset = (page - 1) * limit;
        
        // Get total count
        const countResult = await pool.request()
            .input('branchId', sql.UniqueIdentifier, branchId)
            .query(`
                SELECT COUNT(*) as total
                FROM LichHen LH
                WHERE LH.MaChiNhanh = @branchId
                AND LH.TrangThai = N'Chờ xác nhận'
            `);
        
        const total = countResult.recordset[0].total;
        
        // Get paginated data
        const result = await pool.request()
            .input('branchId', sql.UniqueIdentifier, branchId)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT 
                    LH.MaLichHen, LH.NgayGioHen, LH.TrangThai, LH.KenhDat,
                    KH.HoTen AS TenKhachHang, KH.SoDienThoai,
                    TC.TenThuCung,
                    HD.TongTienThucTra
                FROM LichHen LH
                JOIN KhachHang KH ON LH.MaKhachHang = KH.MaKhachHang
                LEFT JOIN ThuCung TC ON LH.MaThuCung = TC.MaThuCung
                LEFT JOIN HoaDon HD ON LH.MaHoaDon = HD.MaHoaDon
                WHERE LH.MaChiNhanh = @branchId
                AND LH.TrangThai = N'Chờ xác nhận'
                ORDER BY LH.NgayGioHen DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);
        
        return {
            appointments: result.recordset,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('[getPendingAppointments] Error:', error.message, error);
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
                    SP.TenSanPham, SP.MoTa,
                    CTDH.SoLuong, CTDH.DonGiaBan, CTDH.ThanhTien
                FROM ChiTietDonHang CTDH
                JOIN SanPham SP ON CTDH.MaSanPham = SP.MaSanPham
                WHERE CTDH.MaDonHang = @orderId
            `);
        return result.recordset;
    } catch (error) {
        console.error('[getOrderDetails] Error:', error.message, error);
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
                    DV.TenDichVu, DV.MoTa, DV.ThoiGianThucHienDuKien,
                    CTLH.DonGiaThucTe,
                    NV.HoTen AS TenBacSi
                FROM ChiTietLichHen CTLH
                JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
                LEFT JOIN NhanVien NV ON CTLH.MaBacSi = NV.MaNhanVien
                WHERE CTLH.MaLichHen = @appointmentId
            `);
        return result.recordset;
    } catch (error) {
        console.error('[getAppointmentDetails] Error:', error.message, error);
        throw error;
    }
}

async function getCustomerPets(customerId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('customerId', sql.UniqueIdentifier, customerId)
            .query('SELECT * FROM ThuCung WHERE MaKhachHang = @customerId');
        return result.recordset;
    } catch (error) {
        console.error('[getCustomerPets] Error:', error.message, error);
        throw error;
    }
}

async function confirmOrder(orderId, staffId) {
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        
        try {
            // Lấy thông tin đơn hàng
            const orderResult = await new sql.Request(transaction)
                .input('orderId', sql.UniqueIdentifier, orderId)
                .query('SELECT * FROM DonHang WHERE MaDonHang = @orderId');
            
            const order = orderResult.recordset[0];
            if (!order) throw new Error('Đơn hàng không tồn tại');
            
            // Nếu chưa có hóa đơn, tạo mới
            let maHoaDon = order.MaHoaDon;
            if (!maHoaDon) {
                // Lấy chi tiết đơn hàng để tính tổng
                const detailsResult = await new sql.Request(transaction)
                    .input('orderId', sql.UniqueIdentifier, orderId)
                    .query('SELECT * FROM ChiTietDonHang WHERE MaDonHang = @orderId');
                
                let tongPhu = 0;
                detailsResult.recordset.forEach(item => {
                    tongPhu += item.SoLuong * item.DonGiaBan;
                });
                
                // Tạo hóa đơn
                const hoaDonResult = await new sql.Request(transaction)
                    .input('maNhanVien', sql.UniqueIdentifier, staffId)
                    .input('maChiNhanh', sql.UniqueIdentifier, order.MaChiNhanh)
                    .input('maKhachHang', sql.UniqueIdentifier, order.MaKhachHang)
                    .input('tongPhu', sql.Decimal(18, 0), tongPhu)
                    .query(`
                        INSERT INTO HoaDon (MaNhanVien, MaChiNhanh, MaKhachHang, TongPhu, TongTienThucTra)
                        OUTPUT INSERTED.MaHoaDon
                        VALUES (@maNhanVien, @maChiNhanh, @maKhachHang, @tongPhu, @tongPhu)
                    `);
                
                maHoaDon = hoaDonResult.recordset[0].MaHoaDon;
            }
            
            // Cập nhật trạng thái đơn hàng
            await new sql.Request(transaction)
                .input('orderId', sql.UniqueIdentifier, orderId)
                .input('maHoaDon', sql.UniqueIdentifier, maHoaDon)
                .input('trangThai', sql.NVarChar, 'Sẵn sàng để lấy')
                .query(`
                    UPDATE DonHang 
                    SET TrangThai = @trangThai, MaHoaDon = @maHoaDon
                    WHERE MaDonHang = @orderId
                `);
            
            await transaction.commit();
            return { success: true, maHoaDon };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('[confirmOrder] Error:', error.message, error);
        throw error;
    }
}

async function confirmAppointment(appointmentId, staffId) {
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        
        try {
            // Lấy thông tin lịch hẹn
            const appointmentResult = await new sql.Request(transaction)
                .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                .query('SELECT * FROM LichHen WHERE MaLichHen = @appointmentId');
            
            const appointment = appointmentResult.recordset[0];
            if (!appointment) throw new Error('Lịch hẹn không tồn tại');
            
            // Nếu chưa có hóa đơn, tạo mới
            let maHoaDon = appointment.MaHoaDon;
            if (!maHoaDon) {
                // Lấy chi tiết lịch hẹn để tính tổng
                const detailsResult = await new sql.Request(transaction)
                    .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                    .query('SELECT * FROM ChiTietLichHen WHERE MaLichHen = @appointmentId');
                
                let tongPhu = 0;
                detailsResult.recordset.forEach(item => {
                    tongPhu += item.DonGiaThucTe;
                });
                
                // Tạo hóa đơn
                const hoaDonResult = await new sql.Request(transaction)
                    .input('maNhanVien', sql.UniqueIdentifier, staffId)
                    .input('maChiNhanh', sql.UniqueIdentifier, appointment.MaChiNhanh)
                    .input('maKhachHang', sql.UniqueIdentifier, appointment.MaKhachHang)
                    .input('tongPhu', sql.Decimal(18, 0), tongPhu)
                    .query(`
                        INSERT INTO HoaDon (MaNhanVien, MaChiNhanh, MaKhachHang, TongPhu, TongTienThucTra)
                        OUTPUT INSERTED.MaHoaDon
                        VALUES (@maNhanVien, @maChiNhanh, @maKhachHang, @tongPhu, @tongPhu)
                    `);
                
                maHoaDon = hoaDonResult.recordset[0].MaHoaDon;
            }
            
            // Cập nhật trạng thái lịch hẹn
            await new sql.Request(transaction)
                .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                .input('maHoaDon', sql.UniqueIdentifier, maHoaDon)
                .input('trangThai', sql.NVarChar, 'Đã xác nhận')
                .query(`
                    UPDATE LichHen 
                    SET TrangThai = @trangThai, MaHoaDon = @maHoaDon
                    WHERE MaLichHen = @appointmentId
                `);
            
            await transaction.commit();
            return { success: true, maHoaDon };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('[confirmAppointment] Error:', error.message, error);
        throw error;
    }
}

async function getCareStaffAppointments(staffId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('staffId', sql.UniqueIdentifier, staffId)
            .query(`
                SELECT 
                    LH.MaLichHen,
                    LH.NgayGioHen,
                    LH.TrangThai,
                    LH.GhiChu,
                    KH.HoTen AS TenKhachHang,
                    KH.SoDienThoai AS SoDienThoaiKH,
                    TC.TenThuCung,
                    TC.Giong,
                    DV.TenDichVu,
                    CTLH.KetQua,
                    CTLH.ThoiGianThucHien
                FROM LichHen LH
                JOIN ChiTietLichHen CTLH ON LH.MaLichHen = CTLH.MaLichHen
                JOIN KhachHang KH ON LH.MaKhachHang = KH.MaKhachHang
                JOIN ThuCung TC ON LH.MaThuCung = TC.MaThuCung
                JOIN DichVu DV ON CTLH.MaDichVu = DV.MaDichVu
                WHERE CTLH.MaBacSi = @staffId
                AND LH.TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận', N'Đang thực hiện')
                AND LH.NgayGioHen >= GETDATE()
                ORDER BY LH.NgayGioHen ASC
            `);
        return result.recordset;
    } catch (error) {
        console.error('[getCareStaffAppointments] Error:', error.message, error);
        throw error;
    }
}

export default {
    findByPhoneNum,
    findCustomerId,
    findCusPets,
    getServices,
    getProducts,
    findOrCreateCustomer,
    getAvailableDoctors,
    getAvailableCareStaff,
    createOrder,
    createAppointment,
    getPendingOrders,
    getPendingAppointments,
    getOrderDetails,
    getAppointmentDetails,
    getCustomerPets,
    confirmOrder,
    confirmAppointment,
    getCareStaffAppointments,
};