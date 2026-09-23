import { CheckInRecord, FocusSessionRecord, UserPreferences, MoodType, ConcernType, NeedType } from '@/types';

const STORAGE_KEYS = {
  CHECKINS: 'exmello_checkins_v1',
  SESSIONS: 'exmello_sessions_v1',
  PREFERENCES: 'exmello_preferences_v1',
  SAVED_ARTICLES: 'exmello_saved_articles_v1',
  LAST_CHECKIN: 'exmello_last_checkin_v1',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: 'เพื่อนนักศึกษา',
  defaultFocusMinutes: 25,
  soundEnabled: true,
  breathingPacingSeconds: 4,
  isGuest: true,
  theme: 'light',
};

type StoredCheckInRecord = Omit<CheckInRecord, 'concerns'> & {
  concerns?: ConcernType[];
  concern?: ConcernType;
};

// Safe window check for Next.js SSR
function isClient(): boolean {
  return typeof window !== 'undefined';
}

function normalizeCheckIn(record: StoredCheckInRecord): CheckInRecord | null {
  const concerns = Array.isArray(record.concerns)
    ? record.concerns.slice(0, 3)
    : record.concern
      ? [record.concern]
      : [];

  if (concerns.length === 0) return null;

  const { concern: _legacyConcern, ...rest } = record;
  return { ...rest, concerns };
}

export function saveCheckIn(mood: MoodType, concerns: ConcernType[], need?: NeedType): CheckInRecord {
  const record: CheckInRecord = {
    id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    mood,
    concerns: concerns.slice(0, 3),
    need,
  };

  if (!isClient()) return record;

  try {
    const existing = getCheckInHistory();
    const updated = [record, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.LAST_CHECKIN, JSON.stringify(record));
  } catch (e) {
    console.error('Error saving checkin to localStorage:', e);
  }

  return record;
}

export function getLastCheckIn(): CheckInRecord | null {
  if (!isClient()) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_CHECKIN);
    return data ? normalizeCheckIn(JSON.parse(data) as StoredCheckInRecord) : null;
  } catch {
    return null;
  }
}

export function getCheckInHistory(): CheckInRecord[] {
  if (!isClient()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    if (!data) return [];

    return (JSON.parse(data) as StoredCheckInRecord[])
      .map(normalizeCheckIn)
      .filter((record): record is CheckInRecord => record !== null);
  } catch {
    return [];
  }
}

export function saveActivitySession(
  durationMinutes: number,
  type: 'focus' | 'breathing' | 'reset',
  completed: boolean = true,
  label?: string
): FocusSessionRecord {
  const session: FocusSessionRecord = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    durationMinutes,
    completed,
    type,
    label,
  };

  if (!isClient()) return session;

  try {
    const existing = getActivitySessions();
    const updated = [session, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving activity session:', e);
  }

  return session;
}

export function getActivitySessions(): FocusSessionRecord[] {
  if (!isClient()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) {
      // Seed default friendly demo activity if first time
      const defaults: FocusSessionRecord[] = [
        {
          id: 'seed-1',
          timestamp: Date.now() - 3600 * 1000 * 2,
          durationMinutes: 25,
          completed: true,
          type: 'focus',
          label: 'Pomodoro โฟกัสสบาย ๆ',
        },
        {
          id: 'seed-2',
          timestamp: Date.now() - 3600 * 1000 * 5,
          durationMinutes: 3,
          completed: true,
          type: 'breathing',
          label: 'ฝึกหายใจแบบกล่อง (Box Breathing)',
        },
        {
          id: 'seed-3',
          timestamp: Date.now() - 3600 * 1000 * 24,
          durationMinutes: 1,
          completed: true,
          type: 'reset',
          label: 'พักสายตา 60 วินาที',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getTotalMindfulMinutes(): number {
  const sessions = getActivitySessions();
  return sessions
    .filter((s) => s.completed)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
}

export function getUserPreferences(): UserPreferences {
  if (!isClient()) return DEFAULT_PREFERENCES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function updateUserPreferences(updates: Partial<UserPreferences>): UserPreferences {
  if (!isClient()) return { ...DEFAULT_PREFERENCES, ...updates };
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    return updated;
  } catch {
    return { ...DEFAULT_PREFERENCES, ...updates };
  }
}

export function purgeAllData(): void {
  if (!isClient()) return;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.error('Error purging data:', e);
  }
}
