const { Client } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const clientConfig = { 
  connectionString: process.env.DIRECT_URL, 
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkUsers() {
  const client = new Client(clientConfig);
  try {
    await client.connect();
    console.log('Connected to database.');
    
    const res = await client.query('SELECT id, email, role FROM "User"');
    console.log('Users in database:');
    console.table(res.rows);
    
    await client.end();
  } catch (err) {
    console.error('Failed to check users:', err.message);
    process.exit(1);
  }
}

checkUsers();
