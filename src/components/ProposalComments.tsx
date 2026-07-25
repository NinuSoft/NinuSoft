import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";
import { formatProposalDate } from "@/lib/format-date";
import type { ProposalComment } from "@/lib/proposals-api";

interface ProposalCommentsProps {
  comments: ProposalComment[];
  loading?: boolean;
  error?: string | null;
  onSubmit: (input: { text: string; author?: string }) => Promise<void>;
  onRetry?: () => void;
  clientName?: string;
}

export function ProposalComments({
  comments,
  loading,
  error,
  onSubmit,
  onRetry,
  clientName,
}: ProposalCommentsProps) {
  const [commentText, setCommentText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({ text, author: clientName || "العميل" });
      // Only clear once the server has the comment — otherwise a failed send
      // would silently discard what the client typed.
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
                <span className="font-mono text-[11px] opacity-75">
                  {formatProposalDate(c.createdAt)}
                </span>
              </div>
              {c.selectedText && (
                <div className="p-2 rounded-lg bg-amber-500/10 border-r-2 border-amber-500 text-amber-300 font-mono text-[11px] italic">
                  &ldquo;{c.selectedText}&rdquo;
                </div>
              )}
              <p className="text-foreground/90 leading-relaxed pt-1">{c.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">لا توجد تعليقات حتى الآن. حدّد أي نص في العرض لإضافة تعليق أو سؤال عليـه!</p>
      )}
    </section>
  );
}
