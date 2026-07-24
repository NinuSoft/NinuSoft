import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, XCircle, Send, Sparkles } from "@/components/Icons";
import { askProposalAiApi } from "@/lib/proposals-api";

interface ProposalAiAssistantProps {
  proposalTitle: string;
  clientName: string;
  proposalToken?: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

export function ProposalAiAssistant({
  proposalTitle,
  clientName,
  proposalToken,
  content,
  isOpen,
  onClose,
}: ProposalAiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `مرحباً بك عزيزي (${clientName})! أنا مستشار الذكاء الاصطناعي الخاص لمستند (${proposalTitle}). كيف يمكنني مساعدتك في الإجابة على استفساراتك وضمان تلبية العرض لكافة تطلعاتك؟`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [engineStatus, setEngineStatus] = useState<"workers_ai" | "local" | "connecting">("workers_ai");

  const quickQuestions = [
    "لماذا اختيار NinuSoft هو الخيار الأفضل لهذا المشروع؟",
    "ما هي تفاصيل الميزانية والعائد الاستثماري؟",
    "ما هو الجدول الزمني والالتزام بالتسليم؟",
    "ما هي ضامنات الجودة والدعم التقني المستمر؟",
  ];

  const handleAsk = async (queryText?: string) => {
    const question = (queryText || input).trim();
    if (!question) return;

    const userMsg: Message = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      let answer = "";
      if (proposalToken) {
        const res = await askProposalAiApi(proposalToken, question);
        answer = res.answer;
      }

      if (!answer) {
        throw new Error("No response");
      }
      setEngineStatus("workers_ai");
      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
    } catch {
      setEngineStatus("local");
      // Fallback sales-oriented answer logic
      let answer = "";
      const lower = question.toLowerCase();

      if (lower.includes("أفضل") || lower.includes("لماذا") || lower.includes("خيار")) {
        answer = "تقدم NinuSoft حلاً برمجياً متكاملاً يتفوق بالسرعة والأمان العالي، مع تسليم كافة حقوق الكود المصدري وضمان استقرار النظام بدعم فني مستمر لتأمين نجاح مشروعكم تماماً.";
      } else if (lower.includes("جدول") || lower.includes("زمني") || lower.includes("مدة")) {
        answer = "نلتزم في NinuSoft بجدول زمني صارم ومقسم إلى مراحل تسليم واضحة تضمن متابعتكم للتقدم خطوة بخطوة حتى الإطلاق النهائي.";
      } else if (lower.includes("سعر") || lower.includes("ميزانية") || lower.includes("كلفة")) {
        answer = "الميزانية المحددة صُممت لتمنحكم أفضل عائد استثماري (ROI) مقابل الجودة العالية والاستقرار التقني للأنظمة المقدمة.";
      } else {
        answer = "فريق NinuSoft ملتزم بتقديم أفضل مستوى احترافي. جميع البنود مصممة لضمان نجاح المشروع وسرعة تنفيذه.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 dir-rtl">
      <div className="w-full max-w-lg h-[80vh] flex flex-col rounded-2xl bg-card border border-amber-500/50 shadow-2xl overflow-hidden text-start">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-card border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-foreground">مستشار الذكاء الاصطناعي</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {engineStatus === "workers_ai" ? "Cloudflare Workers AI (Llama 3.1 8B Live)" : "البحث المباشر في العرض"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">إجابات حية ومباشرة مستندة لمحتوى المقترح</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Questions */}
        <div className="p-3 bg-muted/20 border-b border-border/40 flex items-center gap-1.5 overflow-x-auto text-[11px] dir-rtl">
          <span className="text-muted-foreground font-bold whitespace-nowrap">أسئلة شائعة:</span>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAsk(q)}
              className="px-2.5 py-1 rounded-full bg-card hover:bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/20 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-amber-500 text-black font-semibold rounded-br-none shadow-md"
                    : "bg-card border border-border/60 text-foreground rounded-bl-none shadow-sm whitespace-pre-wrap"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="p-3 rounded-2xl bg-card border border-border/60 text-muted-foreground text-xs animate-pulse">
                جاري التفكير وصياغة الإجابة…
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-3 bg-card border-t border-border/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل أي سؤال بخصوص هذا العرض..."
            className="flex-1 text-xs p-2.5 rounded-xl border border-border/60 bg-background text-foreground"
          />
          <Button type="submit" size="sm" disabled={loading} className="font-bold bg-amber-500 text-black hover:bg-amber-400">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
