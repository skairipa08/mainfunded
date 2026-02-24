// Mock data for Corporate Donor Panel
// This file contains demo data for development and testing

export interface CorporateAccount {
    id: string;
    company_name: string;
    logo_url: string;
    subscription_tier: 'basic' | 'pro' | 'enterprise';
    created_at: string;
}

export interface CorporateUser {
    id: string;
    corporate_account_id: string;
    email: string;
    name: string;
    role: 'viewer' | 'editor' | 'payment_admin';
    avatar_url?: string;
}

export interface SupportedStudent {
    id: string;
    name: string;
    photo_url: string;
    university: string;
    faculty: string;
    department: string;
    country: string;
    target_year: number;
    total_donated: number;
    goal_amount: number;
    status: 'active' | 'graduated' | 'dropped';
    updates: StudentUpdate[];
    donation_history: DonationRecord[];
}

export interface StudentUpdate {
    id: string;
    date: string;
    title: string;
    content: string;
    type: 'progress' | 'thank_you' | 'milestone';
}

export interface DonationRecord {
    id: string;
    date: string;
    amount: number;
    donor_name: string;
}

export interface Campaign {
    id: string;
    title: string;
    description: string;
    category: string;
    goal_amount: number;
    raised_amount: number;
    student_count: number;
    cover_image: string;
    status: 'active' | 'completed' | 'paused';
}

export interface Notification {
    id: string;
    type: 'update' | 'thank_you' | 'campaign' | 'milestone';
    title: string;
    message: string;
    date: string;
    read: boolean;
    student_id?: string;
    campaign_id?: string;
}

// Demo Corporate Account
export const mockCorporateAccount: CorporateAccount = {
    id: 'corp_001',
    company_name: 'TechVentures Inc.',
    logo_url: '/sponsors/sponsor1.png',
    subscription_tier: 'enterprise',
    created_at: '2024-01-15T00:00:00Z',
};

// Demo Corporate User
export const mockCorporateUser: CorporateUser = {
    id: 'user_001',
    corporate_account_id: 'corp_001',
    email: 'admin@techventures.com',
    name: 'Ahmet Yılmaz',
    role: 'payment_admin',
    avatar_url: '/api/placeholder/40/40',
};

// Demo Students
export const mockStudents: SupportedStudent[] = [
    {
        id: 'std_001',
        name: 'Zeynep Kaya',
        photo_url: '/api/placeholder/100/100',
        university: 'Istanbul Technical University',
        faculty: 'Engineering',
        department: 'Computer Science',
        country: 'Turkey',
        target_year: 2026,
        total_donated: 0,
        goal_amount: 0,
        status: 'active',
        updates: [],
        donation_history: [],
    },
    {
        id: 'std_002',
        name: 'Mehmet Demir',
        photo_url: '/api/placeholder/100/100',
        university: 'Middle East Technical University',
        faculty: 'Science',
        department: 'Physics',
        country: 'Turkey',
        target_year: 2025,
        total_donated: 0,
        goal_amount: 0,
        status: 'active',
        updates: [],
        donation_history: [],
    },
    {
        id: 'std_003',
        name: 'Ayşe Öztürk',
        photo_url: '/api/placeholder/100/100',
        university: 'Boğaziçi University',
        faculty: 'Medicine',
        department: 'Medical School',
        country: 'Turkey',
        target_year: 2028,
        total_donated: 0,
        goal_amount: 0,
        status: 'active',
        updates: [],
        donation_history: [],
    },
    {
        id: 'std_004',
        name: 'Ali Yıldız',
        photo_url: '/api/placeholder/100/100',
        university: 'Ankara University',
        faculty: 'Law',
        department: 'Law School',
        country: 'Turkey',
        target_year: 2024,
        total_donated: 0,
        goal_amount: 0,
        status: 'graduated',
        updates: [],
        donation_history: [],
    },
    {
        id: 'std_005',
        name: 'Fatma Arslan',
        photo_url: '/api/placeholder/100/100',
        university: 'Ege University',
        faculty: 'Arts',
        department: 'Architecture',
        country: 'Turkey',
        target_year: 2027,
        total_donated: 0,
        goal_amount: 0,
        status: 'active',
        updates: [],
        donation_history: [],
    },
];

// Demo Campaigns
// Demo Campaigns (all values zero)
export const mockCampaigns: Campaign[] = [
    {
        id: 'camp_001',
        title: 'STEM Eğitimi Desteği',
        description: 'Mühendislik ve bilim öğrencilerine burs desteği',
        category: 'STEM',
        goal_amount: 0,
        raised_amount: 0,
        student_count: 0,
        cover_image: '/api/placeholder/400/200',
        status: 'active',
    },
    {
        id: 'camp_002',
        title: 'Tıp Fakültesi Bursu',
        description: 'Gelecek doktorlara eğitim desteği',
        category: 'Medicine',
        goal_amount: 0,
        raised_amount: 0,
        student_count: 0,
        cover_image: '/api/placeholder/400/200',
        status: 'active',
    },
];

// Demo Notifications
export const mockNotifications: Notification[] = [
    {
        id: 'notif_001',
        type: 'thank_you',
        title: 'Zeynep\'ten Teşekkür Mesajı',
        message: 'Zeynep Kaya size bir teşekkür videosu gönderdi.',
        date: '2026-02-03T10:00:00Z',
        read: false,
        student_id: 'std_001',
    },
    {
        id: 'notif_002',
        type: 'milestone',
        title: 'Öğrenci Başarısı',
        message: 'Mehmet Demir CERN programına kabul edildi!',
        date: '2026-01-20T14:30:00Z',
        read: false,
        student_id: 'std_002',
    },
    {
        id: 'notif_003',
        type: 'campaign',
        title: 'Yeni Kampanya',
        message: 'Yeni "Yapay Zeka Bursları" kampanyası başladı.',
        date: '2026-01-18T09:00:00Z',
        read: true,
        campaign_id: 'camp_005',
    },
    {
        id: 'notif_004',
        type: 'update',
        title: 'Öğrenci Güncellemesi',
        message: 'Zeynep Kaya yeni bir güncelleme paylaştı.',
        date: '2026-01-15T16:00:00Z',
        read: true,
        student_id: 'std_001',
    },
];

// Dashboard Statistics (Demo - all values zero)
export const mockDashboardStats = {
    totalDonations: {
        today: 0,
        thisMonth: 0,
        allTime: 0,
    },
    studentsSupported: 0,
    averageDonation: 0,
    activeCampaigns: 0,
    graduatedStudents: 0,
};

// Monthly Donation Trend Data (Demo)
export const mockDonationTrend = [
    { month: 'Oca', amount: 0 },
    { month: 'Sub', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Nis', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Haz', amount: 0 },
    { month: 'Tem', amount: 0 },
    { month: 'Ağu', amount: 0 },
    { month: 'Eyl', amount: 0 },
    { month: 'Eki', amount: 0 },
    { month: 'Kas', amount: 0 },
    { month: 'Ara', amount: 0 },
];

// Faculty Distribution
export const mockFacultyDistribution = [
    { name: 'Mühendislik', value: 35 },
    { name: 'Tıp', value: 20 },
    { name: 'Hukuk', value: 15 },
    { name: 'Fen', value: 15 },
    { name: 'Diğer', value: 15 },
];

// Country Distribution
export const mockCountryDistribution = [
    { name: 'Türkiye', value: 60 },
    { name: 'Almanya', value: 15 },
    { name: 'ABD', value: 10 },
    { name: 'İngiltere', value: 8 },
    { name: 'Diğer', value: 7 },
];

// ESG Metrics (Demo)
export const mockESGMetrics = {
    regionalImpact: {
        developingCountries: 0,
        ruralAreas: 0,
    },
    genderDistribution: {
        female: 0,
        male: 0,
    },
    ethnicDiversity: {
        underrepresented: 0,
        majority: 0,
    },
    universityDiversity: 0,
    totalImpact: {
        studentsHelped: 0,
        graduations: 0,
        employmentRate: 0,
    },
};
