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

export type SessionData = {
  id: string;
  userId: string;
  expiresAt: string;
  [key: string]: unknown;
};

export type Session = {
  user: SessionUser;
  session: SessionData;
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
  const result = await authFetch("/api/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!result.error && result.data?.redirect && result.data?.url) {
    window.location.href = result.data.url;
  }

  return result;
}

export async function signUp(params: {
  email: string;
  password: string;
  name: string;
  callbackURL?: string;
}) {
  return authFetch("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function resendVerificationEmail(params: {
  email: string;
  callbackURL?: string;
}) {
  return authFetch("/api/auth/send-verification-email", {
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

export async function requestPasswordReset(params: {
  email: string;
  redirectTo: string;
}) {
  return authFetch("/api/auth/forget-password", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function resetPassword(params: {
  newPassword: string;
  token: string;
}) {
  return authFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) {
  return authFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function updateUser(params: Record<string, unknown>) {
  return authFetch("/api/auth/update-user", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function changeEmail(params: {
  newEmail: string;
  callbackURL?: string;
}) {
  return authFetch("/api/auth/change-email", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
