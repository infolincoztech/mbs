const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use absolute path for root CA
const rootCAPath = path.join(process.cwd(), 'node_modules/.cache/.http-cache/ssl/root.crt');
let rootCA;
try {
    rootCA = fs.readFileSync(rootCAPath);
} catch (e) {
    console.log('Root CA not found at', rootCAPath, 'falling back to rejectUnauthorized: false');
}

const poolConfig = { 
  connectionString: process.env.DATABASE_URL, 
};

if (rootCA) {
    poolConfig.ssl = {
        ca: rootCA,
        rejectUnauthorized: true
    };
} else {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetSuperAdmin() {
  const email = 'lincoztech@gmail.com';
  const password = 'Lincoz@Tech-2';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log(`Upserting super admin: ${email}...`);
  
  const user = await prisma.user.upsert({
    where: { email: email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    },
    create: {
      email: email,
      name: 'Lincoz Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });

  console.log('Super admin updated/created successfully!');
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Password set to:', password);
  
  await prisma.$disconnect();
}

resetSuperAdmin().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
