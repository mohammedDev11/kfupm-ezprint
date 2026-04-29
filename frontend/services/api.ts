"use client";

export type Scope = "user" | "admin";

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: "Admin" | "SubAdmin" | "User";
};

export type AuthSession = {
  scope: Scope;
  token: string;
  user: AuthUser;
};

type LoginCredentials = {
  emailOrUsername: string;
  password: string;
};

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  scope: Scope;
  headers?: HeadersInit;
};

type UploadOptions = {
  path: string;
  scope: Scope;
  file: File;
  metadata?: Record<string, string | number | undefined | null>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api/v1";

const TOKEN_STORAGE_KEYS: Record<Scope, string> = {
  user: "alpha_queue_user_token",
  admin: "alpha_queue_admin_token",
};

const USER_STORAGE_KEYS: Record<Scope, string> = {
  user: "alpha_queue_user_profile",
  admin: "alpha_queue_admin_profile",
};

const CURRENT_SCOPE_KEY = "alpha_queue_current_scope";

const roleToScope = (role: string): Scope =>
  role === "Admin" || role === "SubAdmin" ? "admin" : "user";

const readJson = <T>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const readToken = (scope: Scope) => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEYS[scope]) || "";
};

const writeSession = (
  session: AuthSession,
  { setCurrent = true }: { setCurrent?: boolean } = {},
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEYS[session.scope], session.token);
  window.localStorage.setItem(
    USER_STORAGE_KEYS[session.scope],
    JSON.stringify(session.user),
  );

  if (setCurrent) {
    window.localStorage.setItem(CURRENT_SCOPE_KEY, session.scope);
  }
};

export const getSession = (scope: Scope): AuthSession | null => {
  const token = readToken(scope);
  const user = readJson<AuthUser>(USER_STORAGE_KEYS[scope]);

  if (!token || !user) {
    return null;
  }

  return {
    scope,
    token,
    user,
  };
};

export const getCurrentScope = (): Scope | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(CURRENT_SCOPE_KEY);
  return rawValue === "user" || rawValue === "admin" ? rawValue : null;
};

export const getCurrentSession = (): AuthSession | null => {
  const currentScope = getCurrentScope();

  if (currentScope) {
    return getSession(currentScope);
  }

  return getSession("user") || getSession("admin");
};

export const clearScopeSession = (scope: Scope) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEYS[scope]);
  window.localStorage.removeItem(USER_STORAGE_KEYS[scope]);

  if (getCurrentScope() === scope) {
    window.localStorage.removeItem(CURRENT_SCOPE_KEY);
  }
};

export const logoutAllSessions = () => {
  clearScopeSession("user");
  clearScopeSession("admin");
};

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    return payload?.message || payload?.error || "Request failed.";
  } catch {
    return "Request failed.";
  }
};

export const loginLocal = async (
  credentials: LoginCredentials,
): Promise<AuthSession> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await response.json();
  const token = payload?.data?.token as string;
  const user = payload?.data?.user as AuthUser;

  if (!token || !user) {
    throw new Error("Login response is missing token or user data.");
  }

  const session: AuthSession = {
    scope: roleToScope(user.role),
    token,
    user,
  };

  writeSession(session);

  if (session.scope === "admin") {
    writeSession({ ...session, scope: "user" }, { setCurrent: false });
  }

  return session;
};

const request = async <T>(
  path: string,
  { method = "GET", body, scope, headers }: ApiRequestOptions,
): Promise<T> => {
  const session = getSession(scope);

  if (!session?.token) {
    throw new Error("You are not logged in.");
  }

  const requestHeaders = new Headers(headers || {});
  requestHeaders.set("Authorization", `Bearer ${session.token}`);

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache: "no-store",
  };

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

  if (!response.ok) {
    const message = await parseErrorMessage(response);

    if (response.status === 401) {
      clearScopeSession(scope);
    }

    throw new Error(message);
  }

  const payload = await response.json();
  return (payload?.data ?? payload) as T;
};

export const apiGet = async <T>(path: string, scope: Scope): Promise<T> =>
  request<T>(path, { scope });

export const apiPost = async <T>(
  path: string,
  body: unknown,
  scope: Scope,
): Promise<T> => request<T>(path, { method: "POST", body, scope });

export const apiPatch = async <T>(
  path: string,
  body: unknown,
  scope: Scope,
): Promise<T> => request<T>(path, { method: "PATCH", body, scope });

export const apiDelete = async <T>(path: string, scope: Scope): Promise<T> =>
  request<T>(path, { method: "DELETE", scope });

const publicRequest = async <T>(
  path: string,
  { method = "GET", body }: Omit<ApiRequestOptions, "scope"> = {},
): Promise<T> => {
  const headers = new Headers();
  const requestOptions: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = await response.json();
  return (payload?.data ?? payload) as T;
};

export const apiPublicGet = async <T>(path: string): Promise<T> =>
  publicRequest<T>(path);

export const apiPublicPost = async <T>(
  path: string,
  body: unknown,
): Promise<T> => publicRequest<T>(path, { method: "POST", body });

export const apiUpload = async <T>({
  path,
  scope,
  file,
  metadata = {},
}: UploadOptions): Promise<T> => {
  const session = getSession(scope);

  if (!session?.token) {
    throw new Error("You are not logged in.");
  }

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${session.token}`);
  headers.set("Content-Type", file.type || "application/pdf");
  headers.set("X-Alpha-File-Name", file.name);
  headers.set("X-Alpha-Original-File-Name", file.name);

  Object.entries(metadata).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    const normalizedKey = `X-Alpha-${key
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/_/g, "-")}`;

    headers.set(normalizedKey, String(value));
  });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: file,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);

    if (response.status === 401) {
      clearScopeSession(scope);
    }

    throw new Error(message);
  }

  const payload = await response.json();
  return (payload?.data ?? payload) as T;
};
