import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus } from "@/components/Icons";
import { submitProposalCommentApi } from "@/lib/proposals-api";

interface ProposalCommentsProps {
  proposalTitle: string;
  proposalToken?: string;
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

export function ProposalComments({ proposalTitle, proposalToken }: ProposalCommentsProps) {
  const storageKey = `ninusoft-comments:${proposalTitle}`;
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: Math.random().toString(36).substring(2, 9),
      author: authorName.trim() || "عميل NinuSoft",
      text: commentText.trim(),
      date: new Intl.DateTimeFormat("ar-IQ-u-nu-latn", { dateStyle: "short", timeStyle: "short" }).format(new Date()),
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (proposalToken) {
        await submitProposalCommentApi(proposalToken, newComment).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    }
    setCommentText("");
  };

  return (
    <section className="proposal-comments-section mt-10 p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xl text-start dir-rtl">
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
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="اسمك الكريم (اختياري)"
            className="w-full text-xs p-2.5 rounded-lg border border-border/60 bg-background text-foreground"
          />
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="اكتب استفسارك أو تعليقك حول هذا المقترح..."
            rows={3}
            className="text-xs"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" className="font-bold text-xs flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> إرسال التعليق
            </Button>
          </div>
        </form>
      )}

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl border border-border/40 bg-card/80 space-y-1 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <strong className="text-foreground text-xs font-bold">{c.author}</strong>
                <span className="font-mono text-[11px] opacity-75">{c.date}</span>
              </div>
              <p className="text-foreground/90 leading-relaxed pt-1">{c.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">لا توجد تعليقات حتى الآن. كن أول من يضيف استفساراً!</p>
      )}
    </section>
  );
}
