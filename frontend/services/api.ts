"use client";

type Scope = "user" | "admin";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api/v1";

const TOKEN_STORAGE_KEYS: Record<Scope, string> = {
  user: "alpha_queue_user_token",
  admin: "alpha_queue_admin_token",
};

const DEMO_CREDENTIALS: Record<Scope, { emailOrUsername: string; password: string }> = {
  user: { emailOrUsername: "202279720", password: "user12345" },
  admin: { emailOrUsername: "admin", password: "admin123" },
};

const readStoredToken = (scope: Scope) => {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(TOKEN_STORAGE_KEYS[scope]) ||
    window.localStorage.getItem("alpha_queue_token") ||
    ""
  );
};

const persistToken = (scope: Scope, token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEYS[scope], token);
};

const loginForScope = async (scope: Scope) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(DEMO_CREDENTIALS[scope]),
  });

  if (!response.ok) {
    throw new Error(`Failed to login for ${scope} scope.`);
  }

  const payload = await response.json();
  const token = payload?.data?.token || "";

  if (!token) {
    throw new Error(`Missing token in ${scope} login response.`);
  }

  persistToken(scope, token);
  return token;
};

const resolveToken = async (scope: Scope) => {
  const stored = readStoredToken(scope);
  if (stored) return stored;
  return loginForScope(scope);
};

export const apiGet = async <T>(path: string, scope: Scope): Promise<T> => {
  const token = await resolveToken(scope);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }

  const payload = await response.json();
  return payload?.data as T;
};
