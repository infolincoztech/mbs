import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log('Running Prisma db push to sync schema...');
    
    // Run prisma db push to sync the schema with the database
    const output = execSync('npx prisma db push --skip-generate', {
      encoding: 'utf-8',
      env: {
        ...process.env,
        DATABASE_URL: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      }
    });
    
    console.log('Prisma db push output:', output);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schema synced successfully',
      output: output
    });
  } catch (error: any) {
    console.error('Error syncing schema:', error);
    return NextResponse.json({ 
      error: error.message,
      output: error.stdout || error.stderr
    }, { status: 500 });
  }
}
