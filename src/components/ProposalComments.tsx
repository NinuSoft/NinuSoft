import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Edit, MessageSquare, Plus, Shield, Trash2 } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";
import { formatProposalDate } from "@/lib/format-date";
import { jumpToQuotedText } from "@/lib/quote-navigator";
import type { ProposalComment } from "@/lib/proposals-api";

export const COMMENT_CATEGORIES = {
  general: { label: "عام", color: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  pricing: { label: "التسعير والمدفوعات", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  technical: { label: "المواصفات الفنية", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  timeline: { label: "الجدول الزمني", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
} as const;

type CategoryKey = keyof typeof COMMENT_CATEGORIES;

interface ProposalCommentsProps {
  comments: ProposalComment[];
  loading?: boolean;
  error?: string | null;
  onSubmit: (input: { text: string; author?: string; category?: CategoryKey }) => Promise<void>;
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("general");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  const { toast } = useToast();

  const openCount = useMemo(() => comments.filter((c) => !c.resolved).length, [comments]);
  const resolvedCount = useMemo(() => comments.filter((c) => c.resolved).length, [comments]);

  const filteredComments = useMemo(() => {
    if (filter === "open") return comments.filter((c) => !c.resolved);
    if (filter === "resolved") return comments.filter((c) => c.resolved);
    return comments;
  }, [comments, filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({ text, author: clientName || "العميل", category: selectedCategory });
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
    <section
      id="proposal-comments"
      className="proposal-comments-section mt-10 p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xl text-start dir-rtl"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">
              الاستفسارات والتعليقات المباشرة
            </h3>
            <p className="text-xs text-muted-foreground">
              تواصل مباشرة مع فريق NinuSoft حول تفاصيل هذا المقترح
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          {isOpen ? (
            "إخفاء نموذج الإضافة"
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> إضافة تعليق أو سؤال
            </>
          )}
        </Button>
      </div>

      {/* Filter Pills */}
      {comments.length > 0 && (
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/40 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            الكل ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("open")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filter === "open"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            قيد المراجعة ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filter === "resolved"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            تم الحل ({resolvedCount})
          </button>
        </div>
      )}

      {/* Comment Creation Form */}
      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50 shadow-inner"
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">اختر التصنيف الموضوعي:</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {(Object.keys(COMMENT_CATEGORIES) as CategoryKey[]).map((key) => {
                const cat = COMMENT_CATEGORIES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                      selectedCategory === key
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background/60 text-muted-foreground hover:text-foreground border-border/40"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="اكتب استفسارك أو تعليقك حول هذا المقترح..."
            rows={3}
            className="text-xs bg-background/80"
            required
            autoFocus
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {submitting ? "جارٍ الإرسال..." : "إرسال الاستفسار"}
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {error ? (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-xs space-y-2">
          <p className="text-destructive font-bold">تعذر تحميل التعليقات.</p>
          <p className="text-muted-foreground">{error}</p>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry} className="text-xs">
              إعادة المحاولة
            </Button>
          )}
        </div>
      ) : loading && comments.length === 0 ? (
        <p className="text-xs text-muted-foreground italic p-4 text-center">جارٍ تحميل التعليقات...</p>
      ) : filteredComments.length > 0 ? (
        <div className="space-y-3.5">
          {filteredComments.map((c) => {
            const catInfo = COMMENT_CATEGORIES[c.category || "general"] || COMMENT_CATEGORIES.general;
            return (
            <div
              key={c.id}
              className={`p-4 rounded-xl border text-xs transition-all duration-200 space-y-2.5 ${
                c.resolved
                  ? "border-l-4 border-l-emerald-500 border-emerald-500/20 bg-emerald-950/10"
                  : "border-l-4 border-l-amber-500 border-border/60 bg-card/80 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3 text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-xs">{c.author}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  {c.resolved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" /> تم الحل
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      قيد المراجعة
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] opacity-75">
                    {formatProposalDate(c.createdAt)}
                  </span>
                  {onEdit && editingId !== c.id && !c.resolved && !c.replyText && (
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="p-1 hover:text-foreground transition-colors"
                      title="تعديل التعليق"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && editingId !== c.id && !c.resolved && !c.replyText && (
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

              {/* Selected Text Highlight Quote */}
              {c.selectedText && (
                <button
                  type="button"
                  onClick={() => jumpToQuotedText(c.selectedText!)}
                  className="w-full text-right p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border-r-4 border-amber-500 text-amber-200 font-mono text-[11px] italic leading-relaxed transition-all cursor-pointer group flex items-start justify-between gap-2 shadow-sm active:scale-[0.99]"
                  title="اضغط للانتقال التلقائي لمكان النص المُقتبس وتظليله المؤقت"
                >
                  <span className="flex-1">&ldquo;{c.selectedText}&rdquo;</span>
                  <span className="text-[10px] font-sans not-italic text-amber-400/80 group-hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                    انتقال للنص ↖
                  </span>
                </button>
              )}

              {/* Comment Content / Edit Mode */}
              {editingId === c.id ? (
                <div className="space-y-2 pt-1">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="text-xs bg-background"
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
                <>
                  <p className="text-foreground/90 leading-relaxed">{c.text}</p>
                  {c.replyText && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/10 border-r-4 border-primary text-xs space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between gap-2 text-primary font-bold text-[11px]">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          {c.replyAuthor || "فريق NinuSoft"}
                        </span>
                        {c.repliedAt && (
                          <span className="font-mono text-[10px] opacity-75">
                            {formatProposalDate(c.repliedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground/95 leading-relaxed font-normal">
                        {c.replyText}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-muted/20 border border-dashed border-border/50 text-xs text-muted-foreground">
          <p>
            {filter === "all"
              ? "لا توجد تعليقات حتى الآن. حدّد أي نص في العرض لإضافة تعليق أو سؤال عليه!"
              : filter === "open"
              ? "لا توجد استفسارات قيد المراجعة."
              : "لا توجد استفسارات تم حلها."}
          </p>
        </div>
      )}
    </section>
  );
}
