import express from 'express';
const router = express.Router();
import cusController from '../Controllers/customer.controller.js';

router.post('/login', cusController.Login);

export default router;