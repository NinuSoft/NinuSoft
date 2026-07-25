import { useEffect } from "react";
import { CheckCircle, Sparkles, Clock, FileText, Rocket } from "@/components/Icons";

interface ProposalPostAcceptanceOnboardingProps {
  clientName: string;
  proposalTitle: string;
}

export function ProposalPostAcceptanceOnboarding({
  clientName,
  proposalTitle,
}: ProposalPostAcceptanceOnboardingProps) {
  useEffect(() => {
    // Simple visual pulse trigger on load
    const timer = setTimeout(() => {
      window.scrollTo({ top: 100, behavior: "smooth" });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="my-8 p-6 rounded-2xl bg-[#0f1f18] border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] text-start dir-rtl space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Celebration Header */}
      <div className="text-center space-y-2 border-b border-emerald-500/25 pb-5">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner mb-1">
          <Sparkles className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-300">
          تم اعتماد المقترح بنجاح
        </h3>
        <p className="text-xs text-emerald-200/80 max-w-md mx-auto leading-relaxed">
          شكراً لثقتكم بمؤسسة NinuSoft. تم تسجيل توقيع {clientName || "المعتمد"} على مقترح &ldquo;{proposalTitle}&rdquo; بنجاح.
        </p>
      </div>

      {/* 3-Step Onboarding Roadmap */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Rocket className="w-4 h-4 text-emerald-400" />
          <span>خارطة طريق الخطوات التالية للانطلاق المباشر:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card/80 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
              الخطوة 1
            </span>
            <h5 className="font-bold text-xs text-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>اجتماع الانطلاق (Kickoff)</span>
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              سيقوم مدير المشروع بالتواصل مع مؤسستكم خلال 24 ساعة لتنسيق موعد اجتماع الانطلاق الفني.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card/80 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
              الخطوة 2
            </span>
            <h5 className="font-bold text-xs text-foreground flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>تسليم متطلبات البدء</span>
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              تزويد فريق NinuSoft بالبيانات والشعارات الأولية لتهيئة البيئة والتطبيقات.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card/80 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
              الخطوة 3
            </span>
            <h5 className="font-bold text-xs text-foreground flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>متابعة التطوير والتسليمات</span>
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              متابعة المعاينات والتسليمات المرحلية وفق الجدول الزمني المعتمد بالعقد.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
