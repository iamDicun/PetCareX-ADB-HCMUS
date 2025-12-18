import express from 'express';
import appmController from '../Controllers/appointment.controller.js';

const appmRouter = express.Router();

appmRouter.get('/vet-appointments/:vetId', appmController.getVetAppointments);
appmRouter.get('/appointment-details/:appointmentId', appmController.getAppointmentDetails);

export default appmRouter;