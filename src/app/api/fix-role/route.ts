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
    console.log('Creating Role enum...');

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

    console.log('✅ Role enum created');

    // Verify
    const result = await client.query(`
      SELECT typname FROM pg_type 
      WHERE typtype = 'e' AND typname = 'Role';
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Role enum created successfully',
      exists: result.rows.length > 0
    });
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
    await pool.end();
  }
}
