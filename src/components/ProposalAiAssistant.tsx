import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { XCircle, Send, Sparkles, CheckCircle, RefreshCw, Rocket, TrendingUp, Target, Shield } from "@/components/Icons";
import { askProposalAiApi } from "@/lib/proposals-api";

interface ProposalAiAssistantProps {
  proposalTitle: string;
  clientName: string;
  proposalToken?: string;
  accessToken?: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  modelUsed?: string;
}

export function ProposalAiAssistant({
  proposalTitle,
  clientName,
  proposalToken,
  accessToken,
  isOpen,
  onClose,
}: ProposalAiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `مرحباً بك عزيزي **${clientName}**! 👋\n\nأنا **مستشار الذكاء الاصطناعي الخبير** لمستند **(${proposalTitle})**.\n\nيسعدني الإجابة على أي استفسارات حول **الجدول الزمني، الميزانية، أو الضمانات الفنية**. كيف يمكنني مساعدتك اليوم؟`,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<string>("Cloudflare Workers AI Live");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const structuredQuestions = [
    {
      icon: Rocket,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      text: "لماذا اختيار NinuSoft هو الخيار الأفضل لهذا المشروع؟",
      label: "رؤية ومزايا NinuSoft",
    },
    {
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      text: "ما هي تفاصيل الميزانية والعائد الاستثماري؟",
      label: "التكلفة والعائد المالي",
    },
    {
      icon: Target,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
      text: "ما هو الجدول الزمني والالتزام بالتسليم؟",
      label: "الجدول والمراحل الزمنية",
    },
    {
      icon: Shield,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      text: "ما هي ضمانات الجودة والدعم التقني المستمر؟",
      label: "الضمانات والدعم الفني",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAsk = async (queryText?: string) => {
    const question = (queryText || input).trim();
    if (!question || loading) return;

    const currentTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: question, time: currentTime };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      let answer = "";
      let modelUsed = "";

      if (proposalToken) {
        const res = await askProposalAiApi(proposalToken, question, accessToken);
        answer = res.answer;
        modelUsed = res.modelUsed || "Cloudflare Workers AI";
      }

      if (!answer) {
        throw new Error("No response");
      }

      setEngineStatus(modelUsed.includes("70b") ? "Llama 3.3 70B (Flagship AI)" : "Workers AI Live");
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: answer,
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          modelUsed,
        },
      ]);
    } catch {
      setEngineStatus("البحث المباشر في العرض");
      let fallbackAnswer = "";
      const lower = question.toLowerCase();

      if (lower.includes("أفضل") || lower.includes("لماذا") || lower.includes("خيار")) {
        fallbackAnswer = `تقدم **NinuSoft** حلاً برمجياً متكاملاً يتفوق بالسرعة والأمان العالي:\n- **حقوق الكود المصدري كاملة**\n- **ضمان استقرار الأنظمة** لمدة 30 يوماً\n- **دعم فني وتكاملي شامل** لتأمين نجاح المشروع.`;
      } else if (lower.includes("جدول") || lower.includes("زمني") || lower.includes("مدة")) {
        fallbackAnswer = `نلتزم في **NinuSoft** بجدول زمني صارم ومقسم إلى مراحل تسليم واضحة تضمن متابعتكم للتقدم خطوة بخطوة حتى الإطلاق النهائي.`;
      } else if (lower.includes("سعر") || lower.includes("ميزانية") || lower.includes("كلفة")) {
        fallbackAnswer = `الميزانية المحددة صُممت لتمنحكم **أفضل عائد استثماري (ROI)** مقابل الجودة العالية والاستقرار التقني للأنظمة المقدمة.`;
      } else {
        fallbackAnswer = `فريق **NinuSoft** ملتزم بتقديم أفضل مستوى احترافي. جميع البنود مصممة لضمان نجاح المشروع وسرعة تنفيذه.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: fallbackAnswer,
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 dir-rtl">
      <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl bg-card/95 border border-amber-500/40 shadow-2xl overflow-hidden text-start dir-rtl backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-card border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base text-foreground">مستشار الذكاء الاصطناعي</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {engineStatus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">استفسارات فورية ودعم ذكي مستند لوثيقة المقترح</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          >
            <XCircle className="w-5 h-5" />
          </Button>
        </div>

        {/* Top Quick Suggestion Pills */}
        <div className="p-2.5 bg-muted/20 border-b border-border/40 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-muted-foreground font-bold whitespace-nowrap text-[11px] shrink-0">أسئلة سريعة:</span>
          {structuredQuestions.map((q, i) => {
            const IconComponent = q.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleAsk(q.text)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full bg-card hover:bg-amber-500/10 text-foreground border border-amber-500/20 hover:border-amber-500/50 whitespace-nowrap transition-all text-xs font-medium flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95"
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-black/10 text-xs sm:text-sm dir-rtl">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-md ${
                  msg.sender === "user"
                    ? "bg-amber-500 text-black"
                    : "bg-muted border border-border/60 text-amber-400"
                }`}
              >
                {msg.sender === "user" ? "أنت" : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className="space-y-1 max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl shadow-lg leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-l from-amber-500 to-amber-600 text-black font-semibold rounded-tl-none"
                      : "bg-card/90 border border-border/80 text-foreground rounded-tr-none shadow-xl"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm prose-p:leading-relaxed prose-headings:text-amber-300 prose-strong:text-amber-300 prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Message Actions & Timestamp */}
                <div className={`flex items-center gap-2 px-1 text-[10px] text-muted-foreground font-mono ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <span>{msg.time}</span>
                  {msg.sender === "bot" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <span>نسخ الإجابة</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Welcome Screen Interactive Suggestion Grid Cards */}
          {messages.length === 1 && (
            <div className="mt-6 pt-4 border-t border-border/40 space-y-3">
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>اختر استفساراً شائعاً للبدء الفوري:</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {structuredQuestions.map((q, i) => {
                  const IconComponent = q.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAsk(q.text)}
                      disabled={loading}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-card/90 to-muted/40 border border-border/80 hover:border-amber-500/50 text-right transition-all group hover:shadow-lg hover:scale-[1.02] active:scale-95 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`p-2 rounded-xl border ${q.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium group-hover:text-amber-400 transition-colors">
                          اضغط للسؤال ↵
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-amber-300 transition-colors line-clamp-2">
                          {q.text}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{q.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thinking Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-muted border border-border/60 text-amber-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-card/90 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="font-semibold mr-1">جاري تحليل المقترح وصياغة الإجابة...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-3 sm:p-4 bg-card border-t border-border/60 flex items-center gap-2 dir-rtl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل مستشار الذكاء الاصطناعي حول العرض، الميزانية، أو الضمان..."
            disabled={loading}
            className="flex-1 text-xs sm:text-sm p-3 rounded-2xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-muted-foreground/60"
          />
          <Button
            type="submit"
            size="default"
            disabled={loading || !input.trim()}
            className="font-bold bg-amber-500 text-black hover:bg-amber-400 rounded-2xl px-5 py-3 shadow-lg shadow-amber-500/20"
          >
            <Send className="w-4 h-4 ml-1" />
            <span>إرسال</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
