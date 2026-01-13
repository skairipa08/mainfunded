// API service for FundEd platform
const API = '/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}, includeCredentials = true) {
  const url = `${API}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  // Only include credentials for auth-required endpoints
  if (includeCredentials) {
    config.credentials = 'include';
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || 'API request failed');
  }

  return data;
}

// Static data endpoints (no auth needed)
export const getCategories = () => apiCall('/static/categories', {}, false);
export const getCountries = () => apiCall('/static/countries', {}, false);
export const getFieldsOfStudy = () => apiCall('/static/fields-of-study', {}, false);

// Campaign endpoints (public listing doesn't need auth)
export const getCampaigns = (params: Record<string, any> = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  return apiCall(`/campaigns${queryString ? `?${queryString}` : ''}`, {}, false);
};

export const getCampaign = (campaignId: string) => apiCall(`/campaigns/${campaignId}`, {}, false);

export const getMyCampaigns = () => apiCall('/campaigns/my');

export const createCampaign = (campaignData: any) =>
  apiCall('/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignData),
  });

export const updateCampaign = (campaignId: string, campaignData: any) =>
  apiCall(`/campaigns/${campaignId}`, {
    method: 'PUT',
    body: JSON.stringify(campaignData),
  });

// Donation endpoints (checkout doesn't need auth, but status polling may)
export const createCheckout = async (donationData: any) => {
  try {
    return await apiCall('/donations/checkout', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }, false);
  } catch (error: any) {
    // Re-throw with better error structure
    throw {
      message: error?.message || 'Payment processing failed',
      response: {
        data: {
          error: {
            message: error?.message || 'Payment processing failed',
          },
        },
      },
    };
  }
};

export const getPaymentStatus = (sessionId: string) =>
  apiCall(`/donations/status/${sessionId}`, {}, false);

export const getMyDonations = () => apiCall('/donations/my');

// Auth endpoints
export const getCurrentUser = () => apiCall('/auth/me');

export const logout = () =>
  apiCall('/auth/logout', { method: 'POST' });

// Student profile endpoints
export const createStudentProfile = (profileData: any) =>
  apiCall('/admin/students/profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });

// Admin endpoints
export const getPendingStudents = () => apiCall('/admin/students/pending');
export const getAllStudents = (status?: string) =>
  apiCall(`/admin/students${status ? `?status=${status}` : ''}`);
export const verifyStudent = (userId: string, action: string) =>
  apiCall(`/admin/students/${userId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ action }),
  });
export const getAdminCampaigns = (status?: string) =>
  apiCall(`/admin/campaigns${status ? `?status=${status}` : ''}`);
export const getAdminStats = () => apiCall('/admin/stats');

// Verification statuses (kept for UI display)
export const verificationStatuses = {
  pending: {
    label: 'Pending Verification',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: 'Clock'
  },
  verified: {
    label: 'Verified Student',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: 'CheckCircle2'
  },
  rejected: {
    label: 'Verification Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: 'XCircle'
  }
};
