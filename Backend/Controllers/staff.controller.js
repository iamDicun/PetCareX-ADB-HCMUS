import staffService from "../Services/staff.service.js";

const staffController = {
    async login(req, res) {
        const { hoten, sdt } = req.body;
        try {
            if (!sdt) {
                return res.status(400).json({ success: false, message: 'Số điện thoại là bắt buộc' });
            }
            const staff = await staffService.findByPhoneNum(sdt);
            if (staff) {
                res.json({ success: true, staff: staff });
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