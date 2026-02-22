#!/usr/bin/env tsx
/**
 * Doctor script - one-command sanity check
 * Checks environment, database connection, and prints status
 * 
 * Note: Environment variables are loaded from .env.local by Next.js automatically.
 * For standalone script execution, ensure variables are set or use dotenv if needed.
 */

import { getDb } from '../lib/db';

async function checkMongoConnection() {
  try {
    const db = await getDb();
    await db.admin().ping();
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🏥 FundEd Doctor - System Health Check\n');
  console.log('='.repeat(50));

  // 1. Check environment variables
  console.log('\n1️⃣  Checking environment variables...\n');
  
  const required = [
    'MONGO_URL',
    'AUTH_URL',
    'AUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'IYZICO_API_KEY',
    'IYZICO_SECRET_KEY',
    'IYZICO_BASE_URL',
  ];

  let envOk = true;
  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      console.log(`   ❌ ${key} - MISSING`);
      envOk = false;
    } else {
      console.log(`   ✅ ${key} - set`);
    }
  }

  if (!envOk) {
    console.log('\n❌ Environment check failed!');
    console.log('   Run: npm run check:env');
    process.exit(1);
  }

  // 2. Check MongoDB connection
  console.log('\n2️⃣  Checking MongoDB connection...\n');
  
  const mongoResult = await checkMongoConnection();
  if (!mongoResult.success) {
    console.log(`   ❌ Connection failed: ${mongoResult.error}`);
    console.log('\n💡 Tip: Make sure MongoDB is running and MONGO_URL is correct');
    process.exit(1);
  }
  
  console.log('   ✅ MongoDB connection successful');

  // 3. Get database info
  console.log('\n3️⃣  Database information...\n');
  
  try {
    const db = await getDb();
    const dbName = db.databaseName;
    console.log(`   📦 Database name: ${dbName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`   📚 Collections: ${collections.length}`);
    if (collections.length > 0) {
      collections.slice(0, 5).forEach((coll: any) => {
        console.log(`      - ${coll.name}`);
      });
      if (collections.length > 5) {
        console.log(`      ... and ${collections.length - 5} more`);
      }
    }
  } catch (error: any) {
    console.log(`   ⚠️  Could not fetch database info: ${error.message}`);
  }

  // 4. Print configuration
  console.log('\n4️⃣  Configuration...\n');
  
  const authUrl = process.env.AUTH_URL || 'not set';
  console.log(`   🌐 Auth URL: ${authUrl}`);
  
  const adminEmails = process.env.ADMIN_EMAILS;
  if (adminEmails) {
    const emails = adminEmails.split(',').map(e => e.trim()).filter(Boolean);
    console.log(`   👤 Admin emails: ${emails.length} configured`);
    emails.forEach(email => console.log(`      - ${email}`));
  } else {
    console.log('   ⚠️  Admin emails: NOT SET (admin panel will not be accessible)');
  }

  // 5. iyzico payment info
  console.log('\n5️⃣  iyzico Payment Integration...\n');
  
  if (process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY) {
    console.log('   ✅ IYZICO_API_KEY is set');
    console.log('   ✅ IYZICO_SECRET_KEY is set');
    console.log(`   🌐 Base URL: ${process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'}`);
    console.log('\n   💡 iyzico uses callback-based flow (no CLI needed).');
    console.log('      Callback URL: /api/iyzico/callback');
    console.log('      Test card: 5528790000000008');
  } else {
    console.log('   ❌ IYZICO_API_KEY or IYZICO_SECRET_KEY is not set');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ All checks passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run db:indexes (if you haven\'t already)');
  console.log('   2. Run: npm run dev');
  console.log('   3. Sign in at http://localhost:3000/login');
  console.log('   4. Access admin panel at http://localhost:3000/admin');
  
  if (!adminEmails) {
    console.log('\n⚠️  Remember to set ADMIN_EMAILS to access the admin panel!');
  }
  
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Doctor check failed:', error);
  process.exit(1);
});
