require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const rootCA = fs.readFileSync(path.join(__dirname, 'node_modules/.cache/.http-cache/ssl/root.crt'));
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { ca: rootCA, rejectUnauthorized: true } 
});

pool.query(`
  SELECT enumlabel 
  FROM pg_enum 
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role')
`).then(r => {
  console.log('Current enum values:', r.rows);
}).catch(console.error).finally(() => pool.end());
