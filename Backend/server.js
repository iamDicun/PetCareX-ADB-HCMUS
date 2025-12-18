import app from './app.js';
import dotenv from 'dotenv';

// Load ENV from .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Bind to port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`Server running at http://localhost:${PORT}`);
});