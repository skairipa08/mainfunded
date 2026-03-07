import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr'
});

export const config = {
  // Skip all paths that should not be internationalized.
  // This matches all paths except api routes, _next, and files with an extension.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
