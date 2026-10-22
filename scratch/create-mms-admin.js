const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const clientConfig = { 
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false
  }
};

async function createAdmin() {
  const client = new Client(clientConfig);
  try {
    await client.connect();
    console.log('Connected to new database.');
    
    const email = 'lincoztech@gmail.com';
    const password = 'Lincoz@Tech-2';
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = 'cl' + Math.random().toString(36).substr(2, 9);
    
    // In MMS schema, Role is an enum. But since we just did a fresh push, 
    // the enum Role should exist and 'SUPER_ADMIN' should be a valid value.
    // The User table has id, email, password, role, createdAt, updatedAt.
    
    await client.query(`
      INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") 
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, [id, email, hashedPassword, 'SUPER_ADMIN']);
    
    console.log('Super Admin created successfully in the new database!');
    console.log('Email:', email);
    console.log('Password:', password);
    
    await client.end();
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
