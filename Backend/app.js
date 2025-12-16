import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { poolPromise } from './Config/db.js';
import cors from 'cors';  

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

import cusRouter from './Routes/customer.routes.js';


app.use('/api/customer', cusRouter);

export default app;