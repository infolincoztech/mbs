require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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
  console.log('Email: lincoztech@gmail.com');
  console.log('Password: Lincoz@Tech-2');
  await prisma.$disconnect();
}

createSuperAdmin().catch(console.error);
