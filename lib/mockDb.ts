/**
 * Mock Database with localStorage persistence
 * For demo/MVP purposes only
 */

export interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  country: string;
  educationLevel: string;
  needSummary: string;
  documents: string[];
  status: 'Received' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  amount: number;
  target: 'Support a verified student' | 'General education fund';
  donorName?: string;
  donorEmail?: string;
  status: 'Completed';
  createdAt: string;
}

export interface InstitutionMetrics {
  totalDonations: number;
  supportedStudents: number;
  applicationsReceived: number;
  approvalRate: number;
  distributionByCountry: Record<string, number>;
  distributionByEducationLevel: Record<string, number>;
}

const STORAGE_KEYS = {
  APPLICATIONS: 'funded_applications',
  DONATIONS: 'funded_donations',
} as const;

// Helper to generate IDs with collision prevention
function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = Math.floor(Math.random() * 1000); // Extra uniqueness
  return `APP-${timestamp}-${random}-${counter}`;
}

function generateDonationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = Math.floor(Math.random() * 1000); // Extra uniqueness
  return `DON-${timestamp}-${random}-${counter}`;
}

// Storage helpers with schema validation
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    
    // Basic validation - ensure it's an array for our use cases
    if (key === STORAGE_KEYS.APPLICATIONS || key === STORAGE_KEYS.DONATIONS) {
      if (!Array.isArray(parsed)) {
        console.warn(`Invalid data format in localStorage for ${key}, resetting to default`);
        localStorage.removeItem(key);
        return defaultValue;
      }
    }
    
    return parsed;
  } catch (error) {
    console.error(`Failed to parse localStorage data for ${key}:`, error);
    // Remove corrupted data
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    // Validate data before saving
    if (key === STORAGE_KEYS.APPLICATIONS || key === STORAGE_KEYS.DONATIONS) {
      if (!Array.isArray(value)) {
        console.error(`Invalid data format for ${key}, cannot save`);
        return;
      }
    }
    
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
    // Handle quota exceeded or other storage errors
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider clearing old data.');
    }
  }
}

// Student Application functions
export function createStudentApplication(
  data: Omit<StudentApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): StudentApplication {
  const application: StudentApplication = {
    id: generateId(),
    ...data,
    status: 'Received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const applications = loadFromStorage<StudentApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
  applications.push(application);
  saveToStorage(STORAGE_KEYS.APPLICATIONS, applications);

  return application;
}

export function listApplications(): StudentApplication[] {
  return loadFromStorage<StudentApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
}

export function getApplication(id: string): StudentApplication | null {
  const applications = listApplications();
  return applications.find((app) => app.id === id) || null;
}

export function updateApplicationStatus(
  id: string,
  status: StudentApplication['status']
): StudentApplication | null {
  const applications = listApplications();
  const index = applications.findIndex((app) => app.id === id);

  if (index === -1) return null;

  applications[index] = {
    ...applications[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEYS.APPLICATIONS, applications);
  return applications[index];
}

// Donation functions
export function createDonation(
  data: Omit<Donation, 'id' | 'status' | 'createdAt'>
): Donation {
  const donation: Donation = {
    id: generateDonationId(),
    ...data,
    status: 'Completed',
    createdAt: new Date().toISOString(),
  };

  const donations = loadFromStorage<Donation[]>(STORAGE_KEYS.DONATIONS, []);
  donations.push(donation);
  saveToStorage(STORAGE_KEYS.DONATIONS, donations);

  // Dispatch event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('donationCreated'));
  }

  return donation;
}

export function listDonations(): Donation[] {
  return loadFromStorage<Donation[]>(STORAGE_KEYS.DONATIONS, []);
}

export function getDonation(id: string): Donation | null {
  const donations = listDonations();
  return donations.find((don) => don.id === id) || null;
}

// Institution Metrics
export function getInstitutionMetrics(): InstitutionMetrics {
  const applications = listApplications();
  const donations = listDonations();

  const approvedApplications = applications.filter((app) => app.status === 'Approved');
  const totalDonations = donations.reduce((sum, don) => sum + don.amount, 0);
  const approvalRate =
    applications.length > 0
      ? (approvedApplications.length / applications.length) * 100
      : 0;

  // Distribution by country
  const distributionByCountry: Record<string, number> = {};
  applications.forEach((app) => {
    distributionByCountry[app.country] = (distributionByCountry[app.country] || 0) + 1;
  });

  // Distribution by education level
  const distributionByEducationLevel: Record<string, number> = {};
  applications.forEach((app) => {
    distributionByEducationLevel[app.educationLevel] =
      (distributionByEducationLevel[app.educationLevel] || 0) + 1;
  });

  return {
    totalDonations,
    supportedStudents: approvedApplications.length,
    applicationsReceived: applications.length,
    approvalRate: Math.round(approvalRate * 100) / 100, // Round to 2 decimals
    distributionByCountry,
    distributionByEducationLevel,
  };
}

// Reset demo data function
export function resetDemoData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    console.log('Demo data reset successfully');
  } catch (error) {
    console.error('Failed to reset demo data:', error);
    throw error;
  }
}
