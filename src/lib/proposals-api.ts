export const PROPOSALS_API_URL = (
  import.meta.env.VITE_PROPOSALS_API_URL ||
  "https://ninusoft-proposals.ninusoft.workers.dev"
).replace(/\/$/, "");

export type Proposal = {
  id: string;
  token: string;
  title: string;
  clientName: string;
  markdown: string;
  expiresAt: string | null;
  updatedAt: string;
};

export type ProposalSummary = Omit<Proposal, "markdown"> & {
  protected: boolean;
  active: boolean;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  lastReadAt: string | null;
  openCount: number;
  readCount: number;
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
  const response = await fetch(`${PROPOSALS_API_URL}${path}`, {
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
      payload.error || "تعذر الاتصال بخدمة العروض.",
      response.status,
      payload.code,
    );
  }
  return payload as T;
}

export function getProposal(
  token: string,
  sessionId: string,
  accessToken?: string,
) {
  return apiRequest<
    | { locked: true }
    | { locked: false; proposal: Proposal }
  >(`/v1/proposals/${encodeURIComponent(token)}`, {
    headers: {
      "X-Proposal-Session": sessionId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

export function unlockProposal(token: string, password: string) {
  return apiRequest<{ accessToken: string }>(
    `/v1/proposals/${encodeURIComponent(token)}/access`,
    {
      method: "POST",
      body: JSON.stringify({ password }),
    },
  );
}

export function recordProposalEvent(
  token: string,
  type: "read" | "print" | "pdf" | "SECTION_FEEDBACK",
  sessionId?: string | Record<string, any>,
  accessToken?: string,
) {
  return apiRequest<{ ok: true }>(
    `/v1/proposals/${encodeURIComponent(token)}/events`,
    {
      method: "POST",
      keepalive: true,
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      body: JSON.stringify({ type, details: typeof sessionId === "object" ? sessionId : { sessionId } }),
    },
  );
}

export function adminRequest<T>(
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

export function submitProposalSignatureApi(token: string, record: unknown) {
  return apiRequest<{ ok: true; record: unknown }>(
    `/v1/proposals/${encodeURIComponent(token)}/signature`,
    {
      method: "POST",
      body: JSON.stringify(record),
    },
  );
}

export function getProposalSignatureApi(token: string) {
  return apiRequest<{ signature: unknown | null }>(
    `/v1/proposals/${encodeURIComponent(token)}/signature`,
  );
}

export function submitProposalCommentApi(token: string, comment: unknown) {
  return apiRequest<{ ok: true; comments: unknown[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/comments`,
    {
      method: "POST",
      body: JSON.stringify(comment),
    },
  );
}

export function getProposalCommentsApi(token: string) {
  return apiRequest<{ comments: unknown[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/comments`,
  );
}

export function saveProposalSettingsBackendApi(adminKey: string, settings: unknown) {
  return adminRequest<{ ok: true }>(adminKey, "/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export function getProposalSettingsBackendApi(adminKey: string) {
  return adminRequest<{ settings: unknown }>(adminKey, "/settings");
}

