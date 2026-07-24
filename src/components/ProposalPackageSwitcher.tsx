import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Layers, Star } from "@/components/Icons";

export interface PackageTier {
  id: string;
  name: string;
  badge?: string;
  priceUsd: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface ProposalPackageSwitcherProps {
  tiers?: PackageTier[];
  selectedTierId?: string;
  currency?: "USD" | "IQD" | "SAR";
  onSelectTier?: (tier: PackageTier) => void;
}

export function ProposalPackageSwitcher({
  tiers,
  selectedTierId,
  currency = "USD",
  onSelectTier,
}: ProposalPackageSwitcherProps) {
  const defaultTiers: PackageTier[] = tiers || [
    {
      id: "standard",
      name: "الباقة الأساسية (Standard)",
      priceUsd: 1800,
      description: "حل برمجي متكامل ومناسب لإطلاق النسخة الأولى والأسرع بالسوق.",
      features: [
        "تطوير البرمجيات والنواة الأساسية",
        "لوحة تحكم أدمن كاملة",
        "تطبيق ويب متجاوب 100%",
        "ضمان وصيانة مجانية لمدة 3 أشهر",
      ],
    },
    {
      id: "pro",
      name: "الباقة المتقدمة (Professional)",
      badge: "الأكثر طلباً 🌟",
      priceUsd: 2800,
      description: "خيار مثالي يتضمن كافة المزايا المتقدمة وأنظمة الذكاء الاصطناعي.",
      recommended: true,
      features: [
        "كافة مزايا الباقة الأساسية",
        "مساعد ذكاء اصطناعي مدمج (Workers AI)",
        "ربط بوابات الدفع الإلكتروني وتفنيات الدفع",
        "ضمان ودعم فني متقدم لمدة 6 أشهر",
        "أولوية المعالجة الفنية والتنفيذ",
      ],
    },
    {
      id: "enterprise",
      name: "باقة المؤسسات (Enterprise)",
      priceUsd: 4500,
      description: "حل سحابي فائق الأداء بمستوى مؤسساتي مع تخصيص شامل وتدريب.",
      features: [
        "كافة المزايا والمواصفات الكاملة",
        "بنية سحابية مخصصة ومستقلة",
        "دعم فني وتحديثات لمدة سنة كاملة (12 شهر)",
        "جلسات تدريب وتوثيق كامل للفريق",
        "اتفاقية مستوى الخدمة SLA 99.9%",
      ],
    },
  ];

  const [activeTierId, setActiveTierId] = useState(
    selectedTierId || defaultTiers.find((t) => t.recommended)?.id || defaultTiers[0].id
  );

  const formatPrice = (usd: number) => {
    let amount = usd;
    let symbol = "$";
    if (currency === "IQD") {
      amount = Math.round(usd * 1310);
      symbol = "د.ع";
    } else if (currency === "SAR") {
      amount = Math.round(usd * 3.75);
      symbol = "ر.س";
    }
    const formatted = new Intl.NumberFormat("en-GB").format(amount);
    return `${symbol} ${formatted}`;
  };

  const handleSelect = (tier: PackageTier) => {
    setActiveTierId(tier.id);
    if (onSelectTier) onSelectTier(tier);
  };

  return (
    <section className="proposal-package-switcher mt-10 p-6 rounded-2xl border border-amber-500/40 bg-card/80 backdrop-blur-md shadow-2xl text-start dir-rtl my-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-xl">
          <Layers className="w-6 h-6" />
          <span>اختيار باقة التنفيذ التفاعلية (Interactive Package Selection)</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">اختر الباقة المناسبة لتحديث التكلفة</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {defaultTiers.map((tier) => {
          const isSelected = activeTierId === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => handleSelect(tier)}
              className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 shadow-2xl ring-2 ring-amber-500/50"
                  : "border-border/60 bg-muted/30 hover:border-amber-500/40 hover:bg-muted/50"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-[11px] shadow-md border border-amber-300">
                  {tier.badge}
                </span>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-foreground">{tier.name}</h4>
                  {isSelected && <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />}
                </div>

                <div className="text-2xl font-black text-amber-400 font-mono">
                  {formatPrice(tier.priceUsd)}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-2 border-t border-border/50 pt-3 text-xs">
                {tier.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-foreground/90">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`w-full font-bold text-xs ${
                  isSelected ? "bg-amber-500 text-black hover:bg-amber-400" : ""
                }`}
              >
                {isSelected ? "الباقة المختارة حالياً ✓" : "اختيار هذه الباقة"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
