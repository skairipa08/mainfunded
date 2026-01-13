/**
 * Migration script to standardize user identity to NextAuth user.id
 * 
 * This script:
 * 1. Maps campaigns.owner_id and campaigns.student_id to canonical NextAuth user.id
 * 2. Maps student_profiles.user_id to canonical NextAuth user.id
 * 3. Uses email as the mapping key between legacy custom users and adapter users
 * 
 * Usage: npm run migrate:identity
 */

import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'funded_db';

interface MigrationStats {
  campaignsUpdated: number;
  campaignsSkipped: number;
  profilesUpdated: number;
  profilesSkipped: number;
  unresolvedMappings: string[];
}

async function migrateIdentity() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const stats: MigrationStats = {
      campaignsUpdated: 0,
      campaignsSkipped: 0,
      profilesUpdated: 0,
      profilesSkipped: 0,
      unresolvedMappings: [],
    };
    
    // Step 1: Build email -> NextAuth user.id mapping from adapter users
    const adapterUsers = await db.collection('users').find({}).toArray();
    const emailToUserIdMap = new Map<string, string>();
    
    adapterUsers.forEach(user => {
      if (user.email) {
        emailToUserIdMap.set(user.email.toLowerCase(), user._id.toString());
      }
    });
    
    console.log(`Found ${adapterUsers.length} adapter users`);
    console.log(`Built email mapping for ${emailToUserIdMap.size} users`);
    
    // Step 2: Build legacy user_id -> email mapping (if custom users collection exists)
    let legacyUserMap = new Map<string, string>();
    try {
      const legacyUsers = await db.collection('users').find({ user_id: { $exists: true } }).toArray();
      legacyUsers.forEach((user: any) => {
        if (user.user_id && user.email) {
          legacyUserMap.set(user.user_id, user.email.toLowerCase());
        }
      });
      console.log(`Found ${legacyUsers.length} legacy user records with user_id`);
    } catch (error) {
      console.log('No legacy users collection found (expected)');
    }
    
    // Step 3: Migrate campaigns
    console.log('\nMigrating campaigns...');
    const campaigns = await db.collection('campaigns').find({}).toArray();
    
    for (const campaign of campaigns) {
      let needsUpdate = false;
      const update: any = {};
      
      // Check owner_id
      if (campaign.owner_id && !ObjectId.isValid(campaign.owner_id)) {
        // Legacy format - try to map
        const email = legacyUserMap.get(campaign.owner_id);
        if (email) {
          const canonicalId = emailToUserIdMap.get(email);
          if (canonicalId) {
            update.owner_id = canonicalId;
            needsUpdate = true;
          } else {
            stats.unresolvedMappings.push(`campaign ${campaign.campaign_id}: owner_id ${campaign.owner_id}`);
          }
        } else {
          stats.unresolvedMappings.push(`campaign ${campaign.campaign_id}: owner_id ${campaign.owner_id}`);
        }
      } else if (campaign.owner_id && ObjectId.isValid(campaign.owner_id)) {
        // Already canonical - verify it exists
        const exists = adapterUsers.some(u => u._id.toString() === campaign.owner_id);
        if (!exists) {
          stats.unresolvedMappings.push(`campaign ${campaign.campaign_id}: invalid owner_id ${campaign.owner_id}`);
        }
      }
      
      // Remove legacy student_id if it exists and differs from owner_id
      if (campaign.student_id && campaign.student_id !== campaign.owner_id) {
        update.$unset = { student_id: '' };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await db.collection('campaigns').updateOne(
          { campaign_id: campaign.campaign_id },
          { $set: update, ...(update.$unset && { $unset: update.$unset }) }
        );
        stats.campaignsUpdated++;
      } else {
        stats.campaignsSkipped++;
      }
    }
    
    // Step 4: Migrate student_profiles
    console.log('\nMigrating student profiles...');
    const profiles = await db.collection('student_profiles').find({}).toArray();
    
    for (const profile of profiles) {
      const currentUserId = profile.user_id || profile.userId;
      
      if (!currentUserId) {
        stats.profilesSkipped++;
        continue;
      }
      
      // Check if already canonical
      if (ObjectId.isValid(currentUserId)) {
        const exists = adapterUsers.some(u => u._id.toString() === currentUserId);
        if (exists) {
          // Already canonical - standardize field name
          if (profile.userId && profile.userId !== currentUserId) {
            await db.collection('student_profiles').updateOne(
              { _id: profile._id },
              { $unset: { userId: '' } }
            );
          }
          stats.profilesSkipped++;
          continue;
        }
      }
      
      // Legacy format - try to map
      const email = legacyUserMap.get(currentUserId);
      if (email) {
        const canonicalId = emailToUserIdMap.get(email);
        if (canonicalId) {
          await db.collection('student_profiles').updateOne(
            { _id: profile._id },
            { 
              $set: { user_id: canonicalId },
              $unset: { userId: '' }
            }
          );
          stats.profilesUpdated++;
        } else {
          stats.unresolvedMappings.push(`profile ${profile._id}: user_id ${currentUserId}`);
          stats.profilesSkipped++;
        }
      } else {
        stats.unresolvedMappings.push(`profile ${profile._id}: user_id ${currentUserId}`);
        stats.profilesSkipped++;
      }
    }
    
    // Step 5: Ensure indexes on student_profiles
    console.log('\nCreating indexes...');
    try {
      await db.collection('student_profiles').createIndex({ user_id: 1 }, { unique: true });
      await db.collection('student_profiles').createIndex({ verificationStatus: 1 });
      console.log('Indexes created successfully');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('Indexes already exist');
      } else {
        console.error('Error creating indexes:', error.message);
      }
    }
    
    // Print summary
    console.log('\n=== Migration Summary ===');
    console.log(`Campaigns updated: ${stats.campaignsUpdated}`);
    console.log(`Campaigns skipped: ${stats.campaignsSkipped}`);
    console.log(`Profiles updated: ${stats.profilesUpdated}`);
    console.log(`Profiles skipped: ${stats.profilesSkipped}`);
    console.log(`Unresolved mappings: ${stats.unresolvedMappings.length}`);
    
    if (stats.unresolvedMappings.length > 0) {
      console.log('\nUnresolved mappings:');
      stats.unresolvedMappings.slice(0, 10).forEach(mapping => {
        console.log(`  - ${mapping}`);
      });
      if (stats.unresolvedMappings.length > 10) {
        console.log(`  ... and ${stats.unresolvedMappings.length - 10} more`);
      }
    }
    
    console.log('\nMigration complete!');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run migration
migrateIdentity().catch(console.error);
