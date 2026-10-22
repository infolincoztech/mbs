const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rootCAPath = path.join(process.cwd(), 'node_modules/.cache/.http-cache/ssl/root.crt');
let rootCA;
try {
    rootCA = fs.readFileSync(rootCAPath);
} catch (e) {}

const clientConfig = { 
  connectionString: process.env.DATABASE_URL, 
};

if (rootCA) {
    clientConfig.ssl = {
        ca: rootCA,
        rejectUnauthorized: true
    };
} else {
    clientConfig.ssl = {
        rejectUnauthorized: false
    };
}

async function checkUserColumns() {
  const client = new Client(clientConfig);
  await client.connect();
  
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'User'
  `);
  
  console.log('Columns in User table:', JSON.stringify(res.rows, null, 2));
  
  const users = await client.query(`SELECT email, role FROM "User" LIMIT 5`);
  console.log('Sample users:', JSON.stringify(users.rows, null, 2));

  await client.end();
}

checkUserColumns().catch(console.error);
