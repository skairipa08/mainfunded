import { describe, it, expect } from 'vitest';
import { rankMentors, scoreMentorMatch } from '@/lib/mentorship/matching';
import type { MentorProfileRecord } from '@/lib/mentorship/types';

const mentorA: MentorProfileRecord = {
  mentor_profile_id: 'mentor-a',
  user_id: 'u-mentor-a',
  full_name: 'Mentor A',
  expertise_areas: ['Software Engineering', 'Backend', 'Node.js'],
  industries: ['Technology', 'SaaS'],
  sector: 'Technology',
  languages: ['Turkish', 'English'],
  availability_windows: [{ dayOfWeek: 2, startMinute: 600, endMinute: 900, timezone: 'Europe/Istanbul' }],
  accepting_new_students: true,
  created_at: new Date(),
  updated_at: new Date(),
};

const mentorB: MentorProfileRecord = {
  mentor_profile_id: 'mentor-b',
  user_id: 'u-mentor-b',
  full_name: 'Mentor B',
  expertise_areas: ['Graphic Design', 'Branding'],
  industries: ['Media'],
  sector: 'Media',
  languages: ['English'],
  availability_windows: [{ dayOfWeek: 4, startMinute: 600, endMinute: 800, timezone: 'Europe/London' }],
  accepting_new_students: true,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Mentorship matching', () => {
  it('scores higher for goal-aligned mentor', () => {
    const request = {
      studentId: 'student-1',
      careerGoal: 'Backend software engineer olmak istiyorum',
      preferredLanguage: 'Turkish',
      preferredSector: 'Technology',
      preferredDayOfWeek: 2,
    };

    const scoreA = scoreMentorMatch(request, mentorA);
    const scoreB = scoreMentorMatch(request, mentorB);

    expect(scoreA.score).toBeGreaterThan(scoreB.score);
    expect(scoreA.reasons.length).toBeGreaterThan(0);
  });

  it('returns ranked mentors in descending score', () => {
    const request = {
      studentId: 'student-1',
      careerGoal: 'Backend software engineer olmak istiyorum',
      preferredLanguage: 'Turkish',
      preferredSector: 'Technology',
      preferredDayOfWeek: 2,
    };

    const ranked = rankMentors(request, [mentorB, mentorA]);
    expect(ranked[0].mentor_profile_id).toBe('mentor-a');
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });
});
