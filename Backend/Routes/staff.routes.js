import express from 'express';
const staffRouter = express.Router();
import staffController from '../Controllers/staff.controller.js';

staffRouter.post('/login', staffController.login);

export default staffRouter;