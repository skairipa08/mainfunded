#!/usr/bin/env tsx
/**
 * Database index creation script
 * Creates all required indexes for the FundEd database
 * 
 * Note: Environment variables are loaded from .env.local by Next.js automatically.
 * For standalone script execution, ensure variables are set or use dotenv if needed.
 */

import { createIndexes } from '../lib/db';

async function main() {
  console.log('📊 Creating database indexes...\n');

  try {
    await createIndexes();
    console.log('\n✅ Database indexes created successfully!');
    console.log('\n📝 Note: If indexes already existed, that\'s okay.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating indexes:', error.message);
    
    if (error.message?.includes('MONGO_URL') || error.message?.includes('Mongo')) {
      console.error('\n💡 Tip: Make sure MONGO_URL is set and MongoDB is running');
      console.error('   Run: npm run check:env');
    }
    
    process.exit(1);
  }
}

main();
