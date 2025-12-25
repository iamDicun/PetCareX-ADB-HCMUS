import express from 'express';
const staffRouter = express.Router();
import staffController from '../Controllers/staff.controller.js';

staffRouter.post('/login', staffController.login);
staffRouter.get('/products', staffController.getProducts);
staffRouter.get('/services', staffController.getServices);
staffRouter.post('/customer/find-or-create', staffController.findOrCreateCustomer);
staffRouter.get('/doctors/available', staffController.getAvailableDoctors);
staffRouter.post('/order/create', staffController.createOrder);
staffRouter.post('/appointment/create', staffController.createAppointment);
staffRouter.get('/orders/pending', staffController.getPendingOrders);
staffRouter.get('/appointments/pending', staffController.getPendingAppointments);
staffRouter.get('/order/:orderId/details', staffController.getOrderDetails);
staffRouter.get('/appointment/:appointmentId/details', staffController.getAppointmentDetails);
staffRouter.get('/customer/:customerId/pets', staffController.getCustomerPets);
staffRouter.post('/order/:orderId/confirm', staffController.confirmOrder);
staffRouter.post('/appointment/:appointmentId/confirm', staffController.confirmAppointment);

export default staffRouter;