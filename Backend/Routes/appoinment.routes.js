import express from 'express';
import appmController from '../Controllers/appointment.controller.js';
import authMiddleware from '../Middleware/auth.middleware.js';

const appmRouter = express.Router();

appmRouter.get('/vet-appointments/:vetId', authMiddleware, appmController.getVetAppointments);
appmRouter.get('/appointment-details/:appointmentId', authMiddleware, appmController.getAppointmentDetails);

export default appmRouter;