require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load the root CA certificate
const rootCAPath = path.join(__dirname, 'node_modules/.cache/.http-cache/ssl/root.crt');
const rootCA = fs.readFileSync(rootCAPath);

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    ca: rootCA,
    rejectUnauthorized: true
  }
});

async function addPhoneColumn() {
  const client = await pool.connect();
  
  try {
    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'User' 
      AND column_name = 'phone'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add phone column
      await client.query(`ALTER TABLE "User" ADD COLUMN phone VARCHAR(20)`);
      console.log('Phone column added successfully!');
    } else {
      console.log('Phone column already exists!');
    }
    
    // Also check for image column
    const imageResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'User' 
      AND column_name = 'image'
    `);
    
    if (imageResult.rows.length === 0) {
      await client.query(`ALTER TABLE "User" ADD COLUMN image VARCHAR(500)`);
      console.log('Image column added successfully!');
    } else {
      console.log('Image column already exists!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addPhoneColumn();
