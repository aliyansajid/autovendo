"use client";

import { useState, useEffect } from "react";

const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

// ─── Base fetch ───────────────────────────────────────────────────────────────

async function authFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { data: null, error: data ?? { message: res.statusText } };
  }

  return { data, error: null };
}

// ─── Session hook ─────────────────────────────────────────────────────────────

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  [key: string]: unknown;
};

export type Session = {
  user: SessionUser;
  session: unknown;
} | null;

export function useSession(): { data: Session; isPending: boolean } {
  const [data, setData] = useState<Session>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetch(`${AUTH_BASE}/api/auth/get-session`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((session) => {
        setData(session);
        setIsPending(false);
      })
      .catch(() => {
        setData(null);
        setIsPending(false);
      });
  }, []);

  return { data, isPending };
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function signIn(params: {
  email: string;
  password: string;
  rememberMe: boolean;
  callbackURL?: string;
}) {
  return authFetch("/api/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function signOut(onSuccess?: () => void) {
  const result = await authFetch("/api/auth/sign-out", {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!result.error) onSuccess?.();
  return result;
}

// ─── Admin actions ────────────────────────────────────────────────────────────

export async function impersonateUser(userId: string) {
  return authFetch("/api/auth/admin/impersonate-user", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function stopImpersonating() {
  return authFetch("/api/auth/admin/stop-impersonating", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
