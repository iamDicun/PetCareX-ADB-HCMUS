import { poolPromise } from '../Config/db.js';
import sql from 'mssql';

const vetService = {
    // Get all appointments for a specific vet
    async getVetAppointments(vetId, page = 1, limit = 10) {
        try {
            const pool = await poolPromise;
            const offset = (page - 1) * limit;

            // Get total count
            const countResult = await pool.request()
                .input('vetId', sql.UniqueIdentifier, vetId)
                .query(`
                    SELECT COUNT(DISTINCT lh.MaLichHen) AS Total
                    FROM LichHen lh
                    JOIN ChiTietLichHen ctlh ON ctlh.MaLichHen = lh.MaLichHen
                    WHERE ctlh.MaBacSi = @vetId
                `);
            
            const total = countResult.recordset[0].Total;

            // Get paginated results
            const result = await pool.request()
                .input('vetId', sql.UniqueIdentifier, vetId)
                .query(`
                    SELECT 
                        lh.MaLichHen,
                        lh.NgayGioHen,
                        lh.TrangThai,
                        kh.HoTen AS TenKhachHang,
                        kh.SoDienThoai,
                        tc.TenThuCung,
                        ltc.TenLoai AS LoaiThuCung,
                        tc.Giong,
                        tc.CanNang,
                        STRING_AGG(dv.TenDichVu, ', ') AS DichVu,
                        CASE 
                            WHEN STRING_AGG(ctlh.KetQua, '') IS NULL THEN N'Trống'
                            ELSE STRING_AGG(ISNULL(ctlh.KetQua, ''), ' | ')
                        END AS KetQua
                    FROM LichHen lh
                    JOIN KhachHang kh ON kh.MaKhachHang = lh.MaKhachHang
                    JOIN ThuCung tc ON tc.MaThuCung = lh.MaThuCung
                    JOIN LoaiThuCung ltc ON ltc.MaLoaiTC = tc.MaLoaiTC
                    JOIN ChiTietLichHen ctlh ON ctlh.MaLichHen = lh.MaLichHen
                    JOIN DichVu dv ON dv.MaDichVu = ctlh.MaDichVu
                    WHERE ctlh.MaBacSi = @vetId
                    GROUP BY 
                        lh.MaLichHen, lh.NgayGioHen, lh.TrangThai,
                        kh.HoTen, kh.SoDienThoai,
                        tc.TenThuCung, ltc.TenLoai, tc.Giong, tc.CanNang
                    ORDER BY lh.NgayGioHen DESC
                    OFFSET ${offset} ROWS
                    FETCH NEXT ${limit} ROWS ONLY
                `);
            
            return {
                appointments: result.recordset,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('[getVetAppointments] Error:', error.message, error);
            throw error;
        }
    },

    // Get detailed information of an appointment
    async getAppointmentDetails(appointmentId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                .query(`
                    SELECT 
                        lh.MaLichHen,
                        lh.NgayGioHen,
                        lh.TrangThai,
                        kh.HoTen AS TenKhachHang,
                        kh.SoDienThoai,
                        kh.Email,
                        tc.MaThuCung,
                        tc.TenThuCung,
                        ltc.TenLoai AS LoaiThuCung,
                        tc.Giong,
                        tc.CanNang,
                        tc.GioiTinh,
                        tc.NgaySinh,
                        ctlh.MaDichVu,
                        dv.TenDichVu,
                        dv.LoaiDichVu,
                        ctlh.DonGiaThucTe,
                        nv.HoTen AS TenBacSi
                    FROM LichHen lh
                    JOIN KhachHang kh ON kh.MaKhachHang = lh.MaKhachHang
                    JOIN ThuCung tc ON tc.MaThuCung = lh.MaThuCung
                    JOIN LoaiThuCung ltc ON ltc.MaLoaiTC = tc.MaLoaiTC
                    JOIN ChiTietLichHen ctlh ON ctlh.MaLichHen = lh.MaLichHen
                    JOIN DichVu dv ON dv.MaDichVu = ctlh.MaDichVu
                    JOIN NhanVien nv ON nv.MaNhanVien = ctlh.MaBacSi
                    WHERE lh.MaLichHen = @appointmentId
                `);
            return result.recordset;
        } catch (error) {
            console.error('[getAppointmentDetails] Error:', error.message, error);
            throw error;
        }
    },

    // Create a new medical record
    async createMedicalRecord(data) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('appointmentId', sql.UniqueIdentifier, data.appointmentId)
                .input('symptoms', sql.NVarChar(sql.MAX), data.symptoms)
                .input('diagnosis', sql.NVarChar(sql.MAX), data.diagnosis)
                .input('weight', sql.Float, data.weight)
                .input('reExamDate', sql.Date, data.reExamDate ? data.reExamDate : null)
                .query(`
                    DECLARE @InsertedId TABLE (MaHoSo UNIQUEIDENTIFIER);
                    
                    INSERT INTO HoSoKham (MaLichHen, TrieuChung, ChuanDoan, CanNang, NgayTaiKham)
                    OUTPUT INSERTED.MaHoSo INTO @InsertedId
                    VALUES (@appointmentId, @symptoms, @diagnosis, @weight, @reExamDate);
                    
                    SELECT * FROM HoSoKham 
                    WHERE MaHoSo = (SELECT MaHoSo FROM @InsertedId);
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('[createMedicalRecord] Error:', error.message, error);
            console.error('[createMedicalRecord] Error details:', error);
            throw error;
        }
    },

    // Get medical record by appointment ID
    async getMedicalRecord(appointmentId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                .query(`
                    SELECT * FROM HoSoKham
                    WHERE MaLichHen = @appointmentId
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('[getMedicalRecord] Error:', error.message, error);
            throw error;
        }
    },

    // Update medical record
    async updateMedicalRecord(medicalRecordId, data) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('medicalRecordId', sql.UniqueIdentifier, medicalRecordId)
                .input('symptoms', sql.NVarChar(sql.MAX), data.symptoms)
                .input('diagnosis', sql.NVarChar(sql.MAX), data.diagnosis)
                .input('weight', sql.Float, data.weight)
                .input('reExamDate', sql.Date, data.reExamDate || null)
                .query(`
                    UPDATE HoSoKham
                    SET TrieuChung = @symptoms,
                        ChuanDoan = @diagnosis,
                        CanNang = @weight,
                        NgayTaiKham = @reExamDate
                    OUTPUT INSERTED.*
                    WHERE MaHoSo = @medicalRecordId
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('[updateMedicalRecord] Error:', error.message, error);
            throw error;
        }
    },

    // Create prescription for a medical record
    async createPrescription(medicalRecordId, medications) {
        try {
            const pool = await poolPromise;
            
            // Insert all medications in prescription
            for (const med of medications) {
                await pool.request()
                    .input('medicalRecordId', sql.UniqueIdentifier, medicalRecordId)
                    .input('productId', sql.UniqueIdentifier, med.productId)
                    .input('quantity', sql.Int, med.quantity)
                    .input('usage', sql.NVarChar(255), med.usage)
                    .query(`
                        INSERT INTO ToaThuoc (MaHoSo, MaSanPham, SoLuong, CachDung)
                        VALUES (@medicalRecordId, @productId, @quantity, @usage)
                    `);
            }

            // Return the created prescription
            return await this.getPrescription(medicalRecordId);
        } catch (error) {
            console.error('[createPrescription] Error:', error.message, error);
            throw error;
        }
    },

    // Get prescription by medical record ID
    async getPrescription(medicalRecordId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('medicalRecordId', sql.UniqueIdentifier, medicalRecordId)
                .query(`
                    SELECT 
                        tt.MaHoSo,
                        tt.MaSanPham,
                        tt.SoLuong,
                        tt.CachDung,
                        sp.TenSanPham,
                        sp.GiaBan,
                        sp.MoTa
                    FROM ToaThuoc tt
                    JOIN SanPham sp ON sp.MaSanPham = tt.MaSanPham
                    WHERE tt.MaHoSo = @medicalRecordId
                `);
            return result.recordset;
        } catch (error) {
            console.error('[getPrescription] Error:', error.message, error);
            throw error;
        }
    },

    // Delete prescription by medical record ID (for updating)
    async deletePrescription(medicalRecordId) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('medicalRecordId', sql.UniqueIdentifier, medicalRecordId)
                .query(`
                    DELETE FROM ToaThuoc
                    WHERE MaHoSo = @medicalRecordId
                `);
            return { success: true };
        } catch (error) {
            console.error('[deletePrescription] Error:', error.message, error);
            throw error;
        }
    },

    // Get available medications (products that are medicines)
    async getAvailableMedications() {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT 
                        sp.MaSanPham,
                        sp.TenSanPham,
                        sp.MoTa,
                        sp.GiaBan
                    FROM SanPham sp
                    WHERE sp.MaLoai = 'MED' AND sp.TrangThai = 1
                    ORDER BY sp.TenSanPham
                `);
            return result.recordset;
        } catch (error) {
            console.error('[getAvailableMedications] Error:', error.message, error);
            throw error;
        }
    },

    // Create new appointment
    async createAppointment(data) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        try {
            await transaction.begin();
            
            // Create invoice first
            const invoiceResult = await new sql.Request(transaction)
                .input('customerId', sql.UniqueIdentifier, data.customerId)
                .input('branchId', sql.UniqueIdentifier, data.branchId)
                .input('vetId', sql.UniqueIdentifier, data.vetId)
                .query(`
                    INSERT INTO HoaDon (MaKhachHang, MaChiNhanh, MaNhanVien, TongPhu, TongTienThucTra)
                    OUTPUT INSERTED.MaHoaDon
                    VALUES (@customerId, @branchId, @vetId, 0, 0)
                `);
            
            const invoiceId = invoiceResult.recordset[0].MaHoaDon;
            
            // Create appointment
            const appointmentResult = await new sql.Request(transaction)
                .input('customerId', sql.UniqueIdentifier, data.customerId)
                .input('petId', sql.UniqueIdentifier, data.petId)
                .input('branchId', sql.UniqueIdentifier, data.branchId)
                .input('vetId', sql.UniqueIdentifier, data.vetId)
                .input('dateTime', sql.DateTime, data.dateTime)
                .input('invoiceId', sql.UniqueIdentifier, invoiceId)
                .query(`
                    INSERT INTO LichHen (MaKhachHang, MaThuCung, MaChiNhanh, MaNVTao, NgayGioHen, KenhDat, TrangThai, MaHoaDon)
                    OUTPUT INSERTED.MaLichHen
                    VALUES (@customerId, @petId, @branchId, @vetId, @dateTime, N'Tại quầy', N'Đã xác nhận', @invoiceId)
                `);

            const appointmentId = appointmentResult.recordset[0].MaLichHen;

            // Add services to appointment and calculate total
            let tongPhu = 0;
            for (const service of data.services) {
                await new sql.Request(transaction)
                    .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                    .input('serviceId', sql.UniqueIdentifier, service.serviceId)
                    .input('vetId', sql.UniqueIdentifier, data.vetId)
                    .input('price', sql.Decimal(18, 0), service.price)
                    .query(`
                        INSERT INTO ChiTietLichHen (MaLichHen, MaDichVu, MaBacSi, DonGiaThucTe)
                        VALUES (@appointmentId, @serviceId, @vetId, @price)
                    `);
                tongPhu += service.price;
            }

            // Update invoice total
            await new sql.Request(transaction)
                .input('invoiceId', sql.UniqueIdentifier, invoiceId)
                .input('tongPhu', sql.Decimal(18, 0), tongPhu)
                .query(`
                    UPDATE HoaDon 
                    SET TongPhu = @tongPhu, TongTienThucTra = @tongPhu
                    WHERE MaHoaDon = @invoiceId
                `);

            await transaction.commit();
            return { MaLichHen: appointmentId, MaHoaDon: invoiceId };
        } catch (error) {
            await transaction.rollback();
            console.error('[createAppointment] Error:', error.message, error);
            throw error;
        }
    },

    // Search customers
    async searchCustomers(query) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('query', sql.NVarChar(100), `%${query}%`)
                .query(`
                    SELECT 
                        MaKhachHang,
                        HoTen,
                        SoDienThoai,
                        Email
                    FROM KhachHang
                    WHERE HoTen LIKE @query OR SoDienThoai LIKE @query
                    ORDER BY HoTen
                `);
            return result.recordset;
        } catch (error) {
            console.error('[searchCustomers] Error:', error.message, error);
            throw error;
        }
    },

    // Get customer's pets
    async getCustomerPets(customerId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('customerId', sql.UniqueIdentifier, customerId)
                .query(`
                    SELECT 
                        tc.MaThuCung,
                        tc.TenThuCung,
                        tc.Giong,
                        tc.NgaySinh,
                        tc.GioiTinh,
                        tc.CanNang,
                        ltc.TenLoai AS LoaiThuCung
                    FROM ThuCung tc
                    JOIN LoaiThuCung ltc ON ltc.MaLoaiTC = tc.MaLoaiTC
                    WHERE tc.MaKhachHang = @customerId
                    ORDER BY tc.TenThuCung
                `);
            return result.recordset;
        } catch (error) {
            console.error('[getCustomerPets] Error:', error.message, error);
            throw error;
        }
    },

    // Get available services for a branch
    async getAvailableServices(branchId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('branchId', sql.UniqueIdentifier, branchId)
                .query(`
                    SELECT 
                        dv.MaDichVu,
                        dv.TenDichVu,
                        dv.GiaNiemYet,
                        dv.MoTa,
                        dv.LoaiDichVu,
                        dv.ThoiGianThucHienDuKien
                    FROM DichVu dv
                    JOIN CauHinhDichVu chdv ON chdv.MaDichVu = dv.MaDichVu
                    WHERE chdv.MaChiNhanh = @branchId AND chdv.TrangThai = 1
                    ORDER BY dv.TenDichVu
                `);
            return result.recordset;
        } catch (error) {
            console.error('[getAvailableServices] Error:', error.message, error);
            throw error;
        }
    },

    // Get appointment service results (KetQua)
    async getAppointmentServiceResults(appointmentId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                .query(`
                    SELECT 
                        ctlh.MaDichVu,
                        dv.TenDichVu,
                        ctlh.KetQua
                    FROM ChiTietLichHen ctlh
                    JOIN DichVu dv ON dv.MaDichVu = ctlh.MaDichVu
                    WHERE ctlh.MaLichHen = @appointmentId
                    ORDER BY dv.TenDichVu
                `);
            return result.recordset;
        } catch (error) {
            console.error('[getAppointmentServiceResults] Error:', error.message, error);
            throw error;
        }
    },

    // Update appointment service result (KetQua)
    async updateServiceResult(appointmentId, serviceId, ketQua) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('appointmentId', sql.UniqueIdentifier, appointmentId)
                .input('serviceId', sql.UniqueIdentifier, serviceId)
                .input('ketQua', sql.NVarChar(sql.MAX), ketQua)
                .query(`
                    UPDATE ChiTietLichHen
                    SET KetQua = @ketQua, ThoiGianThucHien = GETDATE()
                    WHERE MaLichHen = @appointmentId AND MaDichVu = @serviceId
                `);
            return { success: true };
        } catch (error) {
            console.error('[updateServiceResult] Error:', error.message, error);
            throw error;
        }
    }
};

export default vetService;
