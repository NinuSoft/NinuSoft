import { useEffect, useState } from "react";
import { Sparkles, PenTool, RefreshCw } from "@/components/Icons";
import { askProposalAiApi } from "@/lib/proposals-api";

interface ProposalIncentiveBannerProps {
  content?: string;
  clientName?: string;
  proposalToken?: string;
  expiresAt?: string | null;
  onScrollToSign?: () => void;
}

export function ProposalIncentiveBanner({
  content,
  clientName,
  proposalToken,
  expiresAt,
  onScrollToSign,
}: ProposalIncentiveBannerProps) {
  const [incentiveText, setIncentiveText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDynamicAiIncentive = async () => {
    setLoading(true);
    try {
      if (proposalToken) {
        const prompt = `صغ حافزاً تسويقياً حماسياً ومقنعاً جداً في سطر واحد فقط (15 كلمة) يغري العميل (${clientName || "العميل"}) بالتوقيع والاعتماد المبكر لهذا العرض الفني والمالي.`;
        const res = await askProposalAiApi(proposalToken, prompt);
        if (res?.answer && res.answer.trim().length > 10) {
          setIncentiveText(res.answer.trim().replace(/^["']|["']$/g, ""));
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback fallback if network drops
    }

    // Smart context extraction fallback if API unreached
    const fallbackText = clientName
      ? `عرض حصري لـ (${clientName}): احصل على حزمة الضمان الذهبي والدعم التقني السريع المرفقة عند التوقيع المباشر.`
      : "اعتماد العرض المباشر يضمن لك حجز فريق العمل فوراً والحصول على كافة مزايا الضمان والصيانة الفنية المحددة.";
    setIncentiveText(fallbackText);
    setLoading(false);
  };

  useEffect(() => {
    fetchDynamicAiIncentive();
  }, [proposalToken, clientName]);

  return (
    <div className="proposal-incentive-banner mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-card border border-amber-500/50 shadow-xl flex items-center justify-between gap-4 flex-wrap text-start dir-rtl animate-in fade-in duration-300">
      <div className="flex items-center gap-3 flex-1 min-w-[280px]">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0 shadow-lg">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-sm text-amber-300">
              عرض مخصص وحافز الحجز المباشر
            </h4>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>جاري تخصيص الحافز الخاص بهذا العرض...</span>
            </div>
          ) : (
            <p className="text-xs text-foreground/90 font-medium leading-relaxed animate-in fade-in duration-300">
              {incentiveText}
            </p>
          )}
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
