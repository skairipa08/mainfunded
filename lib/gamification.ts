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
        name: 'pages.badges.items.first_step.name',
        description: 'pages.badges.items.first_step.desc',
        icon: '🌱',
        color: 'bg-green-100 text-green-800',
        requirement: { type: 'donation_count', value: 1 },
    },
    {
        id: 'supporter',
        name: 'pages.badges.items.supporter.name',
        description: 'pages.badges.items.supporter.desc',
        icon: '💪',
        color: 'bg-blue-100 text-blue-800',
        requirement: { type: 'donation_count', value: 5 },
    },
    {
        id: 'champion',
        name: 'pages.badges.items.champion.name',
        description: 'pages.badges.items.champion.desc',
        icon: '🏆',
        color: 'bg-amber-100 text-amber-800',
        requirement: { type: 'donation_count', value: 25 },
    },
    {
        id: 'legend',
        name: 'pages.badges.items.legend.name',
        description: 'pages.badges.items.legend.desc',
        icon: '⭐',
        color: 'bg-purple-100 text-purple-800',
        requirement: { type: 'donation_count', value: 100 },
    },
    {
        id: 'generous',
        name: 'pages.badges.items.generous.name',
        description: 'pages.badges.items.generous.desc',
        icon: '💎',
        color: 'bg-cyan-100 text-cyan-800',
        requirement: { type: 'donation_amount', value: 1000 },
    },
    {
        id: 'philanthropist',
        name: 'pages.badges.items.philanthropist.name',
        description: 'pages.badges.items.philanthropist.desc',
        icon: '👑',
        color: 'bg-yellow-100 text-yellow-800',
        requirement: { type: 'donation_amount', value: 10000 },
    },
    {
        id: 'patron',
        name: 'pages.badges.items.patron.name',
        description: 'pages.badges.items.patron.desc',
        icon: '🌟',
        color: 'bg-rose-100 text-rose-800',
        requirement: { type: 'donation_amount', value: 50000 },
    },
    {
        id: 'student_champion',
        name: 'pages.badges.items.student_champion.name',
        description: 'pages.badges.items.student_champion.desc',
        icon: '🎓',
        color: 'bg-indigo-100 text-indigo-800',
        requirement: { type: 'student_count', value: 10 },
    },
    {
        id: 'streak_master',
        name: 'pages.badges.items.streak_master.name',
        description: 'pages.badges.items.streak_master.desc',
        icon: '🔥',
        color: 'bg-orange-100 text-orange-800',
        requirement: { type: 'streak', value: 12 },
    },
    {
        id: 'early_bird',
        name: 'pages.badges.items.early_bird.name',
        description: 'pages.badges.items.early_bird.desc',
        icon: '🐦',
        color: 'bg-sky-100 text-sky-800',
        requirement: { type: 'special', value: 1 },
    },
    {
        id: 'matching_hero',
        name: 'pages.badges.items.matching_hero.name',
        description: 'pages.badges.items.matching_hero.desc',
        icon: '🤝',
        color: 'bg-teal-100 text-teal-800',
        requirement: { type: 'special', value: 2 },
    },
    {
        id: 'mentor',
        name: 'pages.badges.items.mentor.name',
        description: 'pages.badges.items.mentor.desc',
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
// ⚠️ DEMO DATA — Tüm isimler, tutarlar ve veriler tamamen kurgusaldır.
// Gerçek kişi veya kuruluşları temsil etmez.
export const mockLeaderboard: LeaderboardEntry[] = [
    {
        id: '1',
        name: 'X Şirketi',
        type: 'corporate',
        isAnonymous: false,
        displayName: 'X Şirketi',
        totalDonated: 245000,
        studentCount: 48,
        badges: ['philanthropist', 'student_champion', 'champion', 'matching_hero'],
        rank: 1,
        points: 27450,
        avatar: undefined,
    },
    {
        id: '2',
        name: 'Y Vakfı',
        type: 'corporate',
        isAnonymous: false,
        displayName: 'Y Vakfı',
        totalDonated: 189000,
        studentCount: 35,
        badges: ['philanthropist', 'student_champion', 'champion'],
        rank: 2,
        points: 21650,
        avatar: undefined,
    },
    {
        id: '3',
        name: 'Z Teknoloji AŞ',
        type: 'corporate',
        isAnonymous: false,
        displayName: 'Z Teknoloji AŞ',
        totalDonated: 97500,
        studentCount: 22,
        badges: ['generous', 'student_champion', 'supporter'],
        rank: 3,
        points: 12850,
        avatar: undefined,
    },
    {
        id: '4',
        name: 'A*** B***',
        type: 'individual',
        isAnonymous: false,
        displayName: 'A*** B***',
        totalDonated: 42000,
        studentCount: 12,
        badges: ['generous', 'champion', 'streak_master', 'student_champion'],
        rank: 4,
        points: 6800,
        avatar: undefined,
    },
    {
        id: '5',
        name: 'Anonim',
        type: 'individual',
        isAnonymous: true,
        displayName: 'Anonim Kahraman',
        totalDonated: 38500,
        studentCount: 9,
        badges: ['generous', 'champion', 'streak_master'],
        rank: 5,
        points: 5950,
        avatar: undefined,
    },
    {
        id: '6',
        name: 'C*** D***',
        type: 'individual',
        isAnonymous: false,
        displayName: 'C*** D***',
        totalDonated: 28700,
        studentCount: 8,
        badges: ['generous', 'supporter', 'early_bird'],
        rank: 6,
        points: 4270,
        avatar: undefined,
    },
    {
        id: '7',
        name: 'W Holding',
        type: 'corporate',
        isAnonymous: false,
        displayName: 'W Holding',
        totalDonated: 156000,
        studentCount: 28,
        badges: ['philanthropist', 'student_champion', 'champion'],
        rank: 7,
        points: 17400,
        avatar: undefined,
    },
    {
        id: '8',
        name: 'E*** F***',
        type: 'individual',
        isAnonymous: false,
        displayName: 'E*** F***',
        totalDonated: 15200,
        studentCount: 5,
        badges: ['generous', 'supporter', 'mentor'],
        rank: 8,
        points: 2770,
        avatar: undefined,
    },
    {
        id: '9',
        name: 'G*** H***',
        type: 'individual',
        isAnonymous: false,
        displayName: 'G*** H***',
        totalDonated: 11800,
        studentCount: 4,
        badges: ['generous', 'supporter'],
        rank: 9,
        points: 2080,
        avatar: undefined,
    },
    {
        id: '10',
        name: 'V Yazılım AŞ',
        type: 'corporate',
        isAnonymous: false,
        displayName: 'V Yazılım AŞ',
        totalDonated: 67000,
        studentCount: 15,
        badges: ['generous', 'student_champion', 'supporter'],
        rank: 10,
        points: 8450,
        avatar: undefined,
    },
    {
        id: '11',
        name: 'Anonim',
        type: 'individual',
        isAnonymous: true,
        displayName: 'Gizli Destekçi',
        totalDonated: 8500,
        studentCount: 3,
        badges: ['supporter', 'early_bird'],
        rank: 11,
        points: 1400,
        avatar: undefined,
    },
    {
        id: '12',
        name: 'K*** L***',
        type: 'individual',
        isAnonymous: false,
        displayName: 'K*** L***',
        totalDonated: 5200,
        studentCount: 2,
        badges: ['supporter'],
        rank: 12,
        points: 820,
        avatar: undefined,
    },
];
