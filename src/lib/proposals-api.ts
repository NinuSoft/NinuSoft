import type { ProposalSettings } from "./proposal-settings";

export const PROPOSALS_API_URL = (
  import.meta.env.VITE_PROPOSALS_API_URL ||
  "https://proposals.ninusoft.workers.dev"
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
  signatureStatus: "SIGNED" | "REJECTED" | null;
  signedSections: number;
  rejectedSections: number;
  signedAt: string | null;
  signerName: string | null;
  commentCount: number;
  unresolvedCommentCount: number;
  lastCommentAt: string | null;
};

/** A comment as stored by the backend. `id` and `createdAt` are server-assigned. */
export type ProposalComment = {
  id: string;
  author: string;
  text: string;
  selectedText: string | null;
  category?: "general" | "pricing" | "technical" | "timeline";
  resolved?: boolean;
  replyText?: string | null;
  replyAuthor?: string | null;
  repliedAt?: string | null;
  internalNote?: string | null;
  createdAt: string;
};

export type ProposalDiscount = {
  id: string;
  proposalId: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  active: boolean;
  createdAt: string;
};

/**
 * A signature as stored by the backend. `documentHash` and `verificationId` are
 * computed server-side over the stored markdown — never trust client-supplied
 * values for these.
 */
export type SignatureRecord = {
  section_id: string;
  section_title: string | null;
  status: "SIGNED" | "REJECTED";
  name: string;
  title: string;
  signature_date: string;
  signature_image?: string | null;
  signatureImage?: string | null;
  rejection_reason?: string | null;
  rejectionReason?: string | null;
  verification_id?: string;
  verificationId?: string;
  document_hash?: string;
  documentHash?: string;
  created_at?: string;
};

/** What the client sends when signing or rejecting. */
export type SignatureInput = {
  sectionId?: string;
  status: "SIGNED" | "REJECTED";
  name: string;
  title: string;
  signatureImage?: string | null;
  rejectionReason?: string | null;
};

/** A previously-recorded decision that an admin has since revoked. */
export type RevokedSignature = {
  section_id: string;
  section_title: string | null;
  status: "SIGNED" | "REJECTED";
  name: string;
  title: string;
  signature_date: string;
  rejection_reason: string | null;
  verification_id: string;
  document_hash: string;
  revoked_at: string;
  revoked_reason: string | null;
};

export type ProposalActivity = {
  signatures: SignatureRecord[];
  signatureHistory: RevokedSignature[];
  comments: ProposalComment[];
  events: { type: string; sessionId: string; createdAt: string }[];
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

/**
 * Auth headers for every client-facing proposal request.
 *
 * Password-protected proposals reject calls without the unlock token, so a
 * request that omits this silently fails for exactly the proposals that matter
 * most. Build headers here rather than at each call site — hand-rolling them
 * per-function is how the comment and signature writes ended up unauthenticated.
 */
function proposalAuthHeaders(
  sessionId?: string,
  accessToken?: string,
): Record<string, string> {
  return {
    ...(sessionId ? { "X-Proposal-Session": sessionId } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export function getProposal(
  token: string,
  sessionId: string,
  accessToken?: string,
) {
  return apiRequest<
    | { locked: true }
    | {
        locked: false;
        proposal: Proposal;
        settings?: Partial<ProposalSettings> | null;
      }
  >(`/v1/proposals/${encodeURIComponent(token)}`, {
    headers: proposalAuthHeaders(sessionId, accessToken),
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

export function askProposalAiApi(token: string, question: string, accessToken?: string) {
  return apiRequest<{ answer: string; modelUsed?: string }>(
    `/v1/proposals/${encodeURIComponent(token)}/ai-query`,
    {
      method: "POST",
      headers: proposalAuthHeaders(undefined, accessToken),
      body: JSON.stringify({ question }),
    },
  );
}

export function recordProposalEvent(
  token: string,
  type: "read" | "print" | "pdf",
  sessionId: string,
  accessToken?: string,
) {
  return apiRequest<{ ok: true }>(
    `/v1/proposals/${encodeURIComponent(token)}/events`,
    {
      method: "POST",
      keepalive: true,
      headers: proposalAuthHeaders(undefined, accessToken),
      // sessionId is top-level: the worker validates it there and 400s on a
      // nested `details` payload, which silently dropped every read/print/pdf
      // event until now.
      body: JSON.stringify({ type, sessionId }),
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

export function submitProposalSignatureApi(
  token: string,
  record: SignatureInput,
  sessionId?: string,
  accessToken?: string,
) {
  return apiRequest<{ ok: true; record: SignatureRecord }>(
    `/v1/proposals/${encodeURIComponent(token)}/signature`,
    {
      method: "POST",
      headers: proposalAuthHeaders(sessionId, accessToken),
      body: JSON.stringify(record),
    },
  );
}

export function getProposalSignaturesApi(
  token: string,
  sessionId?: string,
  accessToken?: string,
) {
  return apiRequest<{ signatures: SignatureRecord[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/signature`,
    { headers: proposalAuthHeaders(sessionId, accessToken) },
  );
}

export function submitProposalCommentApi(
  token: string,
  comment: { text: string; author?: string; selectedText?: string; category?: string },
  sessionId?: string,
  accessToken?: string,
) {
  return apiRequest<{ ok: true; comments: ProposalComment[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/comments`,
    {
      method: "POST",
      headers: proposalAuthHeaders(sessionId, accessToken),
      body: JSON.stringify(comment),
    },
  );
}

export function getProposalCommentsApi(
  token: string,
  sessionId?: string,
  accessToken?: string,
) {
  return apiRequest<{ comments: ProposalComment[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/comments`,
    { headers: proposalAuthHeaders(sessionId, accessToken) },
  );
}

export function saveProposalSettingsBackendApi(
  adminKey: string,
  settings: ProposalSettings,
) {
  return adminRequest<{ ok: true }>(adminKey, "/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export function getProposalSettingsBackendApi(adminKey: string) {
  return adminRequest<{ settings: Partial<ProposalSettings> | null }>(
    adminKey,
    "/settings",
  );
}

export function getProposalActivityApi(adminKey: string, id: string) {
  return adminRequest<ProposalActivity>(
    adminKey,
    `/proposals/${encodeURIComponent(id)}/activity`,
  );
}

/**
 * Clears the client's decision so they can sign again. The old record is
 * archived server-side rather than deleted — revoking must not erase the fact
 * that a client once approved.
 */
/** Omitting sectionId revokes every section's decision. */
export function revokeProposalSignatureApi(
  adminKey: string,
  id: string,
  options: { reason?: string; sectionId?: string } = {},
) {
  return adminRequest<{ ok: true; revokedAt: string; revokedCount: number }>(
    adminKey,
    `/proposals/${encodeURIComponent(id)}/signature`,
    {
      method: "DELETE",
      body: JSON.stringify({
        reason: options.reason || null,
        sectionId: options.sectionId || null,
      }),
    },
  );
}

export function editProposalCommentApi(
  token: string,
  commentId: string,
  data: { text?: string; selectedText?: string; resolved?: boolean },
  sessionId?: string,
  accessToken?: string,
) {
  return apiRequest<{ ok: true; comments: ProposalComment[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PUT",
      headers: proposalAuthHeaders(sessionId, accessToken),
      body: JSON.stringify(data),
    },
  );
}

export function deleteProposalCommentApi(
  token: string,
  commentId: string,
  sessionId?: string,
  accessToken?: string,
) {
  return apiRequest<{ ok: true; comments: ProposalComment[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "DELETE",
      headers: proposalAuthHeaders(sessionId, accessToken),
    },
  );
}

export function adminEditProposalCommentApi(
  adminKey: string,
  proposalId: string,
  commentId: string,
  data: { text?: string; author?: string; resolved?: boolean; replyText?: string | null; replyAuthor?: string; internalNote?: string | null },
) {
  return adminRequest<{ ok: true; comments: ProposalComment[] }>(
    adminKey,
    `/proposals/${encodeURIComponent(proposalId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function adminDeleteProposalCommentApi(
  adminKey: string,
  proposalId: string,
  commentId: string,
) {
  return adminRequest<{ ok: true; comments: ProposalComment[] }>(
    adminKey,
    `/proposals/${encodeURIComponent(proposalId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "DELETE",
    },
  );
}

export function adminGenerateAiReplyApi(
  adminKey: string,
  proposalId: string,
  commentId: string,
) {
  return adminRequest<{ ok: true; suggestedReply: string }>(
    adminKey,
    `/proposals/${encodeURIComponent(proposalId)}/comments/${encodeURIComponent(commentId)}/ai-reply`,
    {
      method: "POST",
    },
  );
}

export function getProposalDiscountsApi(
  token: string,
  sessionId?: string,
  accessToken?: string,
) {
  return apiRequest<{ discounts: ProposalDiscount[] }>(
    `/v1/proposals/${encodeURIComponent(token)}/discounts`,
    { headers: proposalAuthHeaders(sessionId, accessToken) },
  );
}

export function listAdminDiscountsApi(
  adminKey: string,
  proposalId: string,
) {
  return adminRequest<{ discounts: ProposalDiscount[] }>(
    adminKey,
    `/proposals/${encodeURIComponent(proposalId)}/discounts`,
  );
}

export function createAdminDiscountApi(
  adminKey: string,
  proposalId: string,
  data: { code: string; discountType: "percentage" | "fixed"; discountValue: number },
) {
  return adminRequest<{ ok: true; discounts: ProposalDiscount[] }>(
    adminKey,
    `/proposals/${encodeURIComponent(proposalId)}/discounts`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function deleteAdminDiscountApi(
  adminKey: string,
  proposalId: string,
  discountId: string,
) {
  return adminRequest<{ ok: true; discounts: ProposalDiscount[] }>(
    adminKey,
    `/proposals/${encodeURIComponent(proposalId)}/discounts/${encodeURIComponent(discountId)}`,
    {
      method: "DELETE",
    },
  );
}


