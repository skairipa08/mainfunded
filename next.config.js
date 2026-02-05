/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ⚠️ DO NOT add server-only env vars here!
  // The `env` property inlines values at BUILD TIME via webpack DefinePlugin,
  // meaning runtime environment variables (e.g. on Vercel) are IGNORED.
  // It also exposes secrets to the client bundle.
  //
  // Server-side code (API routes) already reads process.env at runtime.
  // Client-side code that needs env vars should use NEXT_PUBLIC_* prefix in .env files.

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore optional dependencies that may not be installed
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@sentry/nextjs': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
