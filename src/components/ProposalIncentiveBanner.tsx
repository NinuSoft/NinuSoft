import { useMemo } from "react";
import { Sparkles, PenTool } from "@/components/Icons";

interface ProposalIncentiveBannerProps {
  content?: string;
  clientName?: string;
  expiresAt?: string | null;
  onScrollToSign?: () => void;
}

function extractAiIncentive(markdown?: string, clientName?: string): string {
  if (!markdown) {
    return clientName
      ? `حافز خاص لـ (${clientName}): احصل على حزمة الدعم التقني والضمان السريع المرفقة مع هذا العرض عند التوقيع الفوري.`
      : "احصل على الدعم التقني والضمان الفني الشامل المرفق في المقترح عند اعتماد وتوقيع العرض قبل انتهاء الصلاحية.";
  }

  const lines = markdown.split("\n").map((l) => l.trim());

  // Search for explicit bonus / support / warranty terms in proposal text
  const bonusLines = lines.filter(
    (line) =>
      line.includes("ضمان") ||
      line.includes("دعم") ||
      line.includes("مجاني") ||
      line.includes("صيانة") ||
      line.includes("أشهر") ||
      line.includes("ميزة")
  );

  if (bonusLines.length > 0) {
    // Clean up markdown bullet points / headers
    const cleaned = bonusLines[0]
      .replace(/^[-*#>]+\s*/, "")
      .replace(/[*_~`]/g, "")
      .trim();
    if (cleaned.length > 10 && cleaned.length < 160) {
      return `ميزة العرض الحصرية لـ (${clientName || "العميل"}): ${cleaned} - مدمجة مجاناً عند الاعتماد والتوقيع المبكر.`;
    }
  }

  return `حافز مخصص لـ (${clientName || "العميل"}): اعتماد العرض المباشر يضمن لك حجز فريق العمل فوراً والحصول على الضمان والصيانة الفنية الكاملة المحددة في المقترح.`;
}

export function ProposalIncentiveBanner({
  content,
  clientName,
  expiresAt,
  onScrollToSign,
}: ProposalIncentiveBannerProps) {
  const aiIncentiveText = useMemo(
    () => extractAiIncentive(content, clientName),
    [content, clientName]
  );

  return (
    <div className="proposal-incentive-banner mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-card border border-amber-500/50 shadow-xl flex items-center justify-between gap-4 flex-wrap text-start dir-rtl animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0 shadow-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
            <span>حافز الحجز المباشر (AI Generated Incentive)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              مستخرج ذكياً من العرض
            </span>
          </h4>
          <p className="text-xs text-foreground/90 font-medium mt-0.5">
            {aiIncentiveText}
          </p>
        </div>
      </div>

      {onScrollToSign && (
        <button
          type="button"
          onClick={onScrollToSign}
          className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-lg border border-amber-300 shrink-0"
        >
          <PenTool className="w-4 h-4" /> اعتماد وتوقيع العرض الآن
        </button>
      )}
    </div>
  );
}
