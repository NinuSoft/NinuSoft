import { useEffect, useState } from "react";

interface ProposalExpiryCountdownProps {
  expiresAt?: string;
}

export function ProposalExpiryCountdown({ expiresAt }: ProposalExpiryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    // If no explicit expiresAt, set 7 days default window
    const targetDate = expiresAt
      ? new Date(expiresAt).getTime()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft.isExpired) {
    return (
      <div className="proposal-expiry-banner mb-6 p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-between gap-2 dir-rtl">
        <span>⚠️ انتهت صلاحية هذا المقترح الفني والمالي</span>
        <span className="text-[11px] opacity-80">يرجى التواصل مع NinuSoft لتحديث العرض</span>
      </div>
    );
  }

  return (
    <div className="proposal-expiry-banner mb-6 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-foreground text-xs flex items-center justify-between gap-4 flex-wrap dir-rtl">
      <div className="flex items-center gap-2 text-amber-400 font-bold">
        <span>⏰</span> صلاحية العرض:
      </div>

      <div className="flex items-center gap-3 font-mono text-xs">
        <div className="flex items-center gap-1">
          <strong className="text-sm text-amber-300 font-bold">{timeLeft.days}</strong>
          <span className="text-muted-foreground text-[11px]">يوم</span>
        </div>
        <span>:</span>
        <div className="flex items-center gap-1">
          <strong className="text-sm text-amber-300 font-bold">{String(timeLeft.hours).padStart(2, "0")}</strong>
          <span className="text-muted-foreground text-[11px]">ساعة</span>
        </div>
        <span>:</span>
        <div className="flex items-center gap-1">
          <strong className="text-sm text-amber-300 font-bold">{String(timeLeft.minutes).padStart(2, "0")}</strong>
          <span className="text-muted-foreground text-[11px]">دقيقة</span>
        </div>
        <span>:</span>
        <div className="flex items-center gap-1">
          <strong className="text-sm text-amber-300 font-bold">{String(timeLeft.seconds).padStart(2, "0")}</strong>
          <span className="text-muted-foreground text-[11px]">ثانية</span>
        </div>
      </div>
    </div>
  );
}
