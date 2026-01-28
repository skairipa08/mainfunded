
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Simple env loader
const loadEnv = () => {
    const files = ['.env', '.env.local'];
    files.forEach(file => {
        try {
            const envPath = path.resolve(process.cwd(), file);
            if (fs.existsSync(envPath)) {
                const envConfig = fs.readFileSync(envPath, 'utf8');
                envConfig.split('\n').forEach(line => {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        process.env[key.trim()] = value.trim();
                    }
                });
            }
        } catch (e) {
            console.warn(`Could not load ${file}`, e);
        }
    });
};

loadEnv();

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'funded_db';

if (!uri) {
    console.error('Error: MONGO_URL not found');
    process.exit(1);
}

async function verify() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to DB:', dbName);
        const db = client.db(dbName);

        const slugs = ["campaign_demo_baran_deniz", "campaign_demo_ozge_karabas"];

        // Note: The seed script uses 'campaign_id' as the identifier in the array, 
        // but let's check what fields are actually in the DB.
        // The user asked to check `slug` in their prompt, but the seed script uses `campaign_id`.
        // I will check `campaign_id` because that's what the seed works with.

        console.log('Querying for campaigns with campaign_id:', slugs);

        const docs = await db.collection('campaigns')
            .find({ campaign_id: { $in: slugs } })
            .project({
                title: 1,
                campaign_id: 1,
                status: 1,
                owner_id: 1,
                created_at: 1
            })
            .toArray();

        console.log(`Found ${docs.length} docs`);
        console.log(JSON.stringify(docs, null, 2));

        if (docs.length === 0) {
            console.error('No campaigns found! Checking count of all campaigns...');
            const count = await db.collection('campaigns').countDocuments();
            console.log('Total campaigns in DB:', count);
        }

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await client.close();
    }
}

verify();
