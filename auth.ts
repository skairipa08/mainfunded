import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { findUserByEmail, verifyPassword, findOrCreateUserByPhone, verifyOTP } from '@/lib/auth-utils';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

const isProduction = process.env.NODE_ENV === 'production';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ['state', 'pkce'],
    }),
    Credentials({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string;
          const password = credentials?.password as string;

          if (!email || !password) return null;

          const user = await findUserByEmail(email);
          if (!user || !user.password) return null;

          const isValid = await verifyPassword(password, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email,
            image: user.image || null,
          };
        } catch (error) {
          console.error('Credentials auth error:', error);
          return null;
        }
      },
    }),
    Credentials({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const phone = credentials?.phone as string;
          const code = credentials?.code as string;

          if (!phone || !code) return null;

          const isValid = await verifyOTP(phone, code);
          if (!isValid) return null;

          const user = await findOrCreateUserByPhone(phone);

          return {
            id: user._id.toString(),
            email: user.email || undefined,
            name: user.name || `User ${phone.slice(-4)}`,
            image: user.image || null,
          };
        } catch (error) {
          console.error('Phone OTP auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    state: {
      name: isProduction ? '__Secure-authjs.state' : 'authjs.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: 900,
      },
    },
    csrfToken: {
      name: isProduction ? '__Host-authjs.csrf-token' : 'authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: isProduction ? '__Secure-authjs.callback-url' : 'authjs.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth users, ensure a user document exists in MongoDB
      if (account?.provider === 'google' && user?.email) {
        try {
          const db = await getDb();
          const existing = await db.collection('users').findOne({ email: user.email.toLowerCase() });
          if (!existing) {
            const result = await db.collection('users').insertOne({
              email: user.email.toLowerCase(),
              name: user.name || user.email,
              image: user.image || null,
              role: 'user',
              accountType: 'student',
              provider: 'google',
              emailVerified: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Set user.id to the MongoDB _id so the JWT gets the correct ID
            (user as any).id = result.insertedId.toString();
          } else {
            // Set user.id to the existing MongoDB document's _id
            (user as any).id = existing._id.toString();
          }
        } catch (err) {
          console.error('Error ensuring Google user in DB:', err);
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        token.role = adminEmails.includes(user.email?.toLowerCase() || '') ? 'admin' : 'user';

        // Load accountType from DB
        try {
          const db = await getDb();
          const dbUser = await db.collection('users').findOne(
            { _id: new ObjectId(user.id as string) },
            { projection: { accountType: 1 } }
          );
          token.accountType = dbUser?.accountType || 'student';
        } catch {
          token.accountType = 'student';
        }
      }

      // When session update() is called, refresh name from DB
      if (trigger === 'update' && token.id) {
        try {
          const db = await getDb();
          const dbUser = await db.collection('users').findOne(
            { _id: new ObjectId(token.id as string) },
            { projection: { name: 1 } }
          );
          if (dbUser?.name) {
            token.name = dbUser.name;
          }
        } catch (err) {
          console.error('JWT update refresh error:', err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || 'user';
        (session.user as any).accountType = token.accountType || 'student';
        // Always sync name from token (updated from DB)
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
});
