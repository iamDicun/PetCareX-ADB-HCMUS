import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { poolPromise } from './Config/db.js';

const app = express();

// Log
app.use(morgan('dev'));

// Parse JSON body
app.use(bodyParser.json());

app.get('/customers', async (req, res) => {
  try {
    console.log('Fetching customers from database...');
    const pool = await poolPromise
    const result = await pool.request().query('SELECT top 10 * FROM KhachHang')
    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})



export default app;