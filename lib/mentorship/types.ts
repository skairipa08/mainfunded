export type SupportType = 'money' | 'time' | 'both';

export interface AvailabilityWindow {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  timezone: string;
}

export interface MentorProfileRecord {
  mentor_profile_id: string;
  user_id: string;
  full_name: string;
  expertise_areas: string[];
  industries: string[];
  sector: string;
  languages: string[];
  availability_windows: AvailabilityWindow[];
  calendly_user_uri?: string;
  calcom_username?: string;
  accepting_new_students: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MatchRequest {
  studentId: string;
  careerGoal: string;
  preferredLanguage?: string;
  preferredSector?: string;
  preferredDayOfWeek?: number;
}

export interface MentorMatchScore {
  mentor_profile_id: string;
  mentor_user_id: string;
  score: number;
  reasons: string[];
}
