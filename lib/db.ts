import { MongoClient, Db } from 'mongodb';

const dbName = process.env.DB_NAME || 'funded_db';

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!process.env.MONGO_URL) {
    return Promise.reject(new Error('Please add your Mongo URI to .env.local'));
  }

  if (clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGO_URL;

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
    await db.collection('donations').createIndex('stripe_session_id', { unique: true, sparse: true });
    await db.collection('donations').createIndex('status');
    
    await db.collection('payment_transactions').createIndex('session_id', { unique: true });
    await db.collection('payment_transactions').createIndex('idempotency_key', { unique: true, sparse: true });
    
    await db.collection('student_profiles').createIndex('user_id', { unique: true });
    await db.collection('student_profiles').createIndex('verificationStatus');
    
    await db.collection('audit_logs').createIndex('audit_id', { unique: true });
    await db.collection('audit_logs').createIndex('actor_user_id');
    await db.collection('audit_logs').createIndex('target_type');
    await db.collection('audit_logs').createIndex('target_id');
  } catch (error: any) {
    if (error.code !== 85 && error.codeName !== 'IndexOptionsConflict') {
      console.error('Error creating indexes:', error);
    }
  }
}
