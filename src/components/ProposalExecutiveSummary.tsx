import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle,
  FileText,
  Layers,
  Printer,
  Shield,
  Sparkles,
  Target,
  X,
} from "@/components/Icons";

interface ProposalExecutiveSummaryProps {
  proposalTitle: string;
  clientName: string;
  content: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

function cleanMarkdown(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ProposalExecutiveSummary({
  proposalTitle,
  clientName,
  content,
  token,
  isOpen,
  onClose,
}: ProposalExecutiveSummaryProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const lines = content.split("\n").map((line) => line.trim());
  const headings = lines
    .filter((line) => /^#{1,3}\s+/.test(line))
    .map((line) => cleanMarkdown(line.replace(/^#{1,3}\s+/, "")))
    .filter(Boolean)
    .slice(0, 8);
  const bullets = Array.from(
    new Set(
      lines
        .filter((line) => /^[-*]\s+/.test(line))
        .map((line) => cleanMarkdown(line.replace(/^[-*]\s+/, "")))
        .filter(Boolean),
    ),
  ).slice(0, 6);
  const overview =
    content
      .split(/\n\s*\n/)
      .map(cleanMarkdown)
      .find((paragraph) => paragraph.length > 45 && !paragraph.includes("```")) ||
    `يوضح هذا العرض نطاق العمل المقترح لصالح ${clientName}، والمخرجات الرئيسية وآلية التنفيذ.`;
  const deliverables =
    bullets.length > 0
      ? bullets
      : ["حل متكامل قابل للتوسع", "تنفيذ بمعايير جودة وأمان عالية", "دعم واضح خلال مراحل التسليم"];
  const documentSections =
    headings.length > 0 ? headings : ["نطاق العمل", "المخرجات", "خطة التنفيذ"];
  const formattedDate = new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return createPortal(
    <div
      className="executive-chat-overlay fixed inset-0 z-[100] flex items-end justify-center bg-[#07090e]/90 p-0 sm:items-center sm:p-5"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="executive-chat-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="executive-chat-dialog relative flex h-[96dvh] w-full max-w-6xl overflow-hidden rounded-t-[28px] border border-white/10 bg-[#0c0f16] text-right text-white shadow-[0_35px_120px_rgba(0,0,0,.65)] sm:h-[88vh] sm:rounded-[32px]">
        <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-amber-400/10 blur-[100px]" />

        <aside className="relative hidden w-[300px] shrink-0 flex-col border-l border-white/8 bg-white/[0.025] p-5 lg:flex">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-[#111318] shadow-[0_0_28px_rgba(251,191,36,.16)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold">NinuSoft AI</p>
              <p className="mt-0.5 text-[11px] text-white/40">الملخص التنفيذي الذكي</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="px-1 text-[10px] font-bold tracking-wide text-white/30">مصدر الملخص</p>
            <div className="mt-3 rounded-2xl border border-white/8 bg-black/15 p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-400/10 text-amber-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{proposalTitle}</p>
                  <p className="mt-1 text-[10px] leading-5 text-white/35">تم تحليل محتوى العرض الحالي فقط.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
              <span className="text-[9px] text-white/30">المخرجات</span>
              <strong className="mt-1 block font-mono text-lg text-amber-300">{deliverables.length}</strong>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
              <span className="text-[9px] text-white/30">الأقسام</span>
              <strong className="mt-1 block font-mono text-lg text-amber-300">{documentSections.length}</strong>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              الملخص جاهز
            </div>
            <p className="mt-2 text-[10px] leading-5 text-white/30">يمكنك طباعته أو العودة إلى العرض الكامل.</p>
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
                  <h2 id="executive-chat-title" className="truncate text-sm font-extrabold sm:text-base">
                    الملخص التنفيذي
                  </h2>
                  <span className="hidden rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-0.5 text-[9px] font-bold text-emerald-300 sm:inline">
                    مكتمل
                  </span>
                </div>
                <p className="mt-1 truncate text-[10px] text-white/35 sm:text-[11px]">{proposalTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="executive-chat-print flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-[11px] font-bold text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">طباعة</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="إغلاق الملخص التنفيذي"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="executive-chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="executive-chat-print-content mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-7 sm:px-7 sm:py-9">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/8 bg-white/[0.055] px-4 py-3 text-xs font-semibold text-white/75 sm:text-sm">
                  لخص لي هذا العرض تنفيذياً ووضّح أهم المخرجات.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-[#111318]">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <strong className="text-xs">NinuSoft AI</strong>
                    <span className="text-[9px] text-white/25">الآن</span>
                  </div>

                  <div className="overflow-hidden rounded-2xl rounded-tr-sm border border-white/8 bg-white/[0.025]">
                    <div className="border-b border-white/8 p-5 sm:p-6">
                      <span className="text-[10px] font-bold tracking-wide text-amber-300/70">EXECUTIVE BRIEF</span>
                      <h3 className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">{proposalTitle}</h3>
                      <p className="mt-2 text-xs leading-6 text-white/45">
                        مُعد لصالح <strong className="text-white/70">{clientName}</strong> · {formattedDate}
                      </p>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <Sparkles className="h-4 w-4 text-amber-300" />
                          الخلاصة
                        </div>
                        <p className="mt-3 text-xs leading-7 text-white/60 sm:text-[13px]">{overview.slice(0, 650)}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <Target className="h-4 w-4 text-amber-300" />
                          المخرجات الرئيسية
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {deliverables.map((deliverable, index) => (
                            <div
                              key={`${deliverable}-${index}`}
                              className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/15 p-3"
                            >
                              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                              <p className="text-[11px] leading-5 text-white/55">{deliverable}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <Layers className="h-4 w-4 text-amber-300" />
                          يشمل العرض
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {documentSections.map((heading, index) => (
                            <span
                              key={`${heading}-${index}`}
                              className="rounded-full border border-amber-300/15 bg-amber-300/[0.05] px-3 py-1.5 text-[10px] font-bold text-amber-100/65"
                            >
                              {heading}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4 text-[10px] text-white/30">
                        <span className="flex items-center gap-1.5">
                          <Shield className="h-3 w-3 text-emerald-400" />
                          مبني على محتوى العرض
                        </span>
                        <span dir="ltr" className="max-w-[14rem] truncate font-mono">Ref: {token}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 px-1 text-[9px] text-white/20">ملخص مولّد تلقائياً من وثيقة العرض</p>
                </div>
              </div>
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/8 bg-[#0c0f16] px-4 py-3 sm:px-6">
            <p className="hidden text-[10px] text-white/25 sm:block">راجع الوثيقة الكاملة للاطلاع على جميع التفاصيل والشروط.</p>
            <button
              type="button"
              onClick={onClose}
              className="mr-auto rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-[#111318] transition hover:bg-amber-300"
            >
              العودة إلى العرض
            </button>
          </footer>
        </div>
      </section>
    </div>,
    document.body,
  );
}
