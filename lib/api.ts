const API = '/api';

async function apiCall(endpoint: string, options: RequestInit = {}, includeCredentials = true) {
  const url = `${API}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  if (includeCredentials) {
    config.credentials = 'include';
  }

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to parse error response as JSON
      let errorData: any;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
      } catch {
        // If not JSON, create a generic error
        errorData = {};
      }
      
      // Extract error message from various possible formats
      const errorMessage = 
        errorData?.error?.message || 
        errorData?.error?.code || 
        errorData?.detail || 
        errorData?.error || 
        errorData?.message ||
        `API request failed with status ${response.status}`;
      
      // Log detailed error in development only
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (!text) {
        // Empty response - return empty object
        return {};
      }
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Log parse error in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`[API Parse Error] ${endpoint}:`, parseError);
        }
        throw new Error('Invalid JSON response from server');
      }
    }
    
    // Non-JSON response
    const text = await response.text();
    return { data: text };
  } catch (error: any) {
    // Handle network errors and other fetch failures
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Network error: Unable to reach server');
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Network Error] ${endpoint}:`, error);
      }
      throw networkError;
    }
    
    // Re-throw other errors (including our Error from above)
    throw error;
  }
}

export const getCategories = () => apiCall('/static/categories', {}, false);
export const getCountries = () => apiCall('/static/countries', {}, false);
export const getFieldsOfStudy = () => apiCall('/static/fields-of-study', {}, false);

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

export const createCheckout = async (donationData: any) => {
  try {
    return await apiCall('/donations/checkout', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }, false);
  } catch (error: any) {
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
export const getCurrentUser = () => apiCall('/auth/me');
export const logout = () => apiCall('/auth/logout', { method: 'POST' });

export const createStudentProfile = (profileData: any) =>
  apiCall('/admin/students/profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });

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
