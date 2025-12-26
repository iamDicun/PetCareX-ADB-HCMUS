import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { poolPromise } from './Config/db.js';
import cors from 'cors';  

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

import cusRouter from './Routes/customer.routes.js';
import staffRouter from './Routes/staff.routes.js';
import appmRouter from './Routes/appoinment.routes.js';
import careStaffRouter from './Routes/carestaff.routes.js';
import branchRouter from './Routes/branch.routes.js';
import vetRouter from './Routes/vet.routes.js';


app.use('/api/customer', cusRouter);
app.use('/api/staff', staffRouter);
app.use('/api/appointment', appmRouter);
app.use('/api/carestaff', careStaffRouter);
app.use('/api/branch', branchRouter);
app.use('/api/vet', vetRouter);
export default app;