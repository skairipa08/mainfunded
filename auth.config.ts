import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: () => null, // Actual auth logic is in auth.ts
    }),
    Credentials({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        code: { label: 'Code', type: 'text' },
      },
      authorize: () => null, // Actual auth logic is in auth.ts
    }),
  ],
  callbacks: {
    async signIn() {
      // Allow all Google sign-ins
      return true;
    },
    async session({ session, user }) {
      // Include user ID and role in session
      if (session.user && user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role || 'user';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
} satisfies NextAuthConfig;
