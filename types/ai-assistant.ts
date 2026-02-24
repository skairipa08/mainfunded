// ─── AI Assistant Types ──────────────────────────────────────────────

/** Chat message sender */
export type MessageSender = 'bot' | 'user';

/** Chat flow step identifiers */
export type ChatStep =
  | 'welcome'
  | 'ask_field'
  | 'ask_gender'
  | 'ask_budget'
  | 'ask_priority'
  | 'ask_country'
  | 'searching'
  | 'results'
  | 'faq'
  | 'faq_answer'
  | 'idle';

/** A single chat message */
export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  /** Quick-reply button options shown after this message */
  quickReplies?: QuickReply[];
  /** Recommendation cards shown after this message */
  recommendations?: RecommendedCampaign[];
}

/** Quick reply button */
export interface QuickReply {
  label: string;
  value: string;
  icon?: string;
}

/** User preferences collected during the chat flow */
export interface DonorPreferences {
  field?: string;       // e.g. "engineering", "medicine", "any"
  gender?: string;      // e.g. "female", "male", "any"
  budget?: string;      // e.g. "50-100", "100-500", "500+", "any"
  priority?: string;    // e.g. "urgent", "high-achiever", "almost-there"
  country?: string;     // e.g. "Turkey", "any"
}

/** Enriched campaign returned as a recommendation */
export interface RecommendedCampaign {
  campaign_id: string;
  title: string;
  story: string;
  category: string;
  goal_amount: number;
  raised_amount: number;
  donor_count: number;
  cover_image?: string;
  match_score: number;          // 0-100
  match_reasons: string[];      // e.g. ["Bölüm eşleşmesi", "Acil ihtiyaç"]
  student: {
    name: string;
    picture?: string | null;
    country?: string | null;
    field_of_study?: string | null;
    university?: string | null;
    gender?: string | null;
  };
}

/** Chat session state (persisted in context) */
export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  currentStep: ChatStep;
  preferences: DonorPreferences;
  isOpen: boolean;
  isMinimized: boolean;
  startedAt: number;
  /** Whether the proactive trigger has already fired this session */
  triggerFired: boolean;
}

/** FAQ entry */
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: 'trust' | 'payment' | 'process' | 'student' | 'general';
}

/** Smart trigger types */
export type TriggerType =
  | 'idle'       // User idle on campaign pages
  | 'scroll'     // User scrolled through multiple campaigns
  | 'exit'       // Exit intent detected
  | 'return';    // Returning visitor without donation

export interface TriggerEvent {
  type: TriggerType;
  message: string;
  timestamp: number;
}

/** API request/response types */
export interface RecommendRequest {
  preferences: DonorPreferences;
  limit?: number;
}

export interface RecommendResponse {
  success: boolean;
  data: RecommendedCampaign[];
}

export interface FaqRequest {
  query: string;
}

export interface FaqResponse {
  success: boolean;
  data: {
    answer: string;
    relatedQuestions: string[];
  };
}
