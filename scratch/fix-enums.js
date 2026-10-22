const { Pool } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixEnums() {
  const client = await pool.connect();
  try {
    console.log('Connected to database. Creating enums...\n');

    // Create Role enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MARQUEE_ADMIN', 'STAFF', 'CLIENT');
      EXCEPTION WHEN duplicate_object THEN
        -- Add missing values if enum exists
        BEGIN
          ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MARQUEE_ADMIN';
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';
        EXCEPTION WHEN others THEN NULL; END;
        BEGIN
          ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CLIENT';
        EXCEPTION WHEN others THEN NULL; END;
      END $$;
    `);
    console.log('✅ Role enum OK');

    // Create BookingStatus enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "BookingStatus" AS ENUM ('INQUIRY','PENDING','CONFIRMED','COMPLETED','CANCELLED','REFUNDED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    console.log('✅ BookingStatus enum OK');

    // Create HallStatus enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "HallStatus" AS ENUM ('AVAILABLE','BOOKED','MAINTENANCE','CLOSED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    console.log('✅ HallStatus enum OK');

    // Create SubscriptionStatus enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE','EXPIRED','TRIAL','SUSPENDED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    console.log('✅ SubscriptionStatus enum OK');

    // Create PlanType enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PlanType" AS ENUM ('BASIC','TRIAL','MONTHLY','HALF_YEARLY','YEARLY','LIFETIME');
      EXCEPTION WHEN duplicate_object THEN
        BEGIN ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'TRIAL'; EXCEPTION WHEN others THEN NULL; END;
      END $$;
    `);
    console.log('✅ PlanType enum OK');

    // Verify
    const result = await client.query(`
      SELECT typname FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `);
    console.log('\n📋 All enums in database:');
    result.rows.forEach(r => console.log('  -', r.typname));

    console.log('\n✅ All enums fixed! Now run: vercel --prod --yes');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixEnums();
