const { Client } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const clientConfig = { 
  connectionString: process.env.DIRECT_URL, 
  ssl: {
    rejectUnauthorized: false
  }
};

async function listTables() {
  const client = new Client(clientConfig);
  try {
    await client.connect();
    console.log('Connected to database.');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    console.table(res.rows);
    
    await client.end();
  } catch (err) {
    console.error('Failed to list tables:', err.message);
    process.exit(1);
  }
}

listTables();
