require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const rootCA = fs.readFileSync(path.join(__dirname, 'node_modules/.cache/.http-cache/ssl/root.crt'));
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { ca: rootCA, rejectUnauthorized: true } 
});

async function createSuperAdmin() {
  const hashedPassword = await bcrypt.hash('Lincoz@Tech-2', 10);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if user exists
    const existing = await client.query(
      'SELECT id FROM "User" WHERE email = $1',
      ['lincoztech@gmail.com']
    );
    
    if (existing.rows.length > 0) {
      console.log('User already exists:', existing.rows[0].id);
    } else {
      // Insert superadmin user
      await client.query(
        `INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, 'SUPER_ADMIN'::role, NOW(), NOW())`,
        ['lincoztech@gmail.com', 'Lincoz Super Admin', hashedPassword]
      );
      console.log('Superadmin created successfully!');
      console.log('Email: lincoztech@gmail.com');
      console.log('Password: Lincoz@Tech-2');
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error.message);
    
    // Check if role enum exists
    if (error.code === '22023') {
      console.log('Role enum might not exist. Trying to create it...');
      await client.query(`CREATE TYPE role AS ENUM ('SUPER_ADMIN', 'MARQUEE_ADMIN', 'CLIENT')`);
      console.log('Role enum created. Please run this script again.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

createSuperAdmin();
