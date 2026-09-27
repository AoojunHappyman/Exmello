import {
  ConcernType,
  MoodType,
  NeedType,
  RecommendationResult,
  ResourceArticle,
} from "@/types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");
const SESSION_KEY = "exmello_auth_v1";
const AUTH_EVENT = "exmello-auth-change";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  token_type: "bearer";
}

export interface ApiCheckin {
  id: string;
  mood: MoodType;
  concerns: ConcernType[];
  needs: NeedType[];
  created_at: string;
  recommendation_id: string;
  recommendation: RecommendationResult;
}

export interface ApiFocusSession {
  id: string;
  duration_minutes: number;
  session_type: "focus";
  status: "in_progress" | "completed" | "cancelled";
  started_at: string;
  completed_at: string | null;
}

export interface ApiDashboard {
  total_checkins: number;
  recent_checkin: ApiCheckin | null;
  total_focus_sessions: number;
  completed_focus_sessions: number;
  completed_focus_minutes: number;
}

interface ResourceResponse
  extends Omit<ResourceArticle, "coverImage" | "badge" | "suggestedAction"> {
  coverImage: string | null;
  badge: string | null;
  suggestedAction: ResourceArticle["suggestedAction"] | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return typeof session.token === "string" &&
      typeof session.user?.id === "string"
      ? session
      : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function onAuthChange(listener: () => void): () => void {
  window.addEventListener(AUTH_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const session = authenticated ? getAuthSession() : null;
  if (authenticated && !session)
    throw new ApiError(401, "กรุณาเข้าสู่ระบบอีกครั้ง");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    signal: init.signal || AbortSignal.timeout(15000),
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && authenticated) clearAuthSession();
    const body = await response.json().catch(() => null);
    const detail =
      typeof body?.detail === "string"
        ? body.detail
        : `API error ${response.status}`;
    throw new ApiError(response.status, detail);
  }

  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}

export function readableApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 && error.message === "Invalid email or password")
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (error.status === 401) return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง";
    if (error.status === 409 && error.message === "Email already registered")
      return "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ";
    if (error.status === 422) return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    if (error.status === 404)
      return "ยังไม่พบข้อมูลนี้ ลองกลับไปเลือกอีกครั้งนะ";
    if (error.status === 409)
      return "สถานะกิจกรรมเปลี่ยนไปแล้ว กรุณาโหลดข้อมูลอีกครั้ง";
    if (error.status === 429)
      return "มีคำขอเข้ามาหลายครั้ง รอสักครู่แล้วลองใหม่นะ";
    return "โหลดข้อมูลไม่สำเร็จ ลองอีกครั้งได้เลย";
  }
  return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง";
}

export function register(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthSession> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName || null }),
  });
}

export function login(email: string, password: string): Promise<AuthSession> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function deleteAccount(): Promise<void> {
  return request("/api/auth/me", { method: "DELETE" }, true);
}

export function createCheckin(
  mood: MoodType,
  concerns: ConcernType[],
  need?: NeedType,
): Promise<ApiCheckin> {
  return request(
    "/api/checkins",
    {
      method: "POST",
      body: JSON.stringify({ mood, concerns, needs: need ? [need] : [] }),
    },
    true,
  );
}

export function getCheckin(id: string): Promise<ApiCheckin> {
  return request(`/api/checkins/${encodeURIComponent(id)}`, {}, true);
}

export function getCheckins(limit = 50): Promise<ApiCheckin[]> {
  return request(`/api/checkins?limit=${limit}`, {}, true);
}

export function createFocusSession(
  durationMinutes: number,
): Promise<ApiFocusSession> {
  return request(
    "/api/focus-sessions",
    {
      method: "POST",
      body: JSON.stringify({ duration_minutes: durationMinutes }),
    },
    true,
  );
}

export function updateFocusSession(
  id: string,
  status: "completed" | "cancelled",
): Promise<ApiFocusSession> {
  return request(
    `/api/focus-sessions/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    true,
  );
}

export function getFocusSessions(limit = 50): Promise<ApiFocusSession[]> {
  return request(`/api/focus-sessions?limit=${limit}`, {}, true);
}

export function getDashboard(): Promise<ApiDashboard> {
  return request("/api/dashboard", {}, true);
}

function resourceFromApi(resource: ResourceResponse): ResourceArticle {
  return {
    ...resource,
    coverImage: resource.coverImage || "",
    badge: resource.badge || resource.categoryLabel,
    suggestedAction: resource.suggestedAction || undefined,
  };
}

export async function getResources(
  category?: string,
): Promise<ResourceArticle[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return (await request<ResourceResponse[]>(`/api/resources${query}`)).map(
    resourceFromApi,
  );
}

export async function getResource(id: string): Promise<ResourceArticle> {
  return resourceFromApi(
    await request<ResourceResponse>(`/api/resources/${encodeURIComponent(id)}`),
  );
}
