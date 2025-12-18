import { poolPromise } from '../Config/db.js';
import sql from 'mssql';

async function getVetAppointments(vetId){
    try{
        const pool =  await poolPromise;
        const result = await pool.request()
            .input('vetId', sql.UniqueIdentifier, vetId)
            .query('SELECT lh.NgayGioHen, kh.HoTen, kh.SoDienThoai, kh.Email, tc.TenThuCung, ltc.TenLoai, lh.TrangThai FROM LichHen lh JOIN KhachHang kh ON kh.MaKhachHang = lh.MaKhachHang JOIN ThuCung tc ON tc.MaThuCung = lh.MaThuCung JOIN LoaiThuCung ltc ON ltc.MaLoaiTC = tc.MaLoaiTC JOIN ChiTietLichHen ctlh ON ctlh.MaLichHen = lh.MaLichHen WHERE ctlh.MaBacSi = @vetId');
        const appointments = result.recordset;
        return appointments.map(app => ({
            time: app.NgayGioHen,
            customer: app.HoTen,
            pet: app.TenThuCung,
            type: app.TenLoai,
            status: app.TrangThai
}));

    } catch (error){
        console.error('[getVetAppointment] Error:', error.message, error);
        throw error;
    }
} 

async function getAppointmentDetails(appointmentId) { 
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('appointmentId', sql.UniqueIdentifier, appointmentId)
            .query('SELECT ctlh.MaLichHen, dv.TenDichVu, dv.LoaiDichVu, ctlh.DonGiaThucTe, ctlh.KetQua, ctlh.ThoiGianThucHien FROM ChiTietLichHen ctlh JOIN DichVu dv ON dv.MaDichVu = ctlh.MaDichVu WHERE ctlh.MaLichHen = @appointmentId');
        const details = result.recordset;
        return details.map(detail => ({
            appointmentId: detail.MaLichHen,
            serviceName: detail.TenDichVu,
            serviceType: detail.LoaiDichVu,
            actualPrice: detail.DonGiaThucTe,
            result: detail.KetQua,
            duration: detail.ThoiGianThucHien
        }));
    } catch (error) {
        console.error('[getAppointmentDetails] Error:', error.message, error);
        throw error;
    }
}
 export default {
    getVetAppointments,
    getAppointmentDetails
};