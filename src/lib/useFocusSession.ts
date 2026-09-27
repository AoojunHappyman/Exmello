"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  createFocusSession,
  getAuthSession,
  getFocusSessions,
  onAuthChange,
  readableApiError,
  updateFocusSession,
} from "@/lib/api";
import { getUserPreferences, saveActivitySession } from "@/lib/storage";
import {
  FocusClock,
  pauseClock,
  remainingTime,
  restoreClock,
  resumeClock,
  validMinutes,
} from "@/lib/focus-clock";

const KEY = "exmello_active_focus_v1";
const ownerId = () => getAuthSession()?.user.id || "guest";
function ready(minutes: number): FocusClock {
  return {
    id: "",
    owner: ownerId(),
    apiId: null,
    minutes: validMinutes(minutes),
    remainingMs: validMinutes(minutes) * 60000,
    endAt: null,
    status: "ready",
  };
}
export function useFocusSession(initialMinutes?: number) {
  const [clock, setClock] = useState<FocusClock>(() =>
    ready(initialMinutes ?? 25),
  );
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    try {
      const stored = restoreClock(localStorage.getItem(KEY), ownerId());
      setClock(
        stored ||
          ready(initialMinutes ?? getUserPreferences().defaultFocusMinutes),
      );
    } catch {
      /* storage unavailable */
    }
    setHydrated(true);
  }, [initialMinutes]);
  useEffect(
    () =>
      onAuthChange(() => {
        setClock((current) =>
          current.owner === ownerId()
            ? current
            : ready(initialMinutes ?? getUserPreferences().defaultFocusMinutes),
        );
      }),
    [initialMinutes],
  );
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (clock.status === "ready") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify(clock));
    } catch {
      /* timer still works without persistence */
    }
  }, [clock, hydrated]);
  useEffect(() => {
    if (clock.status !== "running") return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (remainingTime(clock, time) === 0)
        setClock((value) => ({
          ...value,
          status: "elapsed",
          remainingMs: 0,
          endAt: null,
        }));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [clock]);

  const complete = useCallback(async () => {
    if (lock.current || clock.status !== "elapsed") return;
    lock.current = true;
    setPending(true);
    setError("");
    try {
      if (clock.owner !== ownerId()) throw new ApiError(401, "Session changed");
      if (clock.apiId) {
        try {
          await updateFocusSession(clock.apiId, "completed");
        } catch (cause) {
          // Recover a successful write whose response was lost.
          const stored = (await getFocusSessions(100)).find(
            (item) => item.id === clock.apiId,
          );
          if (stored?.status !== "completed") throw cause;
        }
      } else {
        saveActivitySession(
          clock.minutes,
          "focus",
          true,
          `โฟกัส ${clock.minutes} นาที`,
          clock.id,
        );
      }
      setClock((value) => ({ ...value, status: "completed" }));
    } catch (cause) {
      setError(readableApiError(cause));
    } finally {
      lock.current = false;
      setPending(false);
    }
  }, [clock]);
  useEffect(() => {
    if (hydrated && clock.status === "elapsed" && !error) void complete();
  }, [hydrated, clock.status, complete, error]);

  async function start() {
    if (
      lock.current ||
      !hydrated ||
      clock.status === "completed" ||
      clock.status === "elapsed"
    )
      return;
    if (clock.status === "running") {
      setClock(pauseClock(clock, Date.now()));
      return;
    }
    lock.current = true;
    setPending(true);
    setError("");
    try {
      if (clock.status === "paused") {
        if (clock.owner !== ownerId())
          throw new ApiError(401, "Session changed");
        setNow(Date.now());
        setClock(resumeClock(clock, Date.now()));
      } else {
        const account = getAuthSession();
        const session = account
          ? await createFocusSession(clock.minutes)
          : null;
        setNow(Date.now());
        setClock(
          resumeClock(
            {
              ...ready(clock.minutes),
              id: crypto.randomUUID(),
              owner: account?.user.id || "guest",
              apiId: session?.id || null,
            },
            Date.now(),
          ),
        );
      }
    } catch (cause) {
      setError(readableApiError(cause));
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  async function reset(minutes = clock.minutes): Promise<boolean> {
    if (lock.current) return false;
    lock.current = true;
    setPending(true);
    setError("");
    if (clock.status === "running") setClock(pauseClock(clock, Date.now()));
    try {
      if (clock.apiId && !["ready", "completed"].includes(clock.status)) {
        if (clock.owner !== ownerId())
          throw new ApiError(401, "Session changed");
        try {
          await updateFocusSession(clock.apiId, "cancelled");
        } catch (cause) {
          const stored = (await getFocusSessions(100)).find(
            (item) => item.id === clock.apiId,
          );
          if (stored?.status !== "cancelled") throw cause;
        }
      }
      setClock(ready(minutes));
      setNow(Date.now());
      return true;
    } catch (cause) {
      setError(readableApiError(cause));
      return false;
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return {
    clock,
    seconds: Math.ceil(remainingTime(clock, now) / 1000),
    hydrated,
    pending,
    error,
    start,
    reset,
    retry: complete,
  };
}
