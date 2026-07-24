import { Clock, CheckCircle, PenTool } from "@/components/Icons";

interface ProposalIncentiveBannerProps {
  expiresAt?: string | null;
  onScrollToSign?: () => void;
}

export function ProposalIncentiveBanner({ expiresAt, onScrollToSign }: ProposalIncentiveBannerProps) {
  return (
    <div className="proposal-incentive-banner mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-card border border-amber-500/50 shadow-xl flex items-center justify-between gap-4 flex-wrap text-start dir-rtl animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0 shadow-lg">
          ⚡
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
            <span>حافز الحجز المباشر (Early-Bird Bonus)</span>
          </h4>
          <p className="text-xs text-foreground/90 font-medium">
            احصل على <strong className="text-amber-400 font-bold">دعم فني مجاني وصيانة متكاملة لمدة 3 أشهر إضافية</strong> عند اعتماد وتوقيع العرض قبل انتهاء الصلاحية.
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
