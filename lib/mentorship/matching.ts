import { MatchRequest, MentorMatchScore, MentorProfileRecord } from '@/lib/mentorship/types';

const STOPWORDS = new Set([
  'and', 'or', 'the', 'for', 'with', 'to', 'in', 'of', 'a', 'an',
  've', 'ile', 'için', 'icin', 'bir', 'bu', 'şu', 'su', 'da', 'de',
]);

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  if (!value) {
    return [];
  }

  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function jaccardSimilarity(left: string[], right: string[]): number {
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  if (leftSet.size === 0 || rightSet.size === 0) {
    return 0;
  }

  let intersectionCount = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) {
      intersectionCount += 1;
    }
  }

  const unionSize = new Set([...leftSet, ...rightSet]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

export function scoreMentorMatch(
  request: MatchRequest,
  mentor: MentorProfileRecord,
): MentorMatchScore {
  const reasons: string[] = [];

  const goalTokens = tokenize(request.careerGoal);
  const expertiseTokens = tokenize(mentor.expertise_areas.join(' '));
  const expertiseSimilarity = jaccardSimilarity(goalTokens, expertiseTokens);
  const expertiseScore = Math.round(expertiseSimilarity * 55);

  if (expertiseScore > 0) {
    reasons.push(`Kariyer hedefi ile uzmanlık uyumu: +${expertiseScore}`);
  }

  let sectorScore = 0;
  const preferredSector = normalizeText(request.preferredSector || '');
  const mentorSector = normalizeText(mentor.sector || '');
  const industries = mentor.industries.map((industry) => normalizeText(industry));
  if (preferredSector && (mentorSector === preferredSector || industries.includes(preferredSector))) {
    sectorScore = 20;
    reasons.push(`Sektör eşleşmesi: +${sectorScore}`);
  }

  let languageScore = 0;
  const preferredLanguage = normalizeText(request.preferredLanguage || '');
  const mentorLanguages = mentor.languages.map((language) => normalizeText(language));
  if (preferredLanguage && mentorLanguages.includes(preferredLanguage)) {
    languageScore = 15;
    reasons.push(`Dil eşleşmesi: +${languageScore}`);
  }

  let availabilityScore = 0;
  if (typeof request.preferredDayOfWeek === 'number') {
    const hasWindow = mentor.availability_windows.some(
      (window) => window.dayOfWeek === request.preferredDayOfWeek && window.endMinute > window.startMinute,
    );
    if (hasWindow) {
      availabilityScore = 10;
      reasons.push(`Müsaitlik eşleşmesi: +${availabilityScore}`);
    }
  }

  const score = Math.max(0, Math.min(100, expertiseScore + sectorScore + languageScore + availabilityScore));

  return {
    mentor_profile_id: mentor.mentor_profile_id,
    mentor_user_id: mentor.user_id,
    score,
    reasons,
  };
}

export function rankMentors(request: MatchRequest, mentors: MentorProfileRecord[]): MentorMatchScore[] {
  return mentors
    .map((mentor) => scoreMentorMatch(request, mentor))
    .sort((left, right) => right.score - left.score)
    .slice(0, 10);
}
