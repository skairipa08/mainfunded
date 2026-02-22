#!/usr/bin/env tsx
/**
 * Environment variable checker
 * Verifies that all required environment variables are set
 * 
 * Note: Environment variables are loaded from .env.local by Next.js automatically.
 * For standalone script execution, ensure variables are set or use dotenv if needed.
 */

// Required environment variables
const required = [
  'MONGO_URL',
  'AUTH_URL',
  'AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'IYZICO_API_KEY',
  'IYZICO_SECRET_KEY',
  'IYZICO_BASE_URL',
] as const;

// Optional but recommended
const optional = [
  'DB_NAME',
  'ADMIN_EMAILS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CORS_ORIGINS',
] as const;

function checkEnv() {
  console.log('🔍 Checking environment variables...\n');

  const missing: string[] = [];
  const present: string[] = [];
  const optionalMissing: string[] = [];

  // Check required variables
  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
      console.log(`❌ ${key} - MISSING`);
    } else {
      present.push(key);
      // Mask secret values
      const displayValue = key.includes('SECRET') || key.includes('KEY') || key === 'MONGO_URL'
        ? '***set***'
        : value;
      console.log(`✅ ${key} - ${displayValue}`);
    }
  }

  console.log('\n📋 Optional variables:');

  // Check optional variables
  for (const key of optional) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      optionalMissing.push(key);
      console.log(`⚠️  ${key} - not set (optional)`);
    } else {
      const displayValue = key.includes('SECRET') || key.includes('KEY')
        ? '***set***'
        : value;
      console.log(`✅ ${key} - ${displayValue}`);
    }
  }

  console.log('\n' + '='.repeat(50));

  if (missing.length > 0) {
    console.log('\n❌ Missing required environment variables:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('\n💡 Tip: Copy .env.example to .env.local and fill in the values');
    process.exit(1);
  }

  // Warnings
  if (optionalMissing.includes('ADMIN_EMAILS')) {
    console.log('\n⚠️  Warning: ADMIN_EMAILS is not set');
    console.log('   You won\'t be able to access the admin panel without this.');
  }

  console.log('\n✅ All required environment variables are set!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run db:indexes');
  console.log('   2. Run: npm run doctor');
  console.log('   3. Run: npm run dev');
  process.exit(0);
}

checkEnv();
