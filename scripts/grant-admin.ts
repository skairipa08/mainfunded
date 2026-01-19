/**
 * Grant Admin Role Script
 * 
 * This script grants admin role to a specific email address.
 * 
 * Usage: node -r ts-node/register scripts/grant-admin.ts <email>
 * Example: node -r ts-node/register scripts/grant-admin.ts baran08dnz@gmail.com
 */

import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'funded_db';

async function grantAdmin(email: string) {
    if (!email) {
        console.error('Usage: node -r ts-node/register scripts/grant-admin.ts <email>');
        process.exit(1);
    }

    console.log(`🔐 Granting admin role to: ${email}`);

    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        // Check if user exists
        const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });

        if (existingUser) {
            // Update existing user
            await db.collection('users').updateOne(
                { email: email.toLowerCase() },
                { $set: { role: 'admin', updatedAt: new Date() } }
            );
            console.log(`✅ Updated existing user to admin: ${email}`);
            console.log(`   Previous role: ${existingUser.role || 'user'}`);
        } else {
            // Create placeholder user (will be properly created on first login)
            await db.collection('users').insertOne({
                email: email.toLowerCase(),
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ Created admin user: ${email}`);
            console.log(`   Note: User account will be fully created on first Google login`);
        }

        console.log(`\n🎉 Done! ${email} now has admin access.`);
        console.log(`   Login at: ${process.env.AUTH_URL || 'http://localhost:3000'}/login`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

// Get email from command line args
const email = process.argv[2] || 'baran08dnz@gmail.com';
grantAdmin(email);
