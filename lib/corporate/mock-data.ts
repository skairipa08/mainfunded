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
    name: 'Ahmet Yilmaz',
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
        total_donated: 2500,
        goal_amount: 5000,
        status: 'active',
        updates: [
            { id: 'upd_001', date: '2026-01-15', title: 'Donem Sonu Basarisi', content: 'Bu donem 3.8 GPA ile bitirdim. Destekleriniz icin tesekkurler!', type: 'progress' },
            { id: 'upd_002', date: '2025-12-20', title: 'Staj Haberi', content: 'Google\'da yaz staji icin kabul aldim!', type: 'milestone' },
        ],
        donation_history: [
            { id: 'don_001', date: '2026-01-10', amount: 500, donor_name: 'TechVentures Inc.' },
            { id: 'don_002', date: '2025-11-15', amount: 1000, donor_name: 'TechVentures Inc.' },
            { id: 'don_003', date: '2025-09-01', amount: 1000, donor_name: 'TechVentures Inc.' },
        ],
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
        total_donated: 3000,
        goal_amount: 4000,
        status: 'active',
        updates: [
            { id: 'upd_003', date: '2026-01-20', title: 'Arastirma Projesi', content: 'CERN arastirma programina kabul edildim!', type: 'milestone' },
        ],
        donation_history: [
            { id: 'don_004', date: '2026-01-05', amount: 1500, donor_name: 'TechVentures Inc.' },
            { id: 'don_005', date: '2025-10-10', amount: 1500, donor_name: 'TechVentures Inc.' },
        ],
    },
    {
        id: 'std_003',
        name: 'Ayse Ozturk',
        photo_url: '/api/placeholder/100/100',
        university: 'Bogazici University',
        faculty: 'Medicine',
        department: 'Medical School',
        country: 'Turkey',
        target_year: 2028,
        total_donated: 4000,
        goal_amount: 8000,
        status: 'active',
        updates: [],
        donation_history: [
            { id: 'don_006', date: '2025-12-01', amount: 2000, donor_name: 'TechVentures Inc.' },
            { id: 'don_007', date: '2025-08-15', amount: 2000, donor_name: 'TechVentures Inc.' },
        ],
    },
    {
        id: 'std_004',
        name: 'Ali Yildiz',
        photo_url: '/api/placeholder/100/100',
        university: 'Ankara University',
        faculty: 'Law',
        department: 'Law School',
        country: 'Turkey',
        target_year: 2024,
        total_donated: 6000,
        goal_amount: 6000,
        status: 'graduated',
        updates: [
            { id: 'upd_004', date: '2024-06-15', title: 'Mezuniyet!', content: 'Hukuk fakultesinden derece ile mezun oldum. Sizin sayenizde!', type: 'thank_you' },
        ],
        donation_history: [
            { id: 'don_008', date: '2024-05-01', amount: 2000, donor_name: 'TechVentures Inc.' },
            { id: 'don_009', date: '2024-01-15', amount: 2000, donor_name: 'TechVentures Inc.' },
            { id: 'don_010', date: '2023-09-01', amount: 2000, donor_name: 'TechVentures Inc.' },
        ],
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
        total_donated: 1500,
        goal_amount: 5000,
        status: 'active',
        updates: [],
        donation_history: [
            { id: 'don_011', date: '2026-01-25', amount: 1500, donor_name: 'TechVentures Inc.' },
        ],
    },
];

// Demo Campaigns
export const mockCampaigns: Campaign[] = [
    {
        id: 'camp_001',
        title: 'STEM Egitimi Destegi',
        description: 'Muhendislik ve bilim ogrencilerine burs destegi',
        category: 'STEM',
        goal_amount: 50000,
        raised_amount: 32000,
        student_count: 15,
        cover_image: '/api/placeholder/400/200',
        status: 'active',
    },
    {
        id: 'camp_002',
        title: 'Tip Fakultesi Bursu',
        description: 'Gelecek doktorlara egitim destegi',
        category: 'Medicine',
        goal_amount: 80000,
        raised_amount: 45000,
        student_count: 10,
        cover_image: '/api/placeholder/400/200',
        status: 'active',
    },
    {
        id: 'camp_003',
        title: 'Kadin Girisimciler',
        description: 'Kadin ogrencilere ozel burs programi',
        category: 'Women in Tech',
        goal_amount: 30000,
        raised_amount: 28000,
        student_count: 12,
        cover_image: '/api/placeholder/400/200',
        status: 'active',
    },
    {
        id: 'camp_004',
        title: 'Kirsaldan Universitye',
        description: 'Kirsal bolge ogrencilerine destek',
        category: 'Rural Education',
        goal_amount: 40000,
        raised_amount: 40000,
        student_count: 20,
        cover_image: '/api/placeholder/400/200',
        status: 'completed',
    },
];

// Demo Notifications
export const mockNotifications: Notification[] = [
    {
        id: 'notif_001',
        type: 'thank_you',
        title: 'Zeynep\'ten Tesekkur Mesaji',
        message: 'Zeynep Kaya size bir tesekkur videosu gonderdi.',
        date: '2026-02-03T10:00:00Z',
        read: false,
        student_id: 'std_001',
    },
    {
        id: 'notif_002',
        type: 'milestone',
        title: 'Ogrenci Basarisi',
        message: 'Mehmet Demir CERN programina kabul edildi!',
        date: '2026-01-20T14:30:00Z',
        read: false,
        student_id: 'std_002',
    },
    {
        id: 'notif_003',
        type: 'campaign',
        title: 'Yeni Kampanya',
        message: 'Yeni "Yapay Zeka Burslari" kampanyasi basladi.',
        date: '2026-01-18T09:00:00Z',
        read: true,
        campaign_id: 'camp_005',
    },
    {
        id: 'notif_004',
        type: 'update',
        title: 'Ogrenci Guncellemesi',
        message: 'Zeynep Kaya yeni bir guncelleme paylasti.',
        date: '2026-01-15T16:00:00Z',
        read: true,
        student_id: 'std_001',
    },
];

// Dashboard Statistics
export const mockDashboardStats = {
    totalDonations: {
        today: 2500,
        thisMonth: 15000,
        allTime: 125000,
    },
    studentsSupported: 25,
    averageDonation: 1250,
    activeCampaigns: 3,
    graduatedStudents: 8,
};

// Monthly Donation Trend Data
export const mockDonationTrend = [
    { month: 'Oca', amount: 8000 },
    { month: 'Sub', amount: 12000 },
    { month: 'Mar', amount: 9500 },
    { month: 'Nis', amount: 15000 },
    { month: 'May', amount: 11000 },
    { month: 'Haz', amount: 18000 },
    { month: 'Tem', amount: 14000 },
    { month: 'Agu', amount: 16500 },
    { month: 'Eyl', amount: 20000 },
    { month: 'Eki', amount: 17500 },
    { month: 'Kas', amount: 22000 },
    { month: 'Ara', amount: 25000 },
];

// Faculty Distribution
export const mockFacultyDistribution = [
    { name: 'Muhendislik', value: 35 },
    { name: 'Tip', value: 20 },
    { name: 'Hukuk', value: 15 },
    { name: 'Fen', value: 15 },
    { name: 'Diger', value: 15 },
];

// Country Distribution
export const mockCountryDistribution = [
    { name: 'Turkiye', value: 60 },
    { name: 'Almanya', value: 15 },
    { name: 'ABD', value: 10 },
    { name: 'Ingiltere', value: 8 },
    { name: 'Diger', value: 7 },
];

// ESG Metrics
export const mockESGMetrics = {
    regionalImpact: {
        developingCountries: 65,
        ruralAreas: 40,
    },
    genderDistribution: {
        female: 55,
        male: 45,
    },
    ethnicDiversity: {
        underrepresented: 35,
        majority: 65,
    },
    universityDiversity: 12, // Number of different universities
    totalImpact: {
        studentsHelped: 125,
        graduations: 42,
        employmentRate: 94,
    },
};
