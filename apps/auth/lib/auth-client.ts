const API = process.env.NEXT_PUBLIC_API_URL;

async function authFetch(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/api/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json as { message?: string } };
  return { data: json as Record<string, unknown>, error: null };
}

export const signIn = (params: {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
}) => authFetch("/sign-in/email", params);

export const signUp = (params: {
  email: string;
  password: string;
  name: string;
  callbackURL?: string;
}) => authFetch("/sign-up/email", params);

export const resendVerificationEmail = (params: {
  email: string;
  callbackURL?: string;
}) => authFetch("/send-verification-email", params);

export const requestPasswordReset = (params: {
  email: string;
  redirectTo?: string;
}) => authFetch("/forget-password", params);

export const resetPassword = (params: { newPassword: string; token: string }) =>
  authFetch("/reset-password", params);

export const signInSocial = async (params: {
  provider: "google" | "apple";
  callbackURL: string;
}) => {
  const res = await fetch(`${API}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) return { url: null, error: json as { message?: string } };
  return { url: json.url as string, error: null };
};
