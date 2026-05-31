import { API_BASE } from "./fetch-helpers";

export async function apiSendContact(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
}): Promise<{ message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      contactEmail: "info@autosolo.ch",
      appName: "AutoSolo",
      appUrl: "https://autosolo.ch",
    }),
  });
  return res.json().catch(() => ({}));
}
