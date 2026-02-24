import { MongoClient, Db } from 'mongodb';

const dbName = process.env.DB_NAME || 'funded_db';

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  // Read MONGO_URL at runtime (NOT inlined at build time)
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    console.error('[DB] MONGO_URL is not set in environment variables.');
    console.error('[DB] Make sure MONGO_URL is configured in your deployment environment (e.g., Vercel Environment Variables).');
    return Promise.reject(new Error('MONGO_URL environment variable is not set. Please configure it in your deployment platform.'));
  }

  if (clientPromise) {
    return clientPromise;
  }

  const uri = mongoUrl;

  // Debug logging (safe - no secrets)
  try {
    const url = new URL(uri);
    console.log(`[DB] Connecting to MongoDB`);
    console.log(`[DB] host=${url.hostname} db=${dbName}`);
  } catch {
    console.log(`[DB] Connecting to MongoDB (could not parse URL for debug)`);
  }

  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function createIndexes() {
  const db = await getDb();

  try {
    await db.collection('users').createIndex('email', { unique: true });
    await db.collection('users').createIndex('role');

    await db.collection('sessions').createIndex('sessionToken', { unique: true });
    await db.collection('sessions').createIndex('userId');
    await db.collection('sessions').createIndex('expires');

    await db.collection('campaigns').createIndex('campaign_id', { unique: true });
    await db.collection('campaigns').createIndex('owner_id');
    await db.collection('campaigns').createIndex('status');
    await db.collection('campaigns').createIndex({ title: 'text', story: 'text' });

    await db.collection('donations').createIndex('donation_id', { unique: true });
    await db.collection('donations').createIndex('campaign_id');
    await db.collection('donations').createIndex('donor_id');
    await db.collection('donations').createIndex('iyzico_token', { unique: true, sparse: true });
    await db.collection('donations').createIndex('status');

    await db.collection('payment_transactions').createIndex('session_id', { unique: true });
    await db.collection('payment_transactions').createIndex('idempotency_key', { unique: true, sparse: true });

    await db.collection('student_profiles').createIndex('user_id', { unique: true });
    await db.collection('student_profiles').createIndex('verificationStatus');

    await db.collection('audit_logs').createIndex('audit_id', { unique: true });
    await db.collection('audit_logs').createIndex('actor_user_id');
    await db.collection('audit_logs').createIndex('target_type');
    await db.collection('audit_logs').createIndex('target_id');
    await db.collection('audit_logs').createIndex('action');
    await db.collection('audit_logs').createIndex('timestamp');
    await db.collection('audit_logs').createIndex('severity');

    // Verification System Indexes
    await db.collection('verifications').createIndex('verification_id', { unique: true });
    await db.collection('verifications').createIndex('user_id');
    await db.collection('verifications').createIndex('status');
    await db.collection('verifications').createIndex({ status: 1, assigned_to: 1 });
    await db.collection('verifications').createIndex('phone_hash');
    await db.collection('verifications').createIndex({ student_id_hash: 1, institution_name: 1 });
    await db.collection('verifications').createIndex('expires_at', { sparse: true });
    await db.collection('verifications').createIndex({ submitted_at: 1 }, { sparse: true });

    await db.collection('verification_documents').createIndex('doc_id', { unique: true });
    await db.collection('verification_documents').createIndex('verification_id');
    await db.collection('verification_documents').createIndex('sha256_hash');

    await db.collection('verification_events').createIndex('event_id', { unique: true });
    await db.collection('verification_events').createIndex('verification_id');
    await db.collection('verification_events').createIndex('occurred_at');

    await db.collection('verification_audit_logs').createIndex('audit_id', { unique: true });
    await db.collection('verification_audit_logs').createIndex('actor_id');
    await db.collection('verification_audit_logs').createIndex('target_id');
    await db.collection('verification_audit_logs').createIndex('timestamp');

    await db.collection('verification_notes').createIndex('note_id', { unique: true });
    await db.collection('verification_notes').createIndex('verification_id');

    await db.collection('iyzico_events').createIndex('event_id', { unique: true });
    await db.collection('iyzico_events').createIndex('processing_status');

    // Campaign Updates indexes
    await db.collection('campaign_updates').createIndex('campaign_id');
    await db.collection('campaign_updates').createIndex('created_at');

    // Donation Messages indexes
    await db.collection('donation_messages').createIndex('message_id', { unique: true });
    await db.collection('donation_messages').createIndex('campaign_id');
    await db.collection('donation_messages').createIndex('donation_id');
    await db.collection('donation_messages').createIndex('sender_id');
    await db.collection('donation_messages').createIndex('recipient_id');
    await db.collection('donation_messages').createIndex('created_at');

    // Exchange Rates indexes
    await db.collection('exchange_rates').createIndex({ from: 1, to: 1 }, { unique: true });
    await db.collection('exchange_rates').createIndex('updatedAt');

    // Notification indexes
    await db.collection('notifications').createIndex('id', { unique: true });
    await db.collection('notifications').createIndex('userId');
    await db.collection('notifications').createIndex({ userId: 1, read: 1 });
    await db.collection('notifications').createIndex({ userId: 1, timestamp: -1 });
    await db.collection('notifications').createIndex('type');
  } catch (error: any) {
    if (error.code !== 85 && error.codeName !== 'IndexOptionsConflict') {
      console.error('Error creating indexes:', error);
    }
  }
}
