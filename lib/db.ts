import { MongoClient, Db } from 'mongodb';

const dbName = process.env.DB_NAME || 'funded_db';

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  // During build time, Next.js may try to collect page data
  // Return a rejected promise that will be caught at runtime
  if (!process.env.MONGO_URL) {
    return Promise.reject(new Error('Please add your Mongo URI to .env.local'));
  }

  if (clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGO_URL;

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
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
    // NextAuth adapter users collection
    await db.collection('users').createIndex('email', { unique: true });
    await db.collection('users').createIndex('role');
    
    // NextAuth adapter sessions collection
    await db.collection('sessions').createIndex('sessionToken', { unique: true });
    await db.collection('sessions').createIndex('userId');
    await db.collection('sessions').createIndex('expires');
    
    // Campaigns - use owner_id (canonical NextAuth user.id)
    await db.collection('campaigns').createIndex('campaign_id', { unique: true });
    await db.collection('campaigns').createIndex('owner_id');
    await db.collection('campaigns').createIndex('status');
    await db.collection('campaigns').createIndex({ title: 'text', story: 'text' });
    
    // Donations
    await db.collection('donations').createIndex('donation_id', { unique: true });
    await db.collection('donations').createIndex('campaign_id');
    await db.collection('donations').createIndex('donor_id');
    await db.collection('donations').createIndex('stripe_session_id', { unique: true, sparse: true });
    await db.collection('donations').createIndex('status');
    
    // Payment transactions
    await db.collection('payment_transactions').createIndex('session_id', { unique: true });
    await db.collection('payment_transactions').createIndex('idempotency_key', { unique: true, sparse: true });
    
    // Student profiles - use user_id (canonical NextAuth user.id) and verificationStatus
    await db.collection('student_profiles').createIndex('user_id', { unique: true });
    await db.collection('student_profiles').createIndex('verificationStatus');
    
    // Audit logs
    await db.collection('audit_logs').createIndex('audit_id', { unique: true });
    await db.collection('audit_logs').createIndex('actor_user_id');
    await db.collection('audit_logs').createIndex('target_type');
    await db.collection('audit_logs').createIndex('target_id');
    
    console.log('Database indexes created successfully');
  } catch (error: any) {
    // Ignore index already exists errors (code 85 in MongoDB)
    if (error.code !== 85 && error.codeName !== 'IndexOptionsConflict') {
      console.error('Error creating indexes:', error);
    } else {
      console.log('Indexes already exist or conflict (this is okay)');
    }
  }
}
