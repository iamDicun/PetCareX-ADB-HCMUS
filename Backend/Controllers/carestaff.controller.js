import staffService from "../Services/staff.service.js";

const careStaffController = {
    async getMyAppointments(req, res) {
        const { staffId, page = 1, limit = 10 } = req.query;
        try {
            if (!staffId) {
                return res.status(400).json({ success: false, message: 'Thiếu mã nhân viên' });
            }
            const result = await staffService.getCareStaffAppointments(
                staffId, 
                parseInt(page), 
                parseInt(limit)
            );
            res.json({ 
                success: true, 
                appointments: result.appointments,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('[getMyAppointments] Error:', error.message, error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi máy chủ',
                error: error.message 
            });
        }
    }
};

export default careStaffController;
