import staffService from "../Services/staff.service.js";
import jwt from 'jsonwebtoken';

const staffController = {
    async login(req, res) {
        const { hoten, sdt } = req.body;
        try {
            if (!sdt) {
                return res.status(400).json({ success: false, message: 'Số điện thoại là bắt buộc' });
            }
            const staff = await staffService.findByPhoneNum(sdt);
            if (staff) {
                const token = jwt.sign(
                    { id: staff.MaNhanVien, role: 'staff', name: staff.HoTen },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                console.log('Staff logged in:', staff.HoTen);
                res.json({ success: true, staff: staff, token: token });
            } else {
                res.json({ success: false, message: 'Sai thông tin đăng nhập' });
            }
        } catch (error) {
            console.error('[login] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

};

export default staffController;