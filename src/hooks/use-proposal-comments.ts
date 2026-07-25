import { useCallback, useEffect, useState } from "react";
import {
  deleteProposalCommentApi,
  editProposalCommentApi,
  getProposalCommentsApi,
  submitProposalCommentApi,
  type ProposalComment,
} from "@/lib/proposals-api";

type SubmitInput = {
  text: string;
  author?: string;
  selectedText?: string;
};

/**
 * Single owner of a proposal's comment list.
 *
 * Both the comment box and the text-selection popover write through here. They
 * used to keep separate copies in localStorage, which meant a highlight comment
 * never appeared in the list until reload, and a subsequent plain comment
 * overwrote it from stale state. The backend is authoritative: every mutation
 * replaces local state with the list the server returns.
 */
export function useProposalComments(
  token: string | undefined,
  sessionId?: string,
  accessToken?: string,
) {
  const [comments, setComments] = useState<ProposalComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getProposalCommentsApi(token, sessionId, accessToken);
      setComments(res.comments || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "تعذر تحميل التعليقات.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, sessionId, accessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Throws on failure so callers can keep the user's text and show an error. */
  const submit = useCallback(
    async (input: SubmitInput) => {
      if (!token) throw new Error("لا يمكن إرسال التعليق بدون رابط عرض صالح.");
      const res = await submitProposalCommentApi(
        token,
        input,
        sessionId,
        accessToken,
      );
      setComments(res.comments || []);
    },
    [token, sessionId, accessToken],
  );

  const edit = useCallback(
    async (commentId: string, text: string, selectedText?: string) => {
      if (!token) throw new Error("لا يمكن تعديل التعليق بدون رابط عرض صالح.");
      const res = await editProposalCommentApi(
        token,
        commentId,
        { text, selectedText },
        sessionId,
        accessToken,
      );
      setComments(res.comments || []);
    },
    [token, sessionId, accessToken],
  );

  const remove = useCallback(
    async (commentId: string) => {
      if (!token) throw new Error("لا يمكن حذف التعليق بدون رابط عرض صالح.");
      const res = await deleteProposalCommentApi(
        token,
        commentId,
        sessionId,
        accessToken,
      );
      setComments(res.comments || []);
    },
    [token, sessionId, accessToken],
  );

  const toggleResolve = useCallback(
    async (commentId: string, resolved: boolean) => {
      if (!token) throw new Error("لا يمكن تحديث حالة التعليق بدون رابط عرض صالح.");
      const res = await editProposalCommentApi(
        token,
        commentId,
        { resolved },
        sessionId,
        accessToken,
      );
      setComments(res.comments || []);
    },
    [token, sessionId, accessToken],
  );

  return { comments, loading, error, submit, edit, remove, toggleResolve, reload };
}
