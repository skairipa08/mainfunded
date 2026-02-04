/**
 * Search Service
 * Provides full-text search for campaigns and students
 */

interface SearchableItem {
    id: string;
    type: 'campaign' | 'student' | 'blog';
    title: string;
    description: string;
    keywords: string[];
    url: string;
    image?: string;
    metadata?: Record<string, any>;
}

export interface SearchResult {
    item: SearchableItem;
    score: number;
    highlights: { field: string; text: string }[];
}

interface SearchOptions {
    type?: 'campaign' | 'student' | 'blog' | 'all';
    limit?: number;
    offset?: number;
    filters?: Record<string, any>;
}

// In-memory search index
const searchIndex: SearchableItem[] = [];

/**
 * Add item to search index
 */
export function indexItem(item: SearchableItem): void {
    // Remove existing item with same id
    const existingIndex = searchIndex.findIndex(i => i.id === item.id && i.type === item.type);
    if (existingIndex > -1) {
        searchIndex.splice(existingIndex, 1);
    }

    searchIndex.push(item);
}

/**
 * Remove item from search index
 */
export function removeFromIndex(id: string, type: SearchableItem['type']): void {
    const index = searchIndex.findIndex(i => i.id === id && i.type === type);
    if (index > -1) {
        searchIndex.splice(index, 1);
    }
}

/**
 * Tokenize text for search
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 1);
}

/**
 * Calculate match score between query and text
 */
function calculateScore(query: string, text: string): number {
    const queryTokens = tokenize(query);
    const textTokens = tokenize(text);
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    let score = 0;

    // Exact match bonus
    if (textLower.includes(queryLower)) {
        score += 10;
    }

    // Word match scoring
    for (const queryToken of queryTokens) {
        for (const textToken of textTokens) {
            if (textToken === queryToken) {
                score += 5; // Exact word match
            } else if (textToken.includes(queryToken)) {
                score += 2; // Partial match
            } else if (queryToken.includes(textToken)) {
                score += 1; // Reverse partial match
            }
        }
    }

    return score;
}

/**
 * Get highlighted text snippet
 */
function getHighlight(query: string, text: string): string {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);

    if (index === -1) return text.substring(0, 100) + '...';

    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + query.length + 30);

    let snippet = '';
    if (start > 0) snippet += '...';
    snippet += text.substring(start, end);
    if (end < text.length) snippet += '...';

    return snippet;
}

/**
 * Search the index
 */
export function search(query: string, options: SearchOptions = {}): SearchResult[] {
    const { type = 'all', limit = 20, offset = 0, filters = {} } = options;

    if (!query || query.trim().length < 2) {
        return [];
    }

    const results: SearchResult[] = [];

    for (const item of searchIndex) {
        // Type filter
        if (type !== 'all' && item.type !== type) continue;

        // Custom filters
        if (filters.category && item.metadata?.category !== filters.category) continue;
        if (filters.verified && !item.metadata?.verified) continue;

        // Calculate scores for different fields
        const titleScore = calculateScore(query, item.title) * 3; // Title is most important
        const descScore = calculateScore(query, item.description) * 2;
        const keywordScore = item.keywords.reduce((sum, kw) =>
            sum + calculateScore(query, kw), 0
        );

        const totalScore = titleScore + descScore + keywordScore;

        if (totalScore > 0) {
            const highlights: { field: string; text: string }[] = [];

            if (titleScore > 0) {
                highlights.push({ field: 'title', text: getHighlight(query, item.title) });
            }
            if (descScore > 0) {
                highlights.push({ field: 'description', text: getHighlight(query, item.description) });
            }

            results.push({
                item,
                score: totalScore,
                highlights,
            });
        }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    return results.slice(offset, offset + limit);
}

/**
 * Get search suggestions based on partial query
 */
export function getSuggestions(query: string, limit: number = 5): string[] {
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    for (const item of searchIndex) {
        // Check title
        if (item.title.toLowerCase().includes(queryLower)) {
            suggestions.add(item.title);
        }

        // Check keywords
        for (const keyword of item.keywords) {
            if (keyword.toLowerCase().includes(queryLower)) {
                suggestions.add(keyword);
            }
        }

        if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions).slice(0, limit);
}

/**
 * Get popular searches (for demo purposes)
 */
export function getPopularSearches(): string[] {
    return [
        'Tıp',
        'Mühendislik',
        'Hukuk',
        'Burs',
        'Öğrenci',
        'Eğitim desteği',
        'Laptop',
        'Kitap',
    ];
}

/**
 * Index sample campaign data
 */
export function indexSampleData(): void {
    const sampleCampaigns: SearchableItem[] = [
        {
            id: 'c1',
            type: 'campaign',
            title: 'Tıp Fakültesi Öğrencisi İçin Burs Desteği',
            description: 'İstanbul Üniversitesi Tıp Fakültesi 3. sınıf öğrencisiyim. Eğitim masraflarım için yardımınıza ihtiyacım var.',
            keywords: ['tıp', 'doktor', 'sağlık', 'istanbul', 'burs'],
            url: '/campaigns/c1',
            image: '/campaigns/medical.jpg',
            metadata: { category: 'medical', verified: true, raised: 15000 },
        },
        {
            id: 'c2',
            type: 'campaign',
            title: 'Bilgisayar Mühendisliği Laptop İhtiyacı',
            description: 'ODTÜ Bilgisayar Mühendisliği 2. sınıf öğrencisiyim. Derslerim için laptop almam gerekiyor.',
            keywords: ['mühendislik', 'bilgisayar', 'laptop', 'odtü', 'teknoloji'],
            url: '/campaigns/c2',
            image: '/campaigns/tech.jpg',
            metadata: { category: 'technology', verified: true, raised: 8000 },
        },
        {
            id: 'c3',
            type: 'campaign',
            title: 'Hukuk Öğrencisi Kitap Desteği',
            description: 'Ankara Üniversitesi Hukuk Fakültesi öğrencisiyim. Ders kitapları için yardım arıyorum.',
            keywords: ['hukuk', 'kitap', 'ankara', 'avukat', 'eğitim'],
            url: '/campaigns/c3',
            image: '/campaigns/law.jpg',
            metadata: { category: 'education', verified: true, raised: 3500 },
        },
        {
            id: 'c4',
            type: 'campaign',
            title: 'Güzel Sanatlar Öğrencisi Malzeme İhtiyacı',
            description: 'Mimar Sinan Güzel Sanatlar Üniversitesi resim bölümü öğrencisiyim. Tuval ve boya malzemeleri için destek arıyorum.',
            keywords: ['sanat', 'resim', 'tuval', 'mimar sinan', 'yaratıcı'],
            url: '/campaigns/c4',
            image: '/campaigns/art.jpg',
            metadata: { category: 'arts', verified: true, raised: 2000 },
        },
    ];

    for (const campaign of sampleCampaigns) {
        indexItem(campaign);
    }
}

// Auto-index sample data
if (typeof window !== 'undefined') {
    indexSampleData();
}
