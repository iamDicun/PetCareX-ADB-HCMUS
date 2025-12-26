import express from 'express';
import vetController from '../Controllers/vet.controller.js';
import authMiddleware from '../Middleware/auth.middleware.js';

const vetRouter = express.Router();

// Appointment routes
vetRouter.get('/appointments/:vetId', authMiddleware, vetController.getVetAppointments);
vetRouter.get('/appointment/:appointmentId/details', authMiddleware, vetController.getAppointmentDetails);
vetRouter.post('/appointment/create', authMiddleware, vetController.createAppointment);

// Medical record routes
vetRouter.post('/medical-record/create', authMiddleware, vetController.createMedicalRecord);
vetRouter.get('/medical-record/:appointmentId', authMiddleware, vetController.getMedicalRecord);
vetRouter.put('/medical-record/:medicalRecordId', authMiddleware, vetController.updateMedicalRecord);

// Prescription routes
vetRouter.post('/prescription/create', authMiddleware, vetController.createPrescription);
vetRouter.get('/prescription/:medicalRecordId', authMiddleware, vetController.getPrescription);
vetRouter.delete('/prescription/:medicalRecordId', authMiddleware, vetController.deletePrescription);
vetRouter.get('/medications', authMiddleware, vetController.getAvailableMedications);

// Customer and pet routes
vetRouter.get('/customers/search', authMiddleware, vetController.searchCustomers);
vetRouter.get('/customer/:customerId/pets', authMiddleware, vetController.getCustomerPets);

// Service routes
vetRouter.get('/services/:branchId', authMiddleware, vetController.getAvailableServices);

// Service result routes (KetQua)
vetRouter.get('/appointment/:appointmentId/results', authMiddleware, vetController.getAppointmentServiceResults);
vetRouter.put('/appointment/:appointmentId/service/:serviceId/result', authMiddleware, vetController.updateServiceResult);

export default vetRouter;
