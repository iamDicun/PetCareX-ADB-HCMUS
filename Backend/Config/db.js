import sql from 'mssql';

const config = {
  user: 'sa',
  password: '123',
  server: '127.0.0.1',
  port: 1433,
  database: 'PetCareX',
  options: {
    trustServerCertificate: true
  }
};

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
