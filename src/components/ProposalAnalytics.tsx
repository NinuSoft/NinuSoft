import { useMemo } from "react";
import { BarChart } from "@/components/Icons";
import type { ProposalSummary } from "@/lib/proposals-api";

interface ProposalAnalyticsProps {
  items: ProposalSummary[];
}

export function ProposalAnalytics({ items }: ProposalAnalyticsProps) {
  // Every figure below is derived from backend telemetry. Metrics the backend
  // does not track (dwell time, week-over-week deltas) are intentionally absent
  // rather than estimated — this panel is used to make follow-up decisions.
  const stats = useMemo(() => {
    // Counts are coerced because an older backend that predates these fields
    // would otherwise turn every total into NaN.
    const num = (value: number | undefined | null) => Number(value) || 0;
    const totalOpens = items.reduce((sum, item) => sum + num(item.openCount), 0);
    const totalReads = items.reduce((sum, item) => sum + num(item.readCount), 0);
    const openedCount = items.filter((item) => num(item.openCount) > 0).length;
    const signedCount = items.filter(
      (item) => item.signatureStatus === "SIGNED",
    ).length;
    const rejectedCount = items.filter(
      (item) => item.signatureStatus === "REJECTED",
    ).length;
    const commentCount = items.reduce((sum, item) => sum + num(item.commentCount), 0);

    return {
      totalOpens,
      totalReads,
      openedCount,
      signedCount,
      rejectedCount,
      commentCount,
      signedRate: items.length
        ? `${Math.round((signedCount / items.length) * 100)}%`
        : "—",
    };
  }, [items]);

  return (
    <section className="proposal-analytics-dashboard space-y-6 dir-rtl text-start">
      <div className="proposal-admin-section-title">
        <div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <BarChart className="w-4 h-4 text-amber-400" /> تحليلات المقترحات
          </span>
          <h1>إحصائيات الأداء وتفاعل العملاء</h1>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic p-6 rounded-2xl bg-muted/20 border border-border/40">
          لا توجد بيانات كافية بعد. ستظهر الإحصائيات بمجرد إنشاء عرض وفتحه من قبل العميل.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-card/80 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">إجمالي مرات الفتح</span>
            <div className="text-2xl font-bold text-amber-400 font-mono">{stats.totalOpens}</div>
            <span className="text-[11px] text-muted-foreground">
              {stats.openedCount} من {items.length} عرضاً تم فتحه
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-border/60 bg-card/80 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">القراءات المكتملة</span>
            <div className="text-2xl font-bold text-foreground font-mono">{stats.totalReads}</div>
            <span className="text-[11px] text-muted-foreground">تفاعل عميق مع المحتوى</span>
          </div>

          <div className="p-5 rounded-2xl border border-border/60 bg-card/80 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">تعليقات العملاء</span>
            <div className="text-2xl font-bold text-foreground font-mono">{stats.commentCount}</div>
            <span className="text-[11px] text-muted-foreground">
              {stats.rejectedCount > 0 ? `${stats.rejectedCount} طلب تعديل` : "لا توجد طلبات تعديل"}
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">المقترحات المعتمدة</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {stats.signedCount} / {items.length}
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">نسبة الاعتماد {stats.signedRate}</span>
          </div>
        </div>
      )}
    </section>
  );
}
