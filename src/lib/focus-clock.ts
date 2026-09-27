export type FocusStatus =
  | "ready"
  | "running"
  | "paused"
  | "elapsed"
  | "completed";
export interface FocusClock {
  id: string;
  owner: string;
  apiId: string | null;
  minutes: number;
  remainingMs: number;
  endAt: number | null;
  status: FocusStatus;
}
export function validMinutes(value: number): number {
  return Number.isFinite(value) && value >= 1 && value <= 180
    ? Math.floor(value)
    : 25;
}
export function remainingTime(clock: FocusClock, now: number): number {
  return Math.max(
    0,
    clock.status === "running" && clock.endAt !== null
      ? Math.min(clock.remainingMs, clock.endAt - now)
      : clock.remainingMs,
  );
}
export function pauseClock(clock: FocusClock, now: number): FocusClock {
  const remainingMs = remainingTime(clock, now);
  return {
    ...clock,
    remainingMs,
    endAt: null,
    status: remainingMs === 0 ? "elapsed" : "paused",
  };
}
export function resumeClock(clock: FocusClock, now: number): FocusClock {
  return {
    ...clock,
    endAt: now + clock.remainingMs,
    status: clock.remainingMs === 0 ? "elapsed" : "running",
  };
}
export function restoreClock(
  raw: string | null,
  owner: string,
): FocusClock | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as FocusClock;
    if (
      value.owner !== owner ||
      typeof value.id !== "string" ||
      !value.id ||
      (value.apiId !== null && typeof value.apiId !== "string") ||
      !Number.isInteger(value.minutes) ||
      value.minutes < 1 ||
      value.minutes > 180 ||
      !Number.isFinite(value.remainingMs) ||
      value.remainingMs < 0 ||
      value.remainingMs > value.minutes * 60000 ||
      !["running", "paused", "elapsed", "completed"].includes(value.status) ||
      (value.status === "running" && !Number.isFinite(value.endAt)) ||
      (["elapsed", "completed"].includes(value.status) &&
        value.remainingMs !== 0)
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
