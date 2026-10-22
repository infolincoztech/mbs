const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
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

async function forceResetAdmin() {
  const client = new Client(clientConfig);
  await client.connect();
  
  const email = 'lincoztech@gmail.com';
  const password = 'Lincoz@Tech-2';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Check if user exists
  const checkRes = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
  
  if (checkRes.rows.length > 0) {
    console.log('User exists, updating password and role...');
    // Use 'SUPERADMIN' because that's what seems to be in the DB
    await client.query('UPDATE "User" SET password = $1, role = $2 WHERE email = $3', [hashedPassword, 'SUPER_ADMIN', email]);
  } else {
    console.log('User does not exist, creating...');
    // We need to provide a CUID-like ID or UUID
    const id = 'cl' + Math.random().toString(36).substr(2, 9);
    await client.query('INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())', 
      [id, email, hashedPassword, 'SUPER_ADMIN']);
  }
  
  console.log('Done! Email: lincoztech@gmail.com, Password: Lincoz@Tech-2');
  await client.end();
}

forceResetAdmin().catch(console.error);
