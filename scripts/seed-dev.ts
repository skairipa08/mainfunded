#!/usr/bin/env tsx
/**
 * Dev-only seed script
 * Creates test data for local development:
 * - Admin user (from ADMIN_EMAILS)
 * - Pending student profile
 * - Published campaign
 *
 * IMPORTANT: Only runs in development (NODE_ENV !== "production")
 */

import { getDb } from '../lib/db';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

async function seedDev() {
  // Safety check: only run in development
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Seed script can only run in development mode');
    console.error('   Set NODE_ENV !== "production" to run this script');
    process.exit(1);
  }

  console.log('🌱 Starting dev seed script...\n');

  try {
    const db = await getDb();
    
    // Get first admin email from ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    
    if (adminEmails.length === 0) {
      console.error('❌ ADMIN_EMAILS not set or empty');
      console.error('   Add at least one email to ADMIN_EMAILS in .env.local');
      process.exit(1);
    }
    
    const seedEmail = adminEmails[0];
    console.log(`📧 Using email: ${seedEmail}\n`);
    
    // Find user by email (user must have signed in at least once)
    const user = await db.collection('users').findOne(
      { email: seedEmail },
      { projection: { _id: 1, email: 1, name: 1, role: 1 } }
    );
    
    if (!user) {
      console.error('❌ User not found in database');
      console.error(`   Email: ${seedEmail}`);
      console.error('   Please sign in at /login first to create the user');
      process.exit(1);
    }
    
    const userId = user._id.toString();
    console.log(`✅ Found user: ${user.name || user.email} (${userId})`);
    
    // Set user role to admin
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { role: 'admin' } }
    );
    console.log('✅ Set user role to admin');
    
    // Check if student profile already exists
    let profile = await db.collection('student_profiles').findOne(
      { user_id: userId },
      { projection: { _id: 0 } }
    );
    
    if (profile) {
      console.log('⚠️  Student profile already exists, skipping creation');
    } else {
      // Create pending student profile
      profile = {
        _id: new ObjectId(),
        profile_id: `profile_${crypto.randomBytes(6).toString('hex')}`,
        user_id: userId,
        university: 'Test University',
        department: 'Computer Science',
        fieldOfStudy: 'Software Engineering',
        country: 'US',
        verificationStatus: 'pending',
        docs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.collection('student_profiles').insertOne(profile);
      console.log('✅ Created pending student profile');
    }
    
    // Check if campaign already exists for this user
    const existingCampaign = await db.collection('campaigns').findOne(
      { owner_id: userId },
      { projection: { campaign_id: 1 } }
    );
    
    if (existingCampaign) {
      console.log('⚠️  Campaign already exists for this user, skipping creation');
    } else {
      // Create published campaign
      const campaign = {
        campaign_id: `campaign_${crypto.randomBytes(6).toString('hex')}`,
        owner_id: userId,
        title: 'Test Campaign - Seed Data',
        story: 'This is a test campaign created by the seed script for local development.',
        category: 'Education',
        goal_amount: 5000,
        raised_amount: 0,
        donor_count: 0,
        status: 'published',
        country: profile.country || 'US',
        field_of_study: profile.fieldOfStudy || 'Software Engineering',
        cover_image: null,
        timeline: [],
        impact_log: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await db.collection('campaigns').insertOne(campaign);
      console.log(`✅ Created published campaign: ${campaign.campaign_id}`);
    }
    
    console.log('\n✅ Seed script completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Admin user: ${seedEmail}`);
    console.log(`   - Student profile: ${profile ? 'created/exists' : 'not created'}`);
    console.log(`   - Campaign: ${existingCampaign ? 'already exists' : 'created'}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Sign in at /login with the admin email');
    console.log('   2. Access admin panel at /admin');
    console.log('   3. Verify the student profile (if created)');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error running seed script:', error.message);
    
    if (error.message?.includes('MONGO_URL') || error.message?.includes('Mongo')) {
      console.error('\n💡 Tip: Make sure MONGO_URL is set and MongoDB is running');
      console.error('   Run: npm run doctor');
    }
    
    process.exit(1);
  }
}

seedDev();
