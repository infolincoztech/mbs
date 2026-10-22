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

async function seedNotifications() {
  const email = 'lincoztech@gmail.com';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('User not found.');
      return;
    }
    
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          title: 'System Deployment Successful',
          message: 'The MMS platform has been successfully deployed to Vercel.',
          type: 'SUCCESS',
        },
        {
          userId: user.id,
          title: 'New Feature: Settings Page',
          message: 'You can now manage your profile and branding in the settings page.',
          type: 'INFO',
        },
        {
          userId: user.id,
          title: 'Database Synced',
          message: 'The Notification model has been added to the database.',
          type: 'SUCCESS',
        }
      ]
    });
    
    console.log('Notifications seeded successfully!');
  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
