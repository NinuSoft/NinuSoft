import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, MessageSquare, Plus, Trash2 } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";
import { formatProposalDate } from "@/lib/format-date";
import type { ProposalComment } from "@/lib/proposals-api";

interface ProposalCommentsProps {
  comments: ProposalComment[];
  loading?: boolean;
  error?: string | null;
  onSubmit: (input: { text: string; author?: string }) => Promise<void>;
  onEdit?: (commentId: string, text: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onRetry?: () => void;
  clientName?: string;
}

export function ProposalComments({
  comments,
  loading,
  error,
  onSubmit,
  onEdit,
  onDelete,
  onRetry,
  clientName,
}: ProposalCommentsProps) {
  const [commentText, setCommentText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({ text, author: clientName || "العميل" });
      setCommentText("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "تعذر إرسال التعليق",
        description:
          err instanceof Error ? err.message : "حدث خطأ غير متوقع. حاول مجدداً.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c: ProposalComment) => {
    setEditingId(c.id);
    setEditText(c.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId: string) => {
    const trimmed = editText.trim();
    if (!trimmed || !onEdit) return;

    setActionLoading(commentId);
    try {
      await onEdit(commentId, trimmed);
      toast({ title: "تم تعديل التعليق بنجاح" });
      cancelEdit();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "تعذر تعديل التعليق",
        description:
          err instanceof Error ? err.message : "حدث خطأ غير متوقع.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!onDelete) return;
    if (!window.confirm("هل أنت تأكد من رغبتك في حذف هذا التعليق؟")) return;

    setActionLoading(commentId);
    try {
      await onDelete(commentId);
      toast({ title: "تم حذف التعليق بنجاح" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "تعذر حذف التعليق",
        description:
          err instanceof Error ? err.message : "حدث خطأ غير متوقع.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section id="proposal-comments" className="proposal-comments-section mt-10 p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xl text-start dir-rtl">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <MessageSquare className="w-5 h-5" />
          <span>الاستفسارات والتعليقات المباشرة ({comments.length})</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold flex items-center gap-1.5"
        >
          {isOpen ? (
            "إخفاء صندوق التعليقات"
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> إضافة تعليق أو سؤال
            </>
          )}
        </Button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 p-4 rounded-xl bg-muted/40 border border-border/40">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="اكتب استفسارك أو تعليقك حول هذا المقترح..."
            rows={3}
            className="text-xs"
            required
            autoFocus
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="font-bold text-xs flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {submitting ? "جارٍ الإرسال..." : "إرسال التعليق"}
            </Button>
          </div>
        </form>
      )}

      {error ? (
        <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-xs space-y-2">
          <p className="text-destructive font-bold">تعذر تحميل التعليقات.</p>
          <p className="text-muted-foreground">{error}</p>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry} className="text-xs">
              إعادة المحاولة
            </Button>
          )}
        </div>
      ) : loading && comments.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">جارٍ تحميل التعليقات...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl border border-border/40 bg-card/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <strong className="text-foreground text-xs font-bold">{c.author}</strong>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] opacity-75">
                    {formatProposalDate(c.createdAt)}
                  </span>
                  {onEdit && editingId !== c.id && (
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="p-1 hover:text-foreground transition-colors"
                      title="تعديل التعليق"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && editingId !== c.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={actionLoading === c.id}
                      className="p-1 hover:text-destructive text-muted-foreground transition-colors"
                      title="حذف التعليق"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {c.selectedText && (
                <div className="p-2 rounded-lg bg-amber-500/10 border-r-2 border-amber-500 text-amber-300 font-mono text-[11px] italic">
                  &ldquo;{c.selectedText}&rdquo;
                </div>
              )}

              {editingId === c.id ? (
                <div className="space-y-2 pt-1">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="text-xs h-7"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={actionLoading === c.id || !editText.trim()}
                      className="text-xs h-7"
                    >
                      {actionLoading === c.id ? "جارٍ الحفظ..." : "حفظ التعديل"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground/90 leading-relaxed pt-1">{c.text}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">لا توجد تعليقات حتى الآن. حدّد أي نص في العرض لإضافة تعليق أو سؤال عليـه!</p>
      )}
    </section>
  );
}
