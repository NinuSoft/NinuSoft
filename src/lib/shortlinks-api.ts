export const SHORTLINKS_API_URL = (
  import.meta.env.VITE_SHORTLINKS_API_URL ||
  "https://shortlinks.ninusoft.workers.dev"
).replace(/\/$/, "");

export type Shortlink = {
  id: string;
  code: string;
  targetUrl: string;
  clickCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${SHORTLINKS_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!response.ok) {
    throw new ApiError(
      payload.error || "تعذر الاتصال بخدمة الروابط المختصرة.",
      response.status,
      payload.code,
    );
  }
  return payload as T;
}

function adminRequest<T>(
  adminKey: string,
  path: string,
  init: RequestInit = {},
) {
  return apiRequest<T>(`/v1/admin${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${adminKey}`,
    },
  });
}

export function shortlinkUrl(code: string): string {
  return `https://ninusoft.com/s/${code}`;
}

export function listShortlinks(adminKey: string) {
  return adminRequest<{ shortlinks: Shortlink[] }>(adminKey, "/shortlinks");
}

export function getShortlink(adminKey: string, id: string) {
  return adminRequest<{ shortlink: Shortlink }>(adminKey, `/shortlinks/${id}`);
}

export function createShortlink(
  adminKey: string,
  input: { targetUrl: string; code?: string; expiresAt?: string | null },
) {
  return adminRequest<{ shortlink: Shortlink }>(adminKey, "/shortlinks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateShortlink(
  adminKey: string,
  id: string,
  patch: { targetUrl?: string; active?: boolean; expiresAt?: string | null },
) {
  return adminRequest<{ shortlink: Shortlink }>(adminKey, `/shortlinks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteShortlink(adminKey: string, id: string) {
  return adminRequest<{ ok: true }>(adminKey, `/shortlinks/${id}`, {
    method: "DELETE",
  });
}
