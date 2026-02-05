// Gamification: Badges, Points, and Leaderboard System

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    requirement: {
        type: 'donation_count' | 'donation_amount' | 'student_count' | 'streak' | 'special';
        value: number;
    };
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    type: 'individual' | 'corporate';
    isAnonymous: boolean;
    displayName: string;
    totalDonated: number;
    studentCount: number;
    badges: string[];
    rank: number;
    points: number;
    avatar?: string;
}

// Badge Definitions
export const BADGES: Badge[] = [
    {
        id: 'first_step',
        name: 'Ilk Adim',
        description: 'Ilk bagisinizi yaptiniz',
        icon: '🌱',
        color: 'bg-green-100 text-green-800',
        requirement: { type: 'donation_count', value: 1 },
    },
    {
        id: 'supporter',
        name: 'Destekci',
        description: '5 bagis yaptiniz',
        icon: '💪',
        color: 'bg-blue-100 text-blue-800',
        requirement: { type: 'donation_count', value: 5 },
    },
    {
        id: 'champion',
        name: 'Sampiyon',
        description: '25 bagis yaptiniz',
        icon: '🏆',
        color: 'bg-amber-100 text-amber-800',
        requirement: { type: 'donation_count', value: 25 },
    },
    {
        id: 'legend',
        name: 'Efsane',
        description: '100 bagis yaptiniz',
        icon: '⭐',
        color: 'bg-purple-100 text-purple-800',
        requirement: { type: 'donation_count', value: 100 },
    },
    {
        id: 'generous',
        name: 'Comert',
        description: 'Toplam $1,000 bagis',
        icon: '💎',
        color: 'bg-cyan-100 text-cyan-800',
        requirement: { type: 'donation_amount', value: 1000 },
    },
    {
        id: 'philanthropist',
        name: 'Hayirsever',
        description: 'Toplam $10,000 bagis',
        icon: '👑',
        color: 'bg-yellow-100 text-yellow-800',
        requirement: { type: 'donation_amount', value: 10000 },
    },
    {
        id: 'patron',
        name: 'Hamiler',
        description: 'Toplam $50,000 bagis',
        icon: '🌟',
        color: 'bg-rose-100 text-rose-800',
        requirement: { type: 'donation_amount', value: 50000 },
    },
    {
        id: 'student_champion',
        name: 'Ogrenci Sampiyonu',
        description: '10 farkli ogrenciyi desteklediniz',
        icon: '🎓',
        color: 'bg-indigo-100 text-indigo-800',
        requirement: { type: 'student_count', value: 10 },
    },
    {
        id: 'streak_master',
        name: 'Seri Ustasi',
        description: '12 ay ust uste bagis yaptiniz',
        icon: '🔥',
        color: 'bg-orange-100 text-orange-800',
        requirement: { type: 'streak', value: 12 },
    },
    {
        id: 'early_bird',
        name: 'Erken Kus',
        description: 'Platform lansmanindan bu yana uye',
        icon: '🐦',
        color: 'bg-sky-100 text-sky-800',
        requirement: { type: 'special', value: 1 },
    },
    {
        id: 'matching_hero',
        name: 'Eslestirme Kahramani',
        description: 'Matching gift programina katildiniz',
        icon: '🤝',
        color: 'bg-teal-100 text-teal-800',
        requirement: { type: 'special', value: 2 },
    },
    {
        id: 'mentor',
        name: 'Mentor',
        description: 'Bir ogrenciye mentor oldunuz',
        icon: '📚',
        color: 'bg-violet-100 text-violet-800',
        requirement: { type: 'special', value: 3 },
    },
];

// Calculate points based on donations
export function calculatePoints(
    totalDonated: number,
    donationCount: number,
    studentCount: number,
    streakMonths: number
): number {
    let points = 0;

    // Base points from donation amount (1 point per $10)
    points += Math.floor(totalDonated / 10);

    // Bonus for number of donations (10 points each)
    points += donationCount * 10;

    // Bonus for supporting multiple students (50 points each)
    points += studentCount * 50;

    // Streak bonus (100 points per month)
    points += streakMonths * 100;

    return points;
}

// Check which badges a donor has earned
export function getEarnedBadges(
    donationCount: number,
    totalDonated: number,
    studentCount: number,
    streakMonths: number,
    specialBadges: string[] = []
): Badge[] {
    return BADGES.filter((badge) => {
        switch (badge.requirement.type) {
            case 'donation_count':
                return donationCount >= badge.requirement.value;
            case 'donation_amount':
                return totalDonated >= badge.requirement.value;
            case 'student_count':
                return studentCount >= badge.requirement.value;
            case 'streak':
                return streakMonths >= badge.requirement.value;
            case 'special':
                return specialBadges.includes(badge.id);
            default:
                return false;
        }
    });
}

// Mock leaderboard data
// Demo leaderboard data - all values set to 0 (demo mode)
export const mockLeaderboard: LeaderboardEntry[] = [
    {
        id: '1',
        name: 'Demo Sirket A',
        type: 'corporate',
        isAnonymous: false,
        displayName: 'Demo Sirket A',
        totalDonated: 0,
        studentCount: 0,
        badges: [],
        rank: 1,
        points: 0,
    },
    {
        id: '2',
        name: 'Demo Sirket B',
        type: 'corporate',
        isAnonymous: false,
        displayName: 'Demo Sirket B',
        totalDonated: 0,
        studentCount: 0,
        badges: [],
        rank: 2,
        points: 0,
    },
    {
        id: '3',
        name: 'Demo Kullanici A',
        type: 'individual',
        isAnonymous: false,
        displayName: 'Demo K. A',
        totalDonated: 0,
        studentCount: 0,
        badges: [],
        rank: 1,
        points: 0,
    },
    {
        id: '4',
        name: 'Demo Kullanici B',
        type: 'individual',
        isAnonymous: false,
        displayName: 'Demo K. B',
        totalDonated: 0,
        studentCount: 0,
        badges: [],
        rank: 2,
        points: 0,
    },
];
