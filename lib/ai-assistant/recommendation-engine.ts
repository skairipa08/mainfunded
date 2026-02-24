import type { DonorPreferences, RecommendedCampaign } from '@/types/ai-assistant';

// ─── Recommendation Engine ──────────────────────────────────────────
// Score-based matching: filters campaigns from the database, then ranks
// them based on the donor's stated preferences.

/** Field-of-study keyword map (Turkish & English) → canonical keys */
const FIELD_MAP: Record<string, string[]> = {
  engineering: [
    'mühendislik', 'engineering', 'bilgisayar', 'computer', 'yazılım',
    'software', 'elektrik', 'electrical', 'makine', 'mechanical',
    'inşaat', 'civil', 'endüstri', 'industrial', 'elektronik',
    'mekatronik', 'mechatronics', 'metalürji', 'malzeme', 'materials',
  ],
  medicine: [
    'tıp', 'medicine', 'doktor', 'sağlık', 'health', 'hemşire',
    'nursing', 'eczacılık', 'pharmacy', 'diş', 'dental',
  ],
  law: ['hukuk', 'law', 'avukat', 'lawyer', 'adalet', 'justice'],
  arts: [
    'sanat', 'art', 'müzik', 'music', 'tasarım', 'design', 'grafik',
    'graphic', 'mimarlık', 'architecture', 'sinema', 'film', 'güzel',
  ],
  social: [
    'sosyal', 'social', 'psikoloji', 'psychology', 'sosyoloji',
    'sociology', 'iletişim', 'communication', 'tarih', 'history',
    'felsefe', 'philosophy', 'edebiyat', 'literature', 'eğitim',
  ],
  science: [
    'fen', 'science', 'fizik', 'physics', 'kimya', 'chemistry',
    'biyoloji', 'biology', 'matematik', 'math',
  ],
  business: [
    'işletme', 'business', 'iktisat', 'economics', 'finans', 'finance',
    'yönetim', 'management', 'ticaret', 'trade', 'muhasebe', 'accounting',
  ],
};

/** Check if a field_of_study string matches a preference key */
function fieldMatches(fieldOfStudy: string | null | undefined, preferenceField: string): boolean {
  if (!fieldOfStudy || preferenceField === 'any') return preferenceField === 'any';
  const lower = fieldOfStudy.toLocaleLowerCase('tr');
  const keywords = FIELD_MAP[preferenceField];
  if (!keywords) return false;
  return keywords.some((kw) => lower.includes(kw));
}

/** Parse budget preference into numeric range */
function parseBudgetRange(budget: string): { min: number; max: number } {
  switch (budget) {
    case '50-100': return { min: 50, max: 100 };
    case '100-500': return { min: 100, max: 500 };
    case '500+': return { min: 500, max: Infinity };
    default: return { min: 0, max: Infinity };
  }
}

/** Score a single campaign against donor preferences */
export function scoreCampaign(
  campaign: any,
  preferences: DonorPreferences
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const studentField = campaign.student?.field_of_study || campaign.field_of_study;
  const studentCountry = campaign.student?.country || campaign.country;
  const studentGender = campaign.student?.gender;

  // ── 1. Field match (weight: 30) ───────────────────────────────────
  if (preferences.field && preferences.field !== 'any') {
    if (fieldMatches(studentField, preferences.field)) {
      score += 30;
      reasons.push('Bölüm eşleşmesi');
    }
  } else {
    score += 15; // neutral boost for "any"
  }

  // ── 2. Gender match (weight: 15) ──────────────────────────────────
  if (preferences.gender && preferences.gender !== 'any') {
    if (studentGender && studentGender === preferences.gender) {
      score += 15;
      reasons.push('Cinsiyet tercihi eşleşmesi');
    }
  } else {
    score += 7;
  }

  // ── 3. Country match (weight: 10) ─────────────────────────────────
  if (preferences.country && preferences.country !== 'any') {
    if (studentCountry && studentCountry.toLocaleLowerCase('tr') === preferences.country.toLocaleLowerCase('tr')) {
      score += 10;
      reasons.push('Ülke eşleşmesi');
    }
  } else {
    score += 5;
  }

  // ── 4. Priority-based scoring (weight: 25) ────────────────────────
  const progress = campaign.goal_amount > 0
    ? (campaign.raised_amount / campaign.goal_amount) * 100
    : 0;

  const createdAt = new Date(campaign.created_at).getTime();
  const now = Date.now();
  const daysActive = (now - createdAt) / (1000 * 60 * 60 * 24);

  switch (preferences.priority) {
    case 'urgent':
      // Campaigns with low funding and/or time pressure
      if (progress < 30) {
        score += 25;
        reasons.push('Acil desteğe ihtiyacı var');
      } else if (progress < 50) {
        score += 15;
      }
      break;
    case 'almost-there':
      // Close to goal – donor can make the difference
      if (progress >= 70 && progress < 100) {
        score += 25;
        reasons.push('Hedefe çok yakın – sen tamamla!');
      } else if (progress >= 50) {
        score += 15;
      }
      break;
    case 'high-achiever':
      // Newer campaigns with some traction
      if (campaign.donor_count >= 3 && progress > 20) {
        score += 25;
        reasons.push('Başarılı ve destekçileri artan öğrenci');
      } else if (campaign.donor_count >= 1) {
        score += 15;
      }
      break;
    default:
      score += 12;
  }

  // ── 5. Budget fit (weight: 10) ────────────────────────────────────
  if (preferences.budget && preferences.budget !== 'any') {
    const remaining = (campaign.goal_amount || 0) - (campaign.raised_amount || 0);
    const { min, max } = parseBudgetRange(preferences.budget);
    if (remaining >= min && remaining <= max * 2) {
      score += 10;
      reasons.push('Bütçenize uygun');
    } else if (remaining > 0) {
      score += 5; // partial fit
    }
  } else {
    score += 5;
  }

  // ── 6. Freshness bonus (weight: 10) ──────────────────────────────
  if (daysActive < 7) {
    score += 10;
    reasons.push('Yeni kampanya');
  } else if (daysActive < 30) {
    score += 5;
  }

  // Normalise to 0-100
  const normalised = Math.min(100, Math.round(score));

  return { score: normalised, reasons };
}

/** Rank and return top N campaigns from a list */
export function rankCampaigns(
  campaigns: any[],
  preferences: DonorPreferences,
  limit = 3
): RecommendedCampaign[] {
  const scored = campaigns
    .filter((c) => c.status === 'published' || c.status === 'active')
    .map((c) => {
      const { score, reasons } = scoreCampaign(c, preferences);
      return { campaign: c, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ campaign: c, score, reasons }) => ({
    campaign_id: c.campaign_id,
    title: c.title,
    story: typeof c.story === 'string' ? c.story.slice(0, 200) + (c.story.length > 200 ? '...' : '') : '',
    category: c.category,
    goal_amount: c.goal_amount,
    raised_amount: c.raised_amount || 0,
    donor_count: c.donor_count || 0,
    cover_image: c.cover_image,
    match_score: score,
    match_reasons: reasons,
    student: {
      name: c.student?.name || 'Öğrenci',
      picture: c.student?.picture || null,
      country: c.student?.country || c.country || null,
      field_of_study: c.student?.field_of_study || c.field_of_study || null,
      university: c.student?.university || null,
      gender: c.student?.gender || null,
    },
  }));
}
