import staffService from "../Services/staff.service.js";

const careStaffController = {
    async getMyAppointments(req, res) {
        const { staffId } = req.query;
        try {
            if (!staffId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã nhân viên' });
            }
            const appointments = await staffService.getCareStaffAppointments(staffId);
            res.json({ success: true, appointments });
        } catch (error) {
            console.error('[getMyAppointments] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};

export default careStaffController;
