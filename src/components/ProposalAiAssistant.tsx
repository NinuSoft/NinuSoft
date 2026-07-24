import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  FileText,
  RefreshCw,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "@/components/Icons";
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

const suggestedQuestions = [
  {
    icon: Rocket,
    eyebrow: "القيمة المقترحة",
    text: "لماذا اختيار NinuSoft هو الخيار الأفضل لهذا المشروع؟",
  },
  {
    icon: TrendingUp,
    eyebrow: "الاستثمار",
    text: "ما تفاصيل الميزانية والعائد الاستثماري المتوقع؟",
  },
  {
    icon: Target,
    eyebrow: "خطة التنفيذ",
    text: "ما الجدول الزمني ومراحل التسليم الرئيسية؟",
  },
  {
    icon: Shield,
    eyebrow: "ما بعد الإطلاق",
    text: "ما ضمانات الجودة والدعم الفني المستمر؟",
  },
];

function formatTimestamp() {
  return new Date().toLocaleTimeString("ar-EG-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createWelcomeMessage(clientName: string): Message {
  return {
    id: "welcome",
    sender: "bot",
    text: `مرحباً **${clientName}**، أنا مساعدك الذكي لهذا العرض. يمكنني تلخيص البنود، مقارنة الخيارات، وشرح التكلفة وخطة التنفيذ.`,
    time: formatTimestamp(),
  };
}

export function ProposalAiAssistant({
  proposalTitle,
  clientName,
  proposalToken,
  accessToken,
  isOpen,
  onClose,
}: ProposalAiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(() => [createWelcomeMessage(clientName)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState("متصل بالعرض");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const handleAsk = async (queryText?: string) => {
    const question = (queryText ?? input).trim();
    if (!question || loading) return;

    setMessages((previous) => [
      ...previous,
      { id: `u-${Date.now()}`, sender: "user", text: question, time: formatTimestamp() },
    ]);
    setInput("");
    setLoading(true);

    try {
      if (!proposalToken) throw new Error("No proposal token");
      const response = await askProposalAiApi(proposalToken, question, accessToken);
      if (!response.answer) throw new Error("No response");

      setEngineStatus(response.modelUsed?.includes("70b") ? "Llama 3.3 · مباشر" : "Workers AI · مباشر");
      setMessages((previous) => [
        ...previous,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: response.answer,
          time: formatTimestamp(),
          modelUsed: response.modelUsed,
        },
      ]);
    } catch {
      setEngineStatus("وضع العرض المحلي");
      const lower = question.toLowerCase();
      let answer = "فريق **NinuSoft** ملتزم بتقديم مستوى احترافي، وقد صُممت بنود العرض لضمان نجاح المشروع وسرعة تنفيذه.";

      if (lower.includes("أفضل") || lower.includes("لماذا") || lower.includes("خيار")) {
        answer = "تقدم **NinuSoft** حلاً متكاملاً يجمع السرعة والأمان:\n\n- حقوق الكود المصدري كاملة\n- ضمان استقرار الأنظمة لمدة 30 يوماً\n- دعم فني وتكاملي شامل";
      } else if (lower.includes("جدول") || lower.includes("زمني") || lower.includes("مدة") || lower.includes("مراحل")) {
        answer = "خطة التنفيذ مقسمة إلى **مراحل تسليم واضحة** تتيح متابعة التقدم خطوة بخطوة، وصولاً إلى الاختبار والإطلاق النهائي.";
      } else if (lower.includes("سعر") || lower.includes("ميزانية") || lower.includes("كلفة") || lower.includes("استثمار")) {
        answer = "الميزانية مصممة لتمنحكم **أفضل عائد استثماري** مقابل الجودة، ملكية المنتج، واستقرار الأنظمة على المدى الطويل.";
      }

      setMessages((previous) => [
        ...previous,
        { id: `b-${Date.now()}`, sender: "bot", text: answer, time: formatTimestamp() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([createWelcomeMessage(clientName)]);
    setInput("");
    setEngineStatus("متصل بالعرض");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#07090e]/85 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="مساعد العرض الذكي"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="relative flex h-[96dvh] w-full max-w-6xl overflow-hidden rounded-t-[28px] border border-white/10 bg-[#0c0f16] text-right text-white shadow-[0_35px_120px_rgba(0,0,0,.65)] sm:h-[88vh] sm:rounded-[32px]">
        <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-amber-400/10 blur-[100px]" />

        <aside className="relative hidden w-[300px] shrink-0 flex-col border-l border-white/8 bg-white/[0.025] p-5 lg:flex">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-[#111318] shadow-[0_0_28px_rgba(251,191,36,.16)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold">Ninu AI</p>
              <p className="mt-0.5 text-[11px] text-white/40">مستشارك داخل العرض</p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetConversation}
            className="mt-7 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-xs font-bold text-white/80 transition hover:border-amber-300/30 hover:bg-white/[0.07]"
          >
            <span>محادثة جديدة</span>
            <RefreshCw className="h-3.5 w-3.5 text-amber-300" />
          </button>

          <div className="mt-8">
            <p className="px-1 text-[10px] font-bold tracking-wide text-white/30">مصدر الإجابات</p>
            <div className="mt-3 rounded-2xl border border-white/8 bg-black/15 p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-400/10 text-amber-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{proposalTitle}</p>
                  <p className="mt-1 text-[10px] leading-5 text-white/35">يستخدم المساعد محتوى هذا العرض فقط لصياغة الإجابات.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {engineStatus}
            </div>
            <p className="mt-2 text-[10px] leading-5 text-white/30">قدّم أسئلة محددة لتحصل على إجابات أدق.</p>
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/8 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-[#111318] lg:hidden">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-extrabold sm:text-base">مساعد العرض الذكي</h2>
                  <span className="hidden rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-0.5 text-[9px] font-bold text-emerald-300 sm:inline">متصل</span>
                </div>
                <p className="mt-1 truncate text-[10px] text-white/35 sm:text-[11px]">{proposalTitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق المحادثة"
              className="grid h-9 w-9 place-items-center rounded-full text-white/45 transition hover:bg-white/8 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-3xl space-y-7">
              {messages.length === 1 && (
                <div className="pb-3 pt-1 sm:pt-5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1.5 text-[10px] font-bold text-amber-200">
                    <Sparkles className="h-3 w-3" />
                    مدرّب على تفاصيل العرض
                  </span>
                  <h1 className="mt-5 max-w-xl text-2xl font-black leading-[1.45] tracking-tight sm:text-3xl">
                    أهلاً {clientName}،<br />
                    <span className="text-white/45">ما الذي تود معرفته عن العرض؟</span>
                  </h1>
                  <p className="mt-3 max-w-xl text-xs leading-6 text-white/40 sm:text-sm">
                    اسأل عن الاستثمار، نطاق العمل، مراحل التنفيذ، أو اطلب تلخيص أي جزء.
                  </p>

                  <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
                    {suggestedQuestions.map((question) => {
                      const Icon = question.icon;
                      return (
                        <button
                          key={question.eyebrow}
                          type="button"
                          disabled={loading}
                          onClick={() => handleAsk(question.text)}
                          className="group flex min-h-[104px] flex-col items-start justify-between rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-right transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/25 hover:bg-amber-300/[0.035]"
                        >
                          <div className="flex w-full items-center justify-between">
                            <Icon className="h-4 w-4 text-amber-300" />
                            <ArrowLeft className="h-3.5 w-3.5 text-white/20 transition group-hover:-translate-x-1 group-hover:text-amber-300" />
                          </div>
                          <div className="mt-4">
                            <p className="text-[10px] font-bold text-amber-200/60">{question.eyebrow}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-white/70">{question.text}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.length > 1 && (
                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-white/8" />
                  <span className="text-[10px] font-medium text-white/25">اليوم</span>
                  <span className="h-px flex-1 bg-white/8" />
                </div>
              )}

              {messages.map((message, index) => {
                if (index === 0 && messages.length === 1) return null;
                return (
                  <article
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "justify-start" : "justify-end"}`}
                  >
                    {message.sender === "bot" && (
                      <div className="mt-1 hidden h-8 w-8 shrink-0 place-items-center rounded-lg border border-amber-300/15 bg-amber-300/[0.07] text-amber-300 sm:grid">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className={`max-w-[90%] sm:max-w-[82%] ${message.sender === "user" ? "items-start" : "items-end"} flex flex-col`}>
                      <div
                        className={
                          message.sender === "user"
                            ? "rounded-[20px] rounded-tr-md bg-amber-300 px-4 py-3 text-sm font-semibold leading-6 text-[#18140b]"
                            : "w-full rounded-[22px] rounded-tl-md border border-white/8 bg-white/[0.035] px-4 py-4 text-sm leading-7 text-white/80 sm:px-5"
                        }
                      >
                        {message.sender === "user" ? (
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-p:leading-7 prose-strong:text-amber-200 prose-ul:my-2 prose-li:my-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3 px-1 text-[10px] text-white/25">
                        <span>{message.time}</span>
                        {message.sender === "bot" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(message.id, message.text)}
                            className="flex items-center gap-1.5 transition hover:text-white/65"
                          >
                            {copiedId === message.id ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-emerald-300" />
                                <span className="text-emerald-300">تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

              {loading && (
                <div className="flex justify-end gap-3">
                  <div className="mt-1 hidden h-8 w-8 shrink-0 place-items-center rounded-lg border border-amber-300/15 bg-amber-300/[0.07] text-amber-300 sm:grid">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-3 rounded-[20px] rounded-tl-md border border-white/8 bg-white/[0.035] px-4 py-3 text-xs text-white/45">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-300" />
                    <span>أراجع تفاصيل العرض...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          </main>

          <footer className="shrink-0 border-t border-white/8 bg-[#0c0f16]/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleAsk();
              }}
              className="mx-auto max-w-3xl"
            >
              <div className="flex items-end gap-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-amber-300/35 focus-within:bg-white/[0.055]">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleAsk();
                    }
                  }}
                  rows={1}
                  maxLength={1200}
                  disabled={loading}
                  placeholder="اسأل عن أي تفصيل في العرض..."
                  className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-5 text-white outline-none placeholder:text-white/25 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="إرسال الرسالة"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-300 text-[#17130b] transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-white/20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-2 text-[9px] text-white/20">
                <span>Enter للإرسال · Shift + Enter لسطر جديد</span>
                <span>{input.length}/1200</span>
              </div>
            </form>
          </footer>
        </div>
      </section>
    </div>
  );
}
