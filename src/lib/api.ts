import { useAuthStore, type User } from "./auth-state";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields: { field: string; message: string }[] = [],
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Session = { accessToken: string; user: User };
let refreshPromise: Promise<Session | null> | null = null;
let authGeneration = 0;

export function clearSession() {
  authGeneration++;
  useAuthStore.getState().clear();
}

export function setSession(session: Session) {
  authGeneration++;
  useAuthStore.getState().setSession(session.accessToken, session.user);
}

async function payloadOf(response: Response): Promise<unknown> {
  if (
    !(response.headers.get("content-type") || "").includes("application/json")
  )
    return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function apiError(response: Response, payload: unknown) {
  const data =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const fields = Array.isArray(data.errors)
    ? data.errors.filter(
        (e): e is { field: string; message: string } =>
          !!e && typeof e.field === "string" && typeof e.message === "string",
      )
    : [];
  return new ApiError(
    typeof data.message === "string"
      ? data.message
      : `Request failed (${response.status}).`,
    response.status,
    fields,
    typeof data.code === "string" ? data.code : undefined,
  );
}

async function refresh(): Promise<Session | null> {
  if (refreshPromise) return refreshPromise;
  const generation = authGeneration;
  const work = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      const data = await payloadOf(response);
      if (generation !== authGeneration) return null;
      if (!response.ok || !isSession(data)) {
        clearSession();
        return null;
      }
      setSession(data);
      return data;
    } catch {
      if (generation === authGeneration) clearSession();
      return null;
    }
  })();
  refreshPromise = work;
  void work.finally(() => {
    if (refreshPromise === work) refreshPromise = null;
  });
  return work;
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Session>;
  return (
    typeof v.accessToken === "string" &&
    !!v.user &&
    typeof v.user.id === "number" &&
    typeof v.user.name === "string" &&
    ["staff", "manager", "owner"].includes(v.user.role)
  );
}

export const restoreSession = refresh;

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function request<T>(
  path: string,
  options: Options = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;
  const send = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      cache: "no-store",
      signal,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  let response = await send(auth ? useAuthStore.getState().accessToken : null);
  if (response.status === 401 && auth) {
    const session = await refresh();
    if (!session)
      throw new ApiError(
        "Your session has expired. Please sign in again.",
        401,
      );
    response = await send(session.accessToken);
  }
  const payload = await payloadOf(response);
  if (!response.ok) {
    if (response.status === 401 && auth) clearSession();
    throw apiError(response, payload);
  }
  return payload as T;
}

// QR downloads are binary or HTML attachments, not JSON. Use the same in-memory
// access token and single-flight refresh policy as request(), with no credentials
// or bearer token in the attachment URL.
export async function attachment(path: string): Promise<Blob> {
  const send = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  let response = await send(useAuthStore.getState().accessToken);
  if (response.status === 401) {
    const session = await refresh();
    if (!session)
      throw new ApiError(
        "Your session has expired. Please sign in again.",
        401,
      );
    response = await send(session.accessToken);
  }
  if (!response.ok) {
    const payload = await payloadOf(response);
    if (response.status === 401) clearSession();
    throw apiError(response, payload);
  }
  return response.blob();
}

export async function login(email: string, pwd: string) {
  const session = await request<Session>("/auth/login", {
    method: "POST",
    body: { email, pwd },
    auth: false,
  });
  if (!isSession(session)) throw new ApiError("Unexpected login response.", 0);
  setSession(session);
  return session;
}

export async function logout() {
  await request("/auth/logout", { method: "POST", auth: false });
  clearSession();
}

export const currentUser = () =>
  request<{ success: true; data: User & { active: boolean } }>("/auth/me");
export const forgotPassword = (email: string) =>
  request<{ message: string }>("/auth/password/forgot", {
    method: "POST",
    body: { email },
    auth: false,
  });
export const resetPassword = (token: string, newPwd: string) =>
  request<{ message: string }>("/auth/password/reset", {
    method: "PATCH",
    body: { token, newPwd },
    auth: false,
  });
export const validateInvite = (token: string) =>
  request<{ success: true; data: { expiresAt: string } }>(
    "/auth/invite/validate",
    { method: "POST", body: { token }, auth: false },
  );
export const acceptInvite = (token: string, newPwd: string) =>
  request<{ message: string }>("/auth/invite/accept", {
    method: "PATCH",
    body: { token, newPwd },
    auth: false,
  });
