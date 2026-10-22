const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
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

async function testMarquee() {
  try {
    console.log("Attempting to count marquees...");
    const count = await prisma.marquee.count();
    console.log("Marquee count:", count);
    
    console.log("Attempting to find first marquee...");
    const first = await prisma.marquee.findFirst();
    console.log("First marquee:", first);
  } catch (error) {
    console.error("Error accessing Marquee table:");
    console.error(error.message);
    if (error.code) console.error("Error code:", error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testMarquee();
