# Script to set all Vercel environment variables

$envs = @{
    "DATABASE_URL" = "postgres://postgres.fhippodyphnpxdsoeifg:ajDeXzBFC524cnHj@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
    "DIRECT_URL" = "postgres://postgres.fhippodyphnpxdsoeifg:ajDeXzBFC524cnHj@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    "NEXTAUTH_SECRET" = "a-very-secure-secret-key-123456-lincoz"
    "NEXTAUTH_URL" = "https://mms.lincoztech.com"
    "NEXT_PUBLIC_APP_NAME" = "Lincoz MMS"
    "NEXT_PUBLIC_APP_DESCRIPTION" = "Marquee Management System"
    "NEXT_PUBLIC_SUPABASE_URL" = "https://fhippodyphnpxdsoeifg.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaXBwb2R5cGhucHhkc29laWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDUzOTUsImV4cCI6MjA5MzYyMTM5NX0.wD4VNF9x4UWFOV55YJE4NB2zb8PvDDEknDX0BehpBdE"
}

foreach ($key in $envs.Keys) {
    $val = $envs[$key]
    Write-Host "Setting $key..."
    
    # Remove from production
    npx vercel env rm $key production -y
    # Add to production
    npx vercel env add $key production --value "$val" --yes
    
    # Remove from preview
    npx vercel env rm $key preview -y
    # Add to preview
    npx vercel env add $key preview --value "$val" --yes
}

Write-Host "All envs set!"
