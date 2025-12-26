import express from 'express';
const cusRouter = express.Router();
import cusController from '../Controllers/customer.controller.js';

cusRouter.post('/login', cusController.Login);
cusRouter.get('/products', cusController.getProducts);
cusRouter.get('/services', cusController.getServices);
cusRouter.get('/search', cusController.search);
cusRouter.post('/register-pet', cusController.registerPet);
cusRouter.get('/pet-types', cusController.getPetTypes);
cusRouter.post('/order', cusController.createOrder);
cusRouter.post('/appointment', cusController.createAppointment);
cusRouter.get('/history/:id', cusController.getHistory);
cusRouter.get('/branches', cusController.getBranches);
cusRouter.get('/branches/:branchId/available-vets', cusController.getAvailableVets);
cusRouter.get('/pets/:id', cusController.getCustomerPets);
cusRouter.get('/suitable-products/:petId', cusController.getSuitableProducts);
cusRouter.get('/invoices/confirmed/:id', cusController.getConfirmedInvoices);
cusRouter.get('/vaccinations/upcoming/:id', cusController.getUpcomingVaccinations);
cusRouter.get('/appointment/:appointmentId/details', cusController.getAppointmentDetails);
cusRouter.get('/order/:orderId/details', cusController.getOrderDetails);

export default cusRouter;