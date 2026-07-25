import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp, Clock, DollarSign } from "@/components/Icons";

export function ProposalRoiCalculator() {
  const [manualHours, setManualHours] = useState<number>(20);
  const [hourlyRate, setHourlyRate] = useState<number>(30);

  const stats = useMemo(() => {
    const hoursPerMonth = Math.round(manualHours * 4.33);
    const savedHoursMonth = Math.round(hoursPerMonth * 0.75); // 75% automation efficiency
    const monthlySavings = Math.round(savedHoursMonth * hourlyRate);
    const annualSavings = monthlySavings * 12;

    return {
      savedHoursMonth,
      monthlySavings,
      annualSavings,
    };
  }, [manualHours, hourlyRate]);

  return (
    <section className="my-8 p-6 rounded-2xl bg-card border border-primary/30 shadow-xl space-y-4 text-start dir-rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border/40 pb-3">
        <div className="flex items-center gap-2 font-bold text-lg text-foreground">
          <span className="p-2 rounded-xl bg-primary/15 text-primary">
            <Calculator className="w-5 h-5" />
          </span>
          <span>حاسبة العائد على الاستثمار والوفر التقديري (ROI Calculator)</span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> أداة تقدير الفعالية
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        أدخل متوسط الساعات والإنفاق التشغيلي الحالي لمؤسستك للاطلاع على الوفر التقديري في الوقت والتكاليف بعد تطبيق حلول NinuSoft:
      </p>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>ساعات العمل اليدوية أسبوعياً:</span>
          </label>
          <Input
            type="number"
            value={manualHours}
            onChange={(e) => setManualHours(Math.max(1, parseInt(e.target.value) || 0))}
            className="text-sm font-bold bg-background"
            min={1}
            max={200}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
            <span>متوسط تكلفة الساعة للفريق ($/ساعة):</span>
          </label>
          <Input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Math.max(5, parseInt(e.target.value) || 0))}
            className="text-sm font-bold bg-background"
            min={5}
          />
        </div>
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 text-center space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold block">ساعات مقتطعة شهرياً</span>
          <span className="text-2xl font-bold text-primary font-mono">
            {stats.savedHoursMonth.toLocaleString()} ساعة
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold block">الوفر التقديري شهرياً</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">
            ${stats.monthlySavings.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center space-y-1">
          <span className="text-[11px] text-muted-foreground font-semibold block">العائد السنوي المتوقع (ROI)</span>
          <span className="text-2xl font-bold text-amber-300 font-mono">
            ${stats.annualSavings.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );
}
