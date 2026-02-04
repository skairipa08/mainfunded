/**
 * A/B Testing Service
 * Enables running experiments to optimize user experience
 */

// Experiment definition
interface Experiment {
    id: string;
    name: string;
    description: string;
    variants: Variant[];
    isActive: boolean;
    startDate: Date;
    endDate?: Date;
    targetPercentage: number; // 0-100, percentage of users in experiment
}

interface Variant {
    id: string;
    name: string;
    weight: number; // Relative weight for distribution
    config?: Record<string, any>; // Variant-specific configuration
}

interface ExperimentResult {
    experimentId: string;
    variantId: string;
    eventType: 'impression' | 'conversion' | 'click' | 'custom';
    timestamp: Date;
    userId?: string;
    sessionId: string;
    data?: Record<string, any>;
}

// In-memory storage (in production, use database)
const experiments: Map<string, Experiment> = new Map();
const userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId
const experimentResults: ExperimentResult[] = [];

/**
 * Create a new experiment
 */
export function createExperiment(
    id: string,
    name: string,
    description: string,
    variants: Variant[],
    options: { targetPercentage?: number; startDate?: Date; endDate?: Date } = {}
): Experiment {
    const experiment: Experiment = {
        id,
        name,
        description,
        variants,
        isActive: true,
        startDate: options.startDate || new Date(),
        endDate: options.endDate,
        targetPercentage: options.targetPercentage ?? 100,
    };

    experiments.set(id, experiment);
    return experiment;
}

/**
 * Get or assign a variant for a user
 */
export function getVariant(experimentId: string, userId: string): Variant | null {
    const experiment = experiments.get(experimentId);
    if (!experiment || !experiment.isActive) return null;

    // Check if experiment has ended
    if (experiment.endDate && new Date() > experiment.endDate) {
        experiment.isActive = false;
        return null;
    }

    // Check if user already has an assignment
    let userExperiments = userAssignments.get(userId);
    if (userExperiments?.has(experimentId)) {
        const variantId = userExperiments.get(experimentId)!;
        return experiment.variants.find(v => v.id === variantId) || null;
    }

    // Determine if user should be in experiment
    const hash = simpleHash(userId + experimentId);
    const inExperiment = (hash % 100) < experiment.targetPercentage;
    if (!inExperiment) return null;

    // Assign a variant based on weights
    const variant = selectVariant(experiment.variants, hash);

    // Store assignment
    if (!userExperiments) {
        userExperiments = new Map();
        userAssignments.set(userId, userExperiments);
    }
    userExperiments.set(experimentId, variant.id);

    return variant;
}

/**
 * Select variant based on weights
 */
function selectVariant(variants: Variant[], seed: number): Variant {
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const rand = (seed % 1000) / 1000 * totalWeight;

    let cumulative = 0;
    for (const variant of variants) {
        cumulative += variant.weight;
        if (rand < cumulative) return variant;
    }

    return variants[variants.length - 1];
}

/**
 * Simple hash function for deterministic assignment
 */
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Track experiment result
 */
export function trackExperimentResult(
    experimentId: string,
    variantId: string,
    eventType: ExperimentResult['eventType'],
    sessionId: string,
    userId?: string,
    data?: Record<string, any>
): void {
    experimentResults.push({
        experimentId,
        variantId,
        eventType,
        timestamp: new Date(),
        userId,
        sessionId,
        data,
    });

    // Keep only last 50000 results
    if (experimentResults.length > 50000) {
        experimentResults.shift();
    }
}

/**
 * Get experiment statistics
 */
export function getExperimentStats(experimentId: string): {
    variants: {
        id: string;
        name: string;
        impressions: number;
        conversions: number;
        conversionRate: number;
    }[];
    winner?: string;
    significance: number;
} | null {
    const experiment = experiments.get(experimentId);
    if (!experiment) return null;

    const results = experimentResults.filter(r => r.experimentId === experimentId);
    const variantStats = experiment.variants.map(variant => {
        const variantResults = results.filter(r => r.variantId === variant.id);
        const impressions = variantResults.filter(r => r.eventType === 'impression').length;
        const conversions = variantResults.filter(r => r.eventType === 'conversion').length;

        return {
            id: variant.id,
            name: variant.name,
            impressions,
            conversions,
            conversionRate: impressions > 0 ? (conversions / impressions) * 100 : 0,
        };
    });

    // Simple significance calculation (not statistically rigorous, for demo purposes)
    const sorted = [...variantStats].sort((a, b) => b.conversionRate - a.conversionRate);
    const winner = sorted[0];
    const runnerUp = sorted[1];

    let significance = 0;
    if (winner && runnerUp && winner.impressions > 100 && runnerUp.impressions > 100) {
        const diff = winner.conversionRate - runnerUp.conversionRate;
        significance = Math.min(diff / 5, 1); // Simple heuristic
    }

    return {
        variants: variantStats,
        winner: significance > 0.8 ? winner?.id : undefined,
        significance,
    };
}

/**
 * Stop an experiment
 */
export function stopExperiment(experimentId: string): void {
    const experiment = experiments.get(experimentId);
    if (experiment) {
        experiment.isActive = false;
        experiment.endDate = new Date();
    }
}

/**
 * Get all experiments
 */
export function getAllExperiments(): Experiment[] {
    return Array.from(experiments.values());
}

/**
 * Get experiment by ID
 */
export function getExperiment(experimentId: string): Experiment | undefined {
    return experiments.get(experimentId);
}

// Pre-defined experiments
export const PredefinedExperiments = {
    // Donation button color test
    DONATION_BUTTON: 'donation_button_color',

    // Hero CTA text test
    HERO_CTA: 'hero_cta_text',

    // Campaign card layout test
    CAMPAIGN_LAYOUT: 'campaign_card_layout',
};

// Initialize default experiments
export function initializeDefaultExperiments(): void {
    // Donation button color experiment
    createExperiment(
        PredefinedExperiments.DONATION_BUTTON,
        'Bağış Butonu Rengi',
        'Bağış butonunun hangi renkte daha iyi dönüşüm sağladığını test eder',
        [
            { id: 'green', name: 'Yeşil', weight: 50, config: { color: '#16A34A' } },
            { id: 'blue', name: 'Mavi', weight: 50, config: { color: '#2563EB' } },
        ],
        { targetPercentage: 50 }
    );

    // Hero CTA text experiment
    createExperiment(
        PredefinedExperiments.HERO_CTA,
        'Ana Sayfa CTA Metni',
        'Ana sayfadaki CTA butonunun hangi metinle daha çok tıklandığını test eder',
        [
            { id: 'bagis_yap', name: 'Bağış Yap', weight: 33, config: { text: 'Bağış Yap' } },
            { id: 'destek_ol', name: 'Destek Ol', weight: 33, config: { text: 'Destek Ol' } },
            { id: 'simdi_bagis', name: 'Şimdi Bağış Yap', weight: 34, config: { text: 'Şimdi Bağış Yap' } },
        ],
        { targetPercentage: 100 }
    );
}

// Auto-initialize experiments
if (typeof window !== 'undefined') {
    initializeDefaultExperiments();
}
