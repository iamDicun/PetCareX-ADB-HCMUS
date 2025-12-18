import { z } from 'zod';

export const AppointmentSchema = z.object({
    MaKhachHang: z.string({ 
        required_error: "Trường 'Mã khách hàng' là bắt buộc.",
        invalid_type_error: "Dữ liệu 'Mã khách hàng' phải là kiểu chuỗi." 
    }).uuid("Mã khách hàng không đúng định dạng UUID."),

    MaThuCung: z.string({ 
        required_error: "Trường 'Mã thú cưng' là bắt buộc." 
    }).uuid("Mã thú cưng không đúng định dạng UUID."),

    MaChiNhanh: z.string({ 
        required_error: "Trường 'Mã chi nhánh' là bắt buộc." 
    }).uuid("Mã chi nhánh không đúng định dạng UUID."),

    MaNVTao: z.string({ 
        required_error: "Trường 'Mã nhân viên tạo' là bắt buộc." 
    }).uuid("Mã nhân viên không đúng định dạng UUID."),

    NgayGioHen: z.string({ 
        required_error: "Vui lòng cung cấp 'Ngày giờ hẹn'." 
    }).refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "Định dạng ngày giờ hẹn không hợp lệ.",
    }),

    KenhDat: z.enum(['Online', 'Tại quầy'], {
        required_error: "Vui lòng chọn 'Kênh đặt lịch'.",
        invalid_type_error: "Kênh đặt lịch phải là 'Online' hoặc 'Tại quầy'."
    }),

    TrangThai: z.enum(['Chờ xác nhận', 'Đã xác nhận', 'Hoàn tất', 'Hủy'], {
        required_error: "Vui lòng cập nhật 'Trạng thái lịch hẹn'."
    }),

    MaHoaDon: zuuid("Mã hóa đơn không hợp lệ.").optional(),
});