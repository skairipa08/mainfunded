/**
 * Seed script for development/demo data
 * 
 * Creates sample users, students, and verifications for testing.
 * 
 * Usage: node -r ts-node/register scripts/seed-verification.ts
 */

import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'funded_db';

function generateId(): string {
    return crypto.randomUUID();
}

function hashSensitive(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function now(): string {
    return new Date().toISOString();
}

async function seed() {
    console.log('🌱 Starting seed process...');

    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        console.log(`📦 Connected to ${DB_NAME}`);

        // 1. Create sample users
        console.log('\n👤 Creating sample users...');

        const sampleUsers = [
            {
                _id: generateId(),
                email: 'student1@example.com',
                name: 'Ahmet Yılmaz',
                role: 'student',
                image: null,
                emailVerified: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: generateId(),
                email: 'student2@example.com',
                name: 'Zeynep Kaya',
                role: 'student',
                image: null,
                emailVerified: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: generateId(),
                email: 'verified.student@example.com',
                name: 'Mehmet Demir',
                role: 'student',
                image: null,
                emailVerified: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: generateId(),
                email: 'admin@funded.com',
                name: 'Admin User',
                role: 'admin',
                image: null,
                emailVerified: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];

        // Insert users (upsert by email)
        for (const user of sampleUsers) {
            await db.collection('users').updateOne(
                { email: user.email },
                { $set: user },
                { upsert: true }
            );
            console.log(`  ✓ User: ${user.email} (${user.role})`);
        }

        // 2. Get the verified student user
        const verifiedStudent = await db.collection('users').findOne({
            email: 'verified.student@example.com'
        });
        const pendingStudent = await db.collection('users').findOne({
            email: 'student1@example.com'
        });

        if (!verifiedStudent || !pendingStudent) {
            throw new Error('Failed to find sample users');
        }

        // 3. Create sample verifications
        console.log('\n📋 Creating sample verifications...');

        // Verified student verification
        const verifiedVerification = {
            verification_id: generateId(),
            user_id: verifiedStudent._id.toString(),
            status: 'APPROVED',
            status_changed_at: now(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year

            first_name: 'Mehmet',
            last_name: 'Demir',
            date_of_birth: '1999-03-15',
            phone_hash: hashSensitive('+905551234567'),
            country: 'TR',
            city: 'Istanbul',

            institution_name: 'Istanbul Technical University',
            institution_country: 'TR',
            institution_type: 'university',
            student_id_hash: hashSensitive('2020123456'),
            enrollment_year: 2020,
            expected_graduation: 2024,
            degree_program: 'Computer Engineering',
            degree_level: 'bachelor',
            is_full_time: true,

            monthly_income: 0,
            has_scholarship: false,
            financial_need_statement: 'I need support for tuition and living expenses.',

            risk_score: 5,
            risk_flags: [],

            submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            reviewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: now(),
            __v: 2
        };

        // Pending student verification
        const pendingVerification = {
            verification_id: generateId(),
            user_id: pendingStudent._id.toString(),
            status: 'PENDING_REVIEW',
            status_changed_at: now(),

            first_name: 'Ahmet',
            last_name: 'Yılmaz',
            date_of_birth: '2001-07-22',
            phone_hash: hashSensitive('+905559876543'),
            country: 'TR',
            city: 'Ankara',

            institution_name: 'Middle East Technical University',
            institution_country: 'TR',
            institution_type: 'university',
            student_id_hash: hashSensitive('2021789012'),
            enrollment_year: 2021,
            expected_graduation: 2025,
            degree_program: 'Electrical Engineering',
            degree_level: 'bachelor',
            is_full_time: true,

            monthly_income: 500,
            has_scholarship: true,
            scholarship_amount: 2000,
            financial_need_statement: 'Scholarship covers tuition but I need help with housing.',

            risk_score: 15,
            risk_flags: ['VPN_PROXY_DETECTED'],

            submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: now(),
            __v: 1
        };

        // Insert verifications
        for (const verification of [verifiedVerification, pendingVerification]) {
            await db.collection('verifications').updateOne(
                { user_id: verification.user_id },
                { $set: verification },
                { upsert: true }
            );
            console.log(`  ✓ Verification: ${verification.first_name} ${verification.last_name} (${verification.status})`);
        }

        // 4. Create sample documents for verified student
        console.log('\n📎 Creating sample verification documents...');

        const sampleDocuments = [
            {
                doc_id: generateId(),
                verification_id: verifiedVerification.verification_id,
                document_type: 'STUDENT_ID',
                storage_path: `verifications/${verifiedStudent._id}/student_id.jpg`,
                file_name: 'ogrenci_kimlik.jpg',
                mime_type: 'image/jpeg',
                file_size_bytes: 125000,
                sha256_hash: hashSensitive('sample_student_id_hash'),
                is_verified: true,
                verified_at: now(),
                uploaded_at: verifiedVerification.created_at
            },
            {
                doc_id: generateId(),
                verification_id: verifiedVerification.verification_id,
                document_type: 'ENROLLMENT_LETTER',
                storage_path: `verifications/${verifiedStudent._id}/enrollment.pdf`,
                file_name: 'ogrenci_belgesi.pdf',
                mime_type: 'application/pdf',
                file_size_bytes: 450000,
                sha256_hash: hashSensitive('sample_enrollment_hash'),
                is_verified: true,
                verified_at: now(),
                uploaded_at: verifiedVerification.created_at
            },
            {
                doc_id: generateId(),
                verification_id: verifiedVerification.verification_id,
                document_type: 'GOVERNMENT_ID',
                storage_path: `verifications/${verifiedStudent._id}/gov_id.jpg`,
                file_name: 'nufus_cuzdani.jpg',
                mime_type: 'image/jpeg',
                file_size_bytes: 180000,
                sha256_hash: hashSensitive('sample_gov_id_hash'),
                is_verified: true,
                verified_at: now(),
                uploaded_at: verifiedVerification.created_at
            },
            {
                doc_id: generateId(),
                verification_id: verifiedVerification.verification_id,
                document_type: 'SELFIE_WITH_ID',
                storage_path: `verifications/${verifiedStudent._id}/selfie.jpg`,
                file_name: 'selfie_kimlik.jpg',
                mime_type: 'image/jpeg',
                file_size_bytes: 220000,
                sha256_hash: hashSensitive('sample_selfie_hash'),
                is_verified: true,
                verified_at: now(),
                uploaded_at: verifiedVerification.created_at
            }
        ];

        for (const doc of sampleDocuments) {
            await db.collection('verification_documents').updateOne(
                { doc_id: doc.doc_id },
                { $set: doc },
                { upsert: true }
            );
            console.log(`  ✓ Document: ${doc.document_type}`);
        }

        // 5. Create sample verification events
        console.log('\n📜 Creating sample verification events...');

        const sampleEvents = [
            {
                event_id: generateId(),
                verification_id: verifiedVerification.verification_id,
                event_type: 'CREATED',
                event_data: {},
                actor_type: 'USER',
                actor_id: verifiedStudent._id.toString(),
                occurred_at: verifiedVerification.created_at
            },
            {
                event_id: generateId(),
                verification_id: verifiedVerification.verification_id,
                event_type: 'SUBMITTED',
                event_data: {},
                actor_type: 'USER',
                actor_id: verifiedStudent._id.toString(),
                occurred_at: verifiedVerification.submitted_at
            },
            {
                event_id: generateId(),
                verification_id: verifiedVerification.verification_id,
                event_type: 'APPROVED',
                event_data: { from: 'PENDING_REVIEW', to: 'APPROVED' },
                actor_type: 'ADMIN',
                actor_id: 'admin-user-id',
                occurred_at: verifiedVerification.reviewed_at
            }
        ];

        for (const event of sampleEvents) {
            await db.collection('verification_events').insertOne(event);
        }
        console.log(`  ✓ Created ${sampleEvents.length} events`);

        // 6. Summary
        console.log('\n✅ Seed completed successfully!\n');
        console.log('Created:');
        console.log(`  • ${sampleUsers.length} users`);
        console.log(`  • 1 verified student (Mehmet Demir)`);
        console.log(`  • 1 pending verification (Ahmet Yılmaz)`);
        console.log(`  • ${sampleDocuments.length} documents`);
        console.log(`  • ${sampleEvents.length} events`);
        console.log('\nSample accounts:');
        console.log('  📧 admin@funded.com (admin)');
        console.log('  📧 verified.student@example.com (verified student)');
        console.log('  📧 student1@example.com (pending verification)');
        console.log('  📧 student2@example.com (no verification)');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

// Run if called directly
seed().catch(console.error);

export { seed };
