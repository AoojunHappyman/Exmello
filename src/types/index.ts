export type MoodType = 'great' | 'good' | 'okay' | 'stressed' | 'overwhelmed';

export interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  description: string;
  bgLight: string;
  color: string;
  ringColor: string;
}

export type ConcernType =
  | 'cant_finish'
  | 'cant_remember'
  | 'running_out_of_time'
  | 'didnt_sleep'
  | 'worried_exam'
  | 'racing_thoughts'
  | 'exhausted'
  | 'other';

export interface ConcernOption {
  id: ConcernType;
  label: string;
  meaning: string;
  icon?: string;
}

export type NeedType = 'focus' | 'calm' | 'break' | 'motivated';

export interface NeedOption {
  id: NeedType;
  label: string;
  description: string;
  emoji: string;
}

export interface RecommendationResult {
  id: string;
  headline: string;
  message: string;
  bullets?: string[];
  primaryAction: {
    type: 'focus' | 'breathing' | 'reset' | 'resource';
    label: string;
    path: string;
    durationMinutes?: number;
    mode?: string;
  };
  secondaryActions: Array<{
    type: 'focus' | 'breathing' | 'reset' | 'resource';
    label: string;
    path: string;
  }>;
  mascotQuote?: string;
  badge?: string;
}

export interface CheckInRecord {
  id: string;
  timestamp: number;
  mood: MoodType;
  concern: ConcernType;
  need?: NeedType;
}

export interface FocusSessionRecord {
  id: string;
  timestamp: number;
  durationMinutes: number;
  completed: boolean;
  type: 'focus' | 'breathing' | 'reset';
  label?: string;
}

export interface ResourceArticle {
  id: string;
  title: string;
  category: 'study' | 'stress' | 'sleep' | 'lifestyle';
  categoryLabel: string;
  readingTimeMinutes: number;
  summary: string;
  coverImage: string;
  badge: string;
  contentMarkdown: string;
  keyTakeaways: string[];
  suggestedAction?: {
    label: string;
    path: string;
  };
}

export interface UserPreferences {
  displayName: string;
  defaultFocusMinutes: number;
  soundEnabled: boolean;
  breathingPacingSeconds: number;
  isGuest: boolean;
  theme: 'light' | 'dark' | 'system';
}
