/**
 * Analytics Service
 * Tracks user behavior, page views, and conversion events
 */

// Event types for tracking
export type AnalyticsEventType =
    | 'page_view'
    | 'campaign_view'
    | 'donation_started'
    | 'donation_completed'
    | 'campaign_created'
    | 'campaign_shared'
    | 'user_signup'
    | 'user_login'
    | 'search'
    | 'button_click'
    | 'form_submit'
    | 'error';

interface AnalyticsEvent {
    id: string;
    type: AnalyticsEventType;
    timestamp: Date;
    userId?: string;
    sessionId: string;
    page: string;
    data?: Record<string, any>;
    referrer?: string;
    userAgent?: string;
    ip?: string;
}

interface PageViewData {
    title: string;
    path: string;
    duration?: number;
}

interface ConversionData {
    campaignId?: string;
    amount?: number;
    paymentMethod?: string;
}

// In-memory analytics store (in production, use a proper analytics service)
const analyticsEvents: AnalyticsEvent[] = [];
const sessionStore = new Map<string, { startTime: number; pageViews: number; events: number }>();

/**
 * Generate unique ID
 */
function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Get or create session ID
 */
export function getSessionId(): string {
    if (typeof window === 'undefined') return 'server-' + generateId();

    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
        sessionId = generateId();
        sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
}

/**
 * Track an analytics event
 */
export function trackEvent(
    type: AnalyticsEventType,
    data?: Record<string, any>,
    userId?: string
): void {
    const event: AnalyticsEvent = {
        id: generateId(),
        type,
        timestamp: new Date(),
        userId,
        sessionId: getSessionId(),
        page: typeof window !== 'undefined' ? window.location.pathname : '/',
        data,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    analyticsEvents.push(event);

    // Keep only last 10000 events in memory
    if (analyticsEvents.length > 10000) {
        analyticsEvents.shift();
    }

    // Update session stats
    const session = sessionStore.get(event.sessionId);
    if (session) {
        session.events++;
        if (type === 'page_view') session.pageViews++;
    } else {
        sessionStore.set(event.sessionId, {
            startTime: Date.now(),
            pageViews: type === 'page_view' ? 1 : 0,
            events: 1
        });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', type, data);
    }
}

/**
 * Track page view
 */
export function trackPageView(pageData: PageViewData): void {
    trackEvent('page_view', pageData);
}

/**
 * Track campaign view
 */
export function trackCampaignView(campaignId: string, campaignTitle: string): void {
    trackEvent('campaign_view', { campaignId, campaignTitle });
}

/**
 * Track donation funnel
 */
export function trackDonationStarted(campaignId: string, amount: number): void {
    trackEvent('donation_started', { campaignId, amount });
}

export function trackDonationCompleted(data: ConversionData): void {
    trackEvent('donation_completed', data);
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number): void {
    trackEvent('search', { query, resultsCount });
}

/**
 * Track button click
 */
export function trackButtonClick(buttonId: string, buttonText: string): void {
    trackEvent('button_click', { buttonId, buttonText });
}

/**
 * Track errors
 */
export function trackError(error: string, context?: Record<string, any>): void {
    trackEvent('error', { error, ...context });
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(hours: number = 24): {
    totalEvents: number;
    pageViews: number;
    uniqueSessions: number;
    topPages: { path: string; views: number }[];
    conversionRate: number;
    eventBreakdown: Record<AnalyticsEventType, number>;
} {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recentEvents = analyticsEvents.filter(e => e.timestamp.getTime() > cutoff);

    const eventBreakdown: Record<string, number> = {};
    const pageCounts: Record<string, number> = {};
    const sessions = new Set<string>();

    let donationsStarted = 0;
    let donationsCompleted = 0;

    for (const event of recentEvents) {
        // Count event types
        eventBreakdown[event.type] = (eventBreakdown[event.type] || 0) + 1;

        // Count page views
        if (event.type === 'page_view') {
            pageCounts[event.page] = (pageCounts[event.page] || 0) + 1;
        }

        // Track unique sessions
        sessions.add(event.sessionId);

        // Calculate conversion
        if (event.type === 'donation_started') donationsStarted++;
        if (event.type === 'donation_completed') donationsCompleted++;
    }

    // Sort pages by views
    const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }));

    return {
        totalEvents: recentEvents.length,
        pageViews: eventBreakdown['page_view'] || 0,
        uniqueSessions: sessions.size,
        topPages,
        conversionRate: donationsStarted > 0 ? (donationsCompleted / donationsStarted) * 100 : 0,
        eventBreakdown: eventBreakdown as Record<AnalyticsEventType, number>,
    };
}

/**
 * Export analytics data as CSV
 */
export function exportAnalyticsCSV(): string {
    const headers = ['id', 'type', 'timestamp', 'userId', 'sessionId', 'page', 'data'];
    const rows = analyticsEvents.map(e => [
        e.id,
        e.type,
        e.timestamp.toISOString(),
        e.userId || '',
        e.sessionId,
        e.page,
        JSON.stringify(e.data || {}),
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Clear all analytics data
 */
export function clearAnalytics(): void {
    analyticsEvents.length = 0;
    sessionStore.clear();
}
