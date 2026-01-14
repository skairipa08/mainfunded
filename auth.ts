import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient, ObjectId } from 'mongodb';
import { authConfig } from './auth.config';
import { getDb } from './lib/db';

function getMongoClientPromise(): Promise<MongoClient> {
  if (typeof window !== 'undefined') {
    return Promise.reject(new Error('MongoDB client can only be created on the server'));
  }

  if (!process.env.MONGO_URL) {
    return Promise.reject(new Error('MONGO_URL is not configured'));
  }

  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = globalThis as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(process.env.MONGO_URL);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  const client = new MongoClient(process.env.MONGO_URL);
  return client.connect();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // @ts-expect-error - Type mismatch between @auth/core versions, adapter works correctly at runtime
  adapter: MongoDBAdapter(getMongoClientPromise),
  session: { strategy: 'database' },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as any).id = user.id;
        
        const _id = typeof user.id === 'string' ? new ObjectId(user.id) : user.id;
        const db = await getDb();
        const adapterUser = await db.collection('users').findOne(
          { _id },
          { projection: { role: 1 } }
        );
        
        (session.user as any).role = adapterUser?.role || 'user';
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const db = await getDb();
        const email = user.email.toLowerCase();
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        
        const role = adminEmails.includes(email) ? 'admin' : 'user';
        await db.collection('users').updateOne(
          { email },
          { $set: { role } }
        );
      }
    },
  },
});
