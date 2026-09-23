import { ConcernType, MoodType, NeedType } from '@/types';
import { createCheckin, getAuthSession } from '@/lib/api';
import { saveCheckIn } from '@/lib/storage';

export async function submitCheckin(mood: MoodType, concerns: ConcernType[], need?: NeedType): Promise<string> {
  if (getAuthSession()) {
    const created = await createCheckin(mood, concerns, need);
    return `/recommendation?checkinId=${encodeURIComponent(created.id)}`;
  }

  saveCheckIn(mood, concerns, need);
  const query = new URLSearchParams({ mood });
  concerns.forEach((concern) => query.append('concern', concern));
  if (need) query.set('need', need);
  return `/recommendation?${query.toString()}`;
}
