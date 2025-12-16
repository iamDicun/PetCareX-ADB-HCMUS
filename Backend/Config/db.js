import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123',
  server: process.env.DB_SERVER || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || 'PetCareX',
  options: {
    trustServerCertificate: true
  }
};

console.log('Database config:', { 
  server: config.server, 
  database: config.database, 
  user: config.user 
});

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server (SQL Auth)');
    return pool;
  })
  .catch(err => {
    console.error('❌ DB Connection Failed', err);
  });

export default sql;
