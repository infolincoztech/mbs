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

async function checkEnums() {
  const client = new Client(clientConfig);
  await client.connect();
  
  const res = await client.query(`
    SELECT n.nspname as schema, t.typname as type 
    FROM pg_type t 
    LEFT JOIN pg_namespace n ON n.oid = t.typnamespace 
    WHERE t.typtype = 'e'
  `);
  
  console.log('Enums in database:', JSON.stringify(res.rows, null, 2));
  
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log('Tables in database:', JSON.stringify(tables.rows, null, 2));

  await client.end();
}

checkEnums().catch(console.error);
