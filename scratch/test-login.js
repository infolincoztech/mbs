const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testLogin() {
  const email = 'lincoztech@gmail.com';
  const password = 'Lincoz@Tech-2';
  
  console.log(`Testing login for: ${email}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('User not found in database.');
      return;
    }
    
    console.log('User found. Role:', user.role);
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      console.log('✅ Password is VALID');
    } else {
      console.log('❌ Password is INVALID');
      console.log('Stored hash:', user.password);
      
      // Let's try to hash the password again and see if it matches (it won't because of salt, but we can verify rounds)
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash (for comparison):', newHash);
    }
  } catch (error) {
    console.error('Error during test login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
