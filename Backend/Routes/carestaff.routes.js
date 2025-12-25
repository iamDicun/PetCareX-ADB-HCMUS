import express from 'express';
const careStaffRouter = express.Router();
import careStaffController from '../Controllers/carestaff.controller.js';

careStaffRouter.get('/appointments', careStaffController.getMyAppointments);

export default careStaffRouter;
