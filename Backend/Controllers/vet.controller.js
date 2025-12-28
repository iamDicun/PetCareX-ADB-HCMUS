import vetService from '../Services/vet.service.js';

const vetController = {
    // Get appointments for a specific vet
    async getVetAppointments(req, res) {
        const { vetId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        try {
            const result = await vetService.getVetAppointments(vetId, page, limit);
            res.json({ 
                success: true, 
                appointments: result.appointments,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('[getVetAppointments] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get detailed information of an appointment
    async getAppointmentDetails(req, res) {
        const { appointmentId } = req.params;
        try {
            const details = await vetService.getAppointmentDetails(appointmentId);
            res.json({ success: true, details });
        } catch (error) {
            console.error('[getAppointmentDetails] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Create a new medical record
    async createMedicalRecord(req, res) {
        const { appointmentId, symptoms, diagnosis, weight, reExamDate } = req.body;
        try {
            if (!appointmentId || !symptoms || !diagnosis || !weight) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Thông tin hồ sơ khám không đầy đủ' 
                });
            }
            const record = await vetService.createMedicalRecord({
                appointmentId,
                symptoms,
                diagnosis,
                weight,
                reExamDate
            });
            res.json({ success: true, record });
        } catch (error) {
            console.error('[createMedicalRecord] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get medical record by appointment ID
    async getMedicalRecord(req, res) {
        const { appointmentId } = req.params;
        try {
            const record = await vetService.getMedicalRecord(appointmentId);
            res.json({ success: true, record });
        } catch (error) {
            console.error('[getMedicalRecord] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Update medical record
    async updateMedicalRecord(req, res) {
        const { medicalRecordId } = req.params;
        const { symptoms, diagnosis, weight, reExamDate } = req.body;
        try {
            if (!symptoms || !diagnosis || !weight) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Thông tin hồ sơ khám không đầy đủ' 
                });
            }
            const record = await vetService.updateMedicalRecord(medicalRecordId, {
                symptoms,
                diagnosis,
                weight,
                reExamDate
            });
            res.json({ success: true, record });
        } catch (error) {
            console.error('[updateMedicalRecord] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Create prescription for a medical record
    async createPrescription(req, res) {
        const { medicalRecordId, medications } = req.body;
        try {
            if (!medicalRecordId || !medications || medications.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Thông tin toa thuốc không đầy đủ' 
                });
            }
            const prescription = await vetService.createPrescription(medicalRecordId, medications);
            res.json({ success: true, prescription });
        } catch (error) {
            console.error('[createPrescription] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get prescription by medical record ID
    async getPrescription(req, res) {
        const { medicalRecordId } = req.params;
        try {
            const prescription = await vetService.getPrescription(medicalRecordId);
            res.json({ success: true, prescription });
        } catch (error) {
            console.error('[getPrescription] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Delete prescription by medical record ID (for updating)
    async deletePrescription(req, res) {
        const { medicalRecordId } = req.params;
        try {
            await vetService.deletePrescription(medicalRecordId);
            res.json({ success: true, message: 'Xóa toa thuốc thành công' });
        } catch (error) {
            console.error('[deletePrescription] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get available medications
    async getAvailableMedications(req, res) {
        try {
            const medications = await vetService.getAvailableMedications();
            res.json({ success: true, medications });
        } catch (error) {
            console.error('[getAvailableMedications] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Create new appointment (by vet)
    async createAppointment(req, res) {
        const { customerId, petId, branchId, vetId, services, dateTime } = req.body;
        try {
            if (!customerId || !petId || !branchId || !vetId || !services || !dateTime) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Thông tin lịch hẹn không đầy đủ' 
                });
            }
            const appointment = await vetService.createAppointment({
                customerId,
                petId,
                branchId,
                vetId,
                services,
                dateTime
            });
            res.json({ success: true, appointment });
        } catch (error) {
            console.error('[createAppointment] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get customers for search
    async searchCustomers(req, res) {
        const { query } = req.query;
        try {
            const customers = await vetService.searchCustomers(query);
            res.json({ success: true, customers });
        } catch (error) {
            console.error('[searchCustomers] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get customer's pets
    async getCustomerPets(req, res) {
        const { customerId } = req.params;
        try {
            const pets = await vetService.getCustomerPets(customerId);
            res.json({ success: true, pets });
        } catch (error) {
            console.error('[getCustomerPets] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get available services
    async getAvailableServices(req, res) {
        const { branchId } = req.params;
        try {
            const services = await vetService.getAvailableServices(branchId);
            res.json({ success: true, services });
        } catch (error) {
            console.error('[getAvailableServices] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Get appointment service results (KetQua)
    async getAppointmentServiceResults(req, res) {
        const { appointmentId } = req.params;
        try {
            const results = await vetService.getAppointmentServiceResults(appointmentId);
            res.json({ success: true, results });
        } catch (error) {
            console.error('[getAppointmentServiceResults] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    },

    // Update appointment service result (KetQua)
    async updateServiceResult(req, res) {
        const { appointmentId, serviceId } = req.params;
        const { ketQua } = req.body;
        try {
            await vetService.updateServiceResult(appointmentId, serviceId, ketQua);
            res.json({ success: true, message: 'Cập nhật kết quả thành công' });
        } catch (error) {
            console.error('[updateServiceResult] Error:', error.message, error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};

export default vetController;
