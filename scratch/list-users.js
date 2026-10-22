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

async function listUsers() {
  const client = new Client(clientConfig);
  await client.connect();
  
  const res = await client.query('SELECT id, email, name, role FROM "User"');
  console.log('All Users:', JSON.stringify(res.rows, null, 2));

  await client.end();
}

listUsers().catch(console.error);
