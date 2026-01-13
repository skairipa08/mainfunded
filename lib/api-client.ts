// Frontend API client for Next.js App Router
// Uses NextAuth session cookies automatically

const API_BASE = '/api';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  pagination?: any;
}

async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for NextAuth session
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle error responses
      throw new Error(data.error?.message || data.error || 'API request failed');
    }

    return data;
  } catch (error: any) {
    // Re-throw with better error message
    throw new Error(error.message || 'API request failed');
  }
}

// Auth endpoints
export const authAPI = {
  me: () => apiCall('/auth/me'),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
};

// Campaign endpoints
export const campaignsAPI = {
  list: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/campaigns${query ? `?${query}` : ''}`);
  },
  get: (id: string) => apiCall(`/campaigns/${id}`),
  create: (data: any) => apiCall('/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  publish: (id: string) => apiCall(`/campaigns/${id}/publish`, {
    method: 'POST',
  }),
  my: () => apiCall('/campaigns/my'),
};

// Donation endpoints
export const donationsAPI = {
  checkout: (data: any) => apiCall('/donations/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getStatus: (sessionId: string) => apiCall(`/donations/status/${sessionId}`),
  my: () => apiCall('/donations/my'),
};

// Admin endpoints
export const adminAPI = {
  students: {
    list: (status?: string) => apiCall(`/admin/students${status ? `?status=${status}` : ''}`),
    pending: () => apiCall('/admin/students/pending'),
    verify: (id: string, action: string, reason?: string) => apiCall(`/admin/students/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),
    reject: (id: string, reason?: string) => apiCall(`/admin/students/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  },
  campaigns: {
    list: (status?: string) => apiCall(`/admin/campaigns${status ? `?status=${status}` : ''}`),
    updateStatus: (id: string, status: string, reason?: string) => apiCall(`/admin/campaigns/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),
  },
  stats: () => apiCall('/admin/stats'),
  users: {
    list: (role?: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      return apiCall(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`);
    },
    updateRole: (id: string, role: string) => apiCall(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
    delete: (id: string) => apiCall(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  },
};

// Static data
export const staticAPI = {
  categories: () => apiCall('/static/categories'),
  countries: () => apiCall('/static/countries'),
  fieldsOfStudy: () => apiCall('/static/fields-of-study'),
};

// Export verification statuses for UI
export const verificationStatuses = {
  pending: {
    label: 'Pending Verification',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: 'Clock',
  },
  verified: {
    label: 'Verified Student',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: 'CheckCircle2',
  },
  rejected: {
    label: 'Verification Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: 'XCircle',
  },
};
