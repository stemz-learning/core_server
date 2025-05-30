const { Pool } = require('pg');

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,       
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,              
});

module.exports = pool;

