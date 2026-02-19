import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const isProduction = process.env.NODE_ENV === 'production';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ['state', 'pkce'],
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
    async signIn() {
      return true; // Allow all sign-ins
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        token.role = adminEmails.includes(user.email?.toLowerCase() || '') ? 'admin' : 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || 'user';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
});
