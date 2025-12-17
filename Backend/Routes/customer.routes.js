import express from 'express';
const cusRouter = express.Router();
import cusController from '../Controllers/customer.controller.js';

cusRouter.post('/login', cusController.Login);

export default cusRouter;