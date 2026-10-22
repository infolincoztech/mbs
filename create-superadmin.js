require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Create a custom agent that accepts self-signed certificates
const agent = new https.Agent({
  rejectUnauthorized: false
});

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync(path.join(__dirname, 'node_modules/.cache/.http-cache/ssl/ca.pem')).toString(),
    cert: fs.readFileSync(path.join(__dirname, 'node_modules/.cache/.http-cache/ssl/cert.pem')).toString(),
    key: fs.readFileSync(path.join(__dirname, 'node_modules/.cache/.http-cache/ssl/key.pem')).toString()
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createSuperAdmin() {
  const hashedPassword = await bcrypt.hash('Lincoz@Tech-2', 10);
  
  await prisma.user.upsert({
    where: { email: 'lincoztech@gmail.com' },
    update: {},
    create: {
      email: 'lincoztech@gmail.com',
      name: 'Lincoz Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });
  
  console.log('Superadmin created successfully!');
  await prisma.$disconnect();
}

createSuperAdmin().catch(console.error);
