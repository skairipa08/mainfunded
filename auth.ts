import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient, ObjectId } from 'mongodb';
import { authConfig } from './auth.config';
import { getDb } from './lib/db';

const client = new MongoClient(process.env.MONGO_URL!);
const clientPromise = Promise.resolve(client.connect());

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // @ts-expect-error - Type mismatch between @auth/core versions, adapter works correctly at runtime
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'database' },
  callbacks: {
    async session({ session, user }) {
      // Database session strategy - user is the database user from NextAuth adapter
      if (session.user && user) {
        // Use NextAuth adapter user.id as canonical identifier
        (session.user as any).id = user.id;
        
        // Get role from adapter users collection
        // user.id may be string or ObjectId - handle both cases
        const _id = typeof user.id === 'string' ? new ObjectId(user.id) : user.id;
        
        const db = await getDb();
        const adapterUser = await db.collection('users').findOne(
          { _id },
          { projection: { role: 1 } }
        );
        
        // Default role is 'user' if not set
        (session.user as any).role = adapterUser?.role || 'user';
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      // Promote to admin if email is in ADMIN_EMAILS
      if (account?.provider === 'google' && user.email) {
        const db = await getDb();
        const email = user.email.toLowerCase();
        
        // Get admin emails from env
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        
        const isAdmin = adminEmails.includes(email);
        
        if (isAdmin) {
          // Update adapter users collection to set role="admin"
          await db.collection('users').updateOne(
            { email },
            { $set: { role: 'admin' } }
          );
        } else {
          // Ensure role field exists (default to 'user')
          // Use $set with upsert:false or just $set - the user already exists from adapter
          await db.collection('users').updateOne(
            { email },
            { $set: { role: 'user' } }
          );
        }
      }
    },
  },
});
