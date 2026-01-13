// API client - use NextAuth session cookies automatically
// This replaces the old API service

export * from '../../../lib/api-client';

// Re-export for backward compatibility during migration
export { campaignsAPI as getCampaigns, campaignsAPI as getCampaign } from '../../../lib/api-client';
export { authAPI as getCurrentUser, authAPI as logout } from '../../../lib/api-client';
export { donationsAPI as createCheckout, donationsAPI as getPaymentStatus } from '../../../lib/api-client';
export { adminAPI as getPendingStudents, adminAPI as verifyStudent, adminAPI as getAdminStats } from '../../../lib/api-client';
export { staticAPI as getCategories, staticAPI as getCountries, staticAPI as getFieldsOfStudy } from '../../../lib/api-client';
