import appmService from '../Services/appointment.service.js';

const appmController = {
        async getVetAppointments(req, res) {
        const { vetId } = req.params;
        try {
            const appointments = await appmService.getVetAppointments(vetId);
            res.json({ success: true, appointments: appointments });
        } catch (error) {
            console.error('[getVetAppointments] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    async getAppointmentDetails(req, res) {
        const { appointmentId } = req.params;
        try {
            const details = await staffService.getAppointmentDetails(appointmentId);
            res.json({ success: true, details: details });
        } catch (error) {
            console.error('[getAppointmentDetails] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },
};

export default appmController;
