import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, XCircle, Send, CheckCircle2 } from "@/components/Icons";

interface ProposalAiAssistantProps {
  proposalTitle: string;
  clientName: string;
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
  content,
  isOpen,
  onClose,
}: ProposalAiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `مرحباً بك عزيزي/عزيزتي (${clientName})! أنا المساعد الآلي لمستند (${proposalTitle}). يمكنني الإجابة على استفساراتك حول الميزانية، الجدول الزمني، نطاق العمل، والشروط الفنية.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    "ما هو الجدول الزمني للمشروع؟",
    "ما هي تفاصيل الميزانية والدفعات؟",
    "ما هي شروط الضمان والدعم الفني؟",
    "ما هي المخرجات الرئيسية المستلمة؟",
  ];

  const handleAsk = (queryText?: string) => {
    const question = (queryText || input).trim();
    if (!question) return;

    const userMsg: Message = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    setTimeout(() => {
      let answer = "";
      const lower = question.toLowerCase();
      const lowerContent = content.toLowerCase();

      if (lower.includes("جدول") || lower.includes("زمني") || lower.includes("مدة") || lower.includes("وقت")) {
        answer = "يتضمن المقترح سقفاً زمنياً منظماً ومقسماً على مراحل تطوير واختبار وتسليم. يمكنك مراجعة قسم (الجدول الزمني) في الوثيقة للاطلاع على المواعيد الدقيقة.";
      } else if (lower.includes("سعر") || lower.includes("ميزانية") || lower.includes("كلفة") || lower.includes("دفع") || lower.includes("مبلغ")) {
        answer = "تفاصيل الميزانية والدفعات المالية موضحة في جدول الأسعار والتكاليف. جميع المبالغ تشمل التطوير، الضمان، والدعم الفني المحدد في العرض.";
      } else if (lower.includes("ضمان") || lower.includes("دعم") || lower.includes("صيانة")) {
        answer = "يتضمن العرض ضماناً فنياً ودعماً تقنياً مباشراً من فريق NinuSoft لمعالجة أي ملاحظات وضمان استقرار النظام بعد الإطلاق.";
      } else if (lower.includes("مخرجات") || lower.includes("تسليم") || lower.includes("نطاق")) {
        answer = "يشمل نطاق العمل تسليم كافة الكود المصدري (Source Code)، لوحات التحكم، التوثيق الفني، وتهيئة بيئة الاستضافة السحابية.";
      } else {
        // Keyword extraction match
        const matchingLines = content
          .split("\n")
          .filter((line) => line.trim().length > 10 && question.split(" ").some((w) => w.length > 3 && line.includes(w)))
          .slice(0, 2);

        if (matchingLines.length > 0) {
          answer = `وفقاً لبنود الوثيقة:\n${matchingLines.join("\n")}`;
        } else {
          answer = "جميع التفاصيل الفنية والمالية متوفرة في أقسام المقترح. يمكنك أيضاً ترك استفسار مباشر في قسم التعليقات ليقوم فريقنا بالرد عليك فوراً.";
        }
      }

      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
      setLoading(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 dir-rtl">
      <div className="w-full max-w-lg h-[80vh] flex flex-col rounded-2xl bg-card border border-amber-500/50 shadow-2xl overflow-hidden text-start">
        {/* Header */}
        <div className="p-4 bg-muted/60 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
              AI
            </span>
            <div>
              <h3 className="font-bold text-sm text-foreground">مساعد العرض الذكي</h3>
              <p className="text-[11px] text-muted-foreground">إجابات فورية مستندة لمحتوى المقترح</p>
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
