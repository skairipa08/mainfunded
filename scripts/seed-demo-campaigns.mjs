
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple env loader
const loadEnv = () => {
    // Priority: .env.local > .env
    // We load .env first, then override with .env.local
    const files = ['.env', '.env.local'];
    files.forEach(file => {
        try {
            const envPath = path.resolve(process.cwd(), file);
            if (fs.existsSync(envPath)) {
                const envConfig = fs.readFileSync(envPath, 'utf8');
                envConfig.split(/\r?\n/).forEach(line => {
                    // Skip comments and empty lines
                    if (!line || line.trim().startsWith('#')) return;

                    // Handle key=value structure
                    const match = line.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        const key = match[1].trim();
                        let value = match[2].trim();

                        // Remove quotes if present
                        if ((value.startsWith('"') && value.endsWith('"')) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.slice(1, -1);
                        }

                        process.env[key] = value;
                    }
                });
                console.log(`Loaded environment from ${file}`);
            }
        } catch (e) {
            console.warn(`Could not load ${file}`, e);
        }
    });

    if (process.env.MONGO_URL) {
        // Mask the password if present for security in logs
        const maskedUrl = process.env.MONGO_URL.replace(/:([^:@]+)@/, ':****@');
        console.log('MONGO_URL loaded:', maskedUrl);
    } else {
        console.error('MONGO_URL is NOT set in environment variables!');
    }
};

loadEnv();

const uri = process.env.MONGO_URL;
if (uri) {
    console.log('Using Mongo Connection:', uri.includes('localhost') ? 'localhost' : 'Remote');
}
const dbName = process.env.DB_NAME || 'funded_db';

if (!uri) {
    console.error('Error: MONGO_URL not found in .env.local');
    process.exit(1);
}

const CAMPAIGNS = [
    {
        campaign_id: 'campaign_demo_baran_deniz',
        owner_id: 'demo_user_baran_deniz',
        title: "Baran's Lab & Capstone Project Support",
        story: `Hi, I’m Baran, an Electrical & Electronics Engineering student at Duzce University. This semester I’m working on my capstone and lab projects and need essential parts like components, sensors, and PCB fabrication. I also need a few basic measurement tools and software/license access to complete the work properly. Because the semester schedule is tight, this support directly helps me finish on time. I will share progress updates and a clear breakdown of spending. Your help directly translates into the ability to build and deliver.

---
[Turkish / Türkçe]
Merhaba, ben Baran. Duzce Universitesi Elektrik Elektronik Muhendisligi ogrencisiyim. Bu donem bitirme projem ve laboratuvar calismalarim icin elektronik komponentler, sensorler ve PCB uretimi gibi temel kalemlere ihtiyacim var. Ayrica test/olcum icin gerekli bazi araclar ve proje surecinde kullanacagim yazilim/lisans maliyetleri bulunuyor. Donem takvimi sikisik oldugu icin bu destek, projemi zamaninda tamamlamam icin kritik. Surec boyunca gelismeleri ve harcama kalemlerini duzenli paylasacagim. Desteginiz benim icin dogrudan “calisabilme imkani” demek.

**Use of Funds:**
- $350 components & sensors
- $300 PCB fabrication + assembly
- $250 measurement/tools
- $200 software/license
- $150 shipping & contingency`,
        category: 'education',
        goal_amount: 1250,
        raised_amount: 120,
        donor_count: 5,
        status: 'published',
        country: 'Turkey',
        field_of_study: 'Engineering',
        funding_type: 'ONE_TIME',
        duration_days: 45,
        cover_image: null,
        studentPhotos: [
            'https://picsum.photos/seed/baran1/400/300',
            'https://picsum.photos/seed/baran2/400/300',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // We explicitly store student details in campaign or profiles. 
        // The GET route joins with users/student_profiles. 
        // So we MUST also seed the User and StudentProfile for these campaigns to be fully visible.
    },
    {
        campaign_id: 'campaign_demo_ozge_karabas',
        owner_id: 'demo_user_ozge_karabas',
        title: "Monthly Scholarship for Ozge: Transportation & Study Resources",
        story: `Hi, I’m Ozge, a Materials & Metallurgy Engineering student at Sakarya University. Student life isn’t only about classes—transportation, lab work, printing, and study materials create ongoing monthly costs. That’s why a stable monthly scholarship makes more sense for me than a one-time donation. My goal is to cover transportation, essential resources, and small lab-related expenses so I can stay consistent with coursework and lab practice. I’ll share short monthly updates and a term-end summary of progress. Your support helps me keep going without interruptions.

---
[Turkish / Türkçe]
Merhaba, ben Ozge. Sakarya Universitesi Malzeme Metalurji Muhendisligi ogrencisiyim. Universite hayati sadece derslerden ibaret degil; ulasim, laboratuvar calismalari, yazdirma ve kaynak/kitap gibi masraflar her ay duzenli devam ediyor. Bu nedenle tek seferlik bir destekten cok, daha stabil bir sekilde aylik burs destegi benim icin daha anlamli. Aylik hedefim; okula ulasim, gerekli ders kaynaklari ve laboratuvarla ilgili kucuk giderleri karsilamak. Her ay kisa bir ilerleme notu ve donem sonunda genel bir durum ozeti paylasacagim. Amacim, derslere ve laboratuvar calismalarina kesintisiz devam edebilmek.

**Monthly Breakdown:**
- $85 transportation
- $55 books/resources
- $25 printing/materials
- $15 lab-related small expenses
= $180 total`,
        category: 'scholarship',
        goal_amount: 180,
        raised_amount: 45,
        donor_count: 3,
        status: 'published',
        country: 'Turkey',
        field_of_study: 'Engineering',
        funding_type: 'MONTHLY',
        monthly_target: 180,
        min_monthly: 5,
        duration_months: 6,
        cover_image: null,
        studentPhotos: [], // Empty to demo the empty state
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const USERS = [
    {
        _id: 'demo_user_baran_deniz',
        // Note: _id in MongoDB is ObjectId usually, but the app seems to use string IDs from NextAuth or similar. 
        // We will try to force string IDs if collection allows, or we map them. 
        // The GET route does `new ObjectId(id)` so it EXPECTS ObjectId for _id in users collection.
        // We must handle this carefully. We will generate specific ObjectIds for them.
        name: 'Baran Deniz',
        email: 'baran.deniz@example.com',
        image: null,
        role: 'student'
    },
    {
        _id: 'demo_user_ozge_karabas',
        name: 'Ozge Karabas',
        email: 'ozge.karabas@example.com',
        image: null,
        role: 'student'
    }
];

// Hex strings for ObjectIds to be deterministic
const BARAN_ID_HEX = '000000000000000000000001';
const OZGE_ID_HEX = '000000000000000000000002';

async function seed() {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);

        // 1. Seed Users (Required for "enriched" response)
        // We use updateOne with upsert to be idempotent

        // User 1: Baran
        await db.collection('users').updateOne(
            { email: 'baran.deniz@example.com' },
            {
                $set: {
                    name: 'Baran Deniz',
                    email: 'baran.deniz@example.com',
                    image: null,
                    role: 'student'
                },
                $setOnInsert: { _id: new ObjectId(BARAN_ID_HEX) }
            },
            { upsert: true }
        );
        console.log('Seeded User: Baran');

        // User 2: Ozge
        await db.collection('users').updateOne(
            { email: 'ozge.karabas@example.com' },
            {
                $set: {
                    name: 'Ozge Karabas',
                    email: 'ozge.karabas@example.com',
                    image: null,
                    role: 'student'
                },
                $setOnInsert: { _id: new ObjectId(OZGE_ID_HEX) }
            },
            { upsert: true }
        );
        console.log('Seeded User: Ozge');


        // 2. Seed Student Profiles (Required for filtering country/field)
        await db.collection('student_profiles').updateOne(
            { user_id: BARAN_ID_HEX }, // Match using the hex ID string (route.ts casts owner_id to ObjectId for User but uses string for Profile match?) - Checking route code: 
            // route.ts: const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
            // route.ts: const profileMap = new Map(studentProfiles.map((p: any) => [p.user_id, p]));
            // It seems `user_id` in student_profiles is stored as a string match to the user ID.
            {
                $set: {
                    user_id: BARAN_ID_HEX,
                    country: 'Turkey',
                    fieldOfStudy: 'Engineering',
                    field_of_study: 'Engineering', // Redundant for safety
                    university: 'Duzce University',
                    verificationStatus: 'verified',
                    verification_status: 'verified'
                }
            },
            { upsert: true }
        );
        console.log('Seeded Profile: Baran');

        await db.collection('student_profiles').updateOne(
            { user_id: OZGE_ID_HEX },
            {
                $set: {
                    user_id: OZGE_ID_HEX,
                    country: 'Turkey',
                    fieldOfStudy: 'Engineering',
                    field_of_study: 'Engineering',
                    university: 'Sakarya University',
                    verificationStatus: 'verified',
                    verification_status: 'verified'
                }
            },
            { upsert: true }
        );
        console.log('Seeded Profile: Ozge');


        // 3. Seed Campaigns
        // We update owner_id to match the IDs we just ensured
        const baranCampaign = CAMPAIGNS[0];
        baranCampaign.owner_id = BARAN_ID_HEX;

        await db.collection('campaigns').updateOne(
            { campaign_id: baranCampaign.campaign_id },
            { $set: baranCampaign },
            { upsert: true }
        );
        console.log(`Seeded Campaign: ${baranCampaign.title}`);

        const ozgeCampaign = CAMPAIGNS[1];
        ozgeCampaign.owner_id = OZGE_ID_HEX;

        await db.collection('campaigns').updateOne(
            { campaign_id: ozgeCampaign.campaign_id },
            { $set: ozgeCampaign },
            { upsert: true }
        );
        console.log(`Seeded Campaign: ${ozgeCampaign.title}`);

        console.log('Done!');
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seed();
