import mysql from 'mysql2/promise'; // Use the promise version for async/await
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Change this to your password
  database: 'routeflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
try {
  const connection = await db.getConnection();
  console.log("🐬 MySQL Connected (Raw SQL Mode)");
  connection.release();
} catch (err) {
  console.error("❌ MySQL Connection Failed:", err.message);
}

export default db;