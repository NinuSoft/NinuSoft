import { useCallback, useEffect, useState } from "react";
import {
  getProposalSignaturesApi,
  submitProposalSignatureApi,
  type SignatureInput,
  type SignatureRecord,
} from "@/lib/proposals-api";
import { DOCUMENT_SECTION_ID } from "@/lib/proposal-sections";

/**
 * Owns every section's signature for one proposal.
 *
 * Fetched once and shared, so the three signature render sites cannot disagree,
 * and so signing one section leaves the others untouched — previously a single
 * document-wide record made every section appear signed at once.
 */
export function useProposalSignatures(
  token: string | undefined,
  sessionId?: string,
  accessToken?: string,
) {
  const [signatures, setSignatures] = useState<SignatureRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(token));

  const reload = useCallback(async () => {
    if (!token) {
      setSignatures([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getProposalSignaturesApi(token, sessionId, accessToken);
      setSignatures(res.signatures || []);
    } catch {
      // Leave the list empty: the POST is the authoritative gate and will
      // surface a 409 if a decision already exists.
      setSignatures([]);
    } finally {
      setLoading(false);
    }
  }, [token, sessionId, accessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getForSection = useCallback(
    (sectionId: string | undefined) => {
      const target = sectionId || DOCUMENT_SECTION_ID;
      return signatures.find((s) => s.section_id === target) ?? null;
    },
    [signatures],
  );

  /** Throws on failure so the caller can keep the form open and report it. */
  const submit = useCallback(
    async (sectionId: string | undefined, input: SignatureInput) => {
      if (!token) throw new Error("رابط العرض غير صالح.");
      const res = await submitProposalSignatureApi(
        token,
        { ...input, sectionId: sectionId || DOCUMENT_SECTION_ID },
        sessionId,
        accessToken,
      );
      setSignatures((prev) => [
        ...prev.filter((s) => s.section_id !== res.record.section_id),
        res.record,
      ]);
      return res.record;
    },
    [token, sessionId, accessToken],
  );

  return { signatures, loading, getForSection, submit, reload };
}
