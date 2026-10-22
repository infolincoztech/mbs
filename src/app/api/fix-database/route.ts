import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    console.log('Starting comprehensive database fix...\n');

    // 1. Create all enums
    console.log('Creating enums...');
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MARQUEE_ADMIN', 'STAFF', 'CLIENT');
      EXCEPTION WHEN duplicate_object THEN
        BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'; EXCEPTION WHEN others THEN NULL; END;
        BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MARQUEE_ADMIN'; EXCEPTION WHEN others THEN NULL; END;
        BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF'; EXCEPTION WHEN others THEN NULL; END;
        BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CLIENT'; EXCEPTION WHEN others THEN NULL; END;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "BookingStatus" AS ENUM ('INQUIRY','PENDING','CONFIRMED','COMPLETED','CANCELLED','REFUNDED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "HallStatus" AS ENUM ('AVAILABLE','BOOKED','MAINTENANCE','CLOSED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE','EXPIRED','TRIAL','SUSPENDED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PlanType" AS ENUM ('BASIC','TRIAL','MONTHLY','HALF_YEARLY','YEARLY','LIFETIME');
      EXCEPTION WHEN duplicate_object THEN
        BEGIN ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'TRIAL'; EXCEPTION WHEN others THEN NULL; END;
      END $$;
    `);

    console.log('✅ All enums created');

    // 2. Create tables if they don't exist
    console.log('Creating tables...');

    // User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "role" "Role" NOT NULL DEFAULT 'CLIENT',
        "phone" TEXT,
        "image" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    // Marquee table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Marquee" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "logo" TEXT,
        "address" TEXT,
        "contactPhone" TEXT,
        "contactEmail" TEXT,
        "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
        "secondaryColor" TEXT NOT NULL DEFAULT '#f3f4f6',
        "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
        "ownerId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Marquee_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Marquee_slug_key" ON "Marquee"("slug");
      CREATE UNIQUE INDEX IF NOT EXISTS "Marquee_ownerId_key" ON "Marquee"("ownerId");
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Marquee" ADD CONSTRAINT "Marquee_ownerId_fkey" 
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Subscription table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT NOT NULL,
        "marqueeId" TEXT NOT NULL,
        "planType" "PlanType" NOT NULL DEFAULT 'BASIC',
        "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_marqueeId_key" ON "Subscription"("marqueeId");
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_marqueeId_fkey" 
        FOREIGN KEY ("marqueeId") REFERENCES "Marquee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Hall table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Hall" (
        "id" TEXT NOT NULL,
        "marqueeId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "capacity" INTEGER NOT NULL,
        "pricePerSlot" DOUBLE PRECISION NOT NULL,
        "status" "HallStatus" NOT NULL DEFAULT 'AVAILABLE',
        "features" TEXT[],
        "images" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Hall" ADD CONSTRAINT "Hall_marqueeId_fkey" 
        FOREIGN KEY ("marqueeId") REFERENCES "Marquee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Booking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Booking" (
        "id" TEXT NOT NULL,
        "hallId" TEXT NOT NULL,
        "clientId" TEXT NOT NULL,
        "eventDate" TIMESTAMP(3) NOT NULL,
        "timeSlot" TEXT NOT NULL,
        "guestCount" INTEGER NOT NULL,
        "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "notes" TEXT,
        "qrCode" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hallId_fkey" 
        FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Booking" ADD CONSTRAINT "Booking_clientId_fkey" 
        FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Package table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Package" (
        "id" TEXT NOT NULL,
        "marqueeId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Package" ADD CONSTRAINT "Package_marqueeId_fkey" 
        FOREIGN KEY ("marqueeId") REFERENCES "Marquee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Facility table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Facility" (
        "id" TEXT NOT NULL,
        "marqueeId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Facility" ADD CONSTRAINT "Facility_marqueeId_fkey" 
        FOREIGN KEY ("marqueeId") REFERENCES "Marquee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Staff table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Staff" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "marqueeId" TEXT NOT NULL,
        "designation" TEXT NOT NULL,
        "salary" DOUBLE PRECISION NOT NULL,
        "permissions" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Staff_userId_key" ON "Staff"("userId");
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Staff" ADD CONSTRAINT "Staff_marqueeId_fkey" 
        FOREIGN KEY ("marqueeId") REFERENCES "Marquee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // FinancialRecord table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "FinancialRecord" (
        "id" TEXT NOT NULL,
        "marqueeId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_marqueeId_fkey" 
        FOREIGN KEY ("marqueeId") REFERENCES "Marquee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Notification table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // InventoryItem table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "InventoryItem" (
        "id" TEXT NOT NULL,
        "marqueeId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "unit" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_marqueeId_fkey" 
        FOREIGN KEY ("marqueeId") REFERENCES "Marquee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Junction tables for many-to-many relationships
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_BookingToPackage" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,

        CONSTRAINT "_BookingToPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_BookingToPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "_BookingToPackage_AB_unique" ON "_BookingToPackage"("A", "B");
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "_BookingToFacility" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,

        CONSTRAINT "_BookingToFacility_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_BookingToFacility_B_fkey" FOREIGN KEY ("B") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "_BookingToFacility_AB_unique" ON "_BookingToFacility"("A", "B");
    `);

    console.log('✅ All tables created');

    // Verify
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    const enums = await client.query(`
      SELECT typname FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Database fixed successfully',
      tables: tables.rows.map(r => r.tablename),
      enums: enums.rows.map(r => r.typname)
    });
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
    await pool.end();
  }
}
