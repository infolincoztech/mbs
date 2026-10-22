const { Client } = require('pg');
require('dotenv').config();

// Remove sslmode=require query param if it causes issues, or test with process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const connectionString = process.env.DATABASE_URL.replace('sslmode=require&', '').replace('?sslmode=require', '');
const clientConfig = { 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
};

async function testConnection() {
  const client = new Client(clientConfig);
  try {
    await client.connect();
    console.log('Connected to new database successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
