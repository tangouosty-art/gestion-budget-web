// server/src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mon_budget_plus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Test de connexion au démarrage
pool.getConnection()
  .then(conn => {
    console.log('✅ Connexion MySQL établie');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erreur connexion MySQL :', err.message, err.code);
    console.error('DB_HOST:', process.env.DB_HOST);
    console.error('DB_PORT:', process.env.DB_PORT);
    console.error('DB_USER:', process.env.DB_USER);
    console.error('DB_NAME:', process.env.DB_NAME);
    process.exit(1);
  });

module.exports = pool;