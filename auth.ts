import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient, ObjectId } from 'mongodb';
import { authConfig } from './auth.config';
import { getDb } from './lib/db';

let clientPromise: Promise<MongoClient> | null = null;

function getMongoClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  if (!process.env.MONGO_URL) {
    clientPromise = Promise.reject(new Error('MONGO_URL is not configured'));
    return clientPromise;
  }

  if (typeof window !== 'undefined') {
    clientPromise = Promise.reject(new Error('MongoDB client can only be created on the server'));
    return clientPromise;
  }

  const client = new MongoClient(process.env.MONGO_URL);
  clientPromise = client.connect();
  return clientPromise;
}

const mongoClientPromise = new Promise<MongoClient>((resolve, reject) => {
  Promise.resolve().then(() => {
    try {
      resolve(getMongoClientPromise());
    } catch (error) {
      reject(error);
    }
  });
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // @ts-expect-error - Type mismatch between @auth/core versions, adapter works correctly at runtime
  adapter: MongoDBAdapter(mongoClientPromise),
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
