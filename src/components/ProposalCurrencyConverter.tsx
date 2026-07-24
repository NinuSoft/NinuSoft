import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle } from "@/components/Icons";

export type Currency = "USD" | "IQD" | "SAR";

interface ProposalCurrencyConverterProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export function ProposalCurrencyConverter({
  currentCurrency,
  onCurrencyChange,
}: ProposalCurrencyConverterProps) {
  const currencies: { code: Currency; label: string; symbol: string; rateNotice: string }[] = [
    { code: "USD", label: "دولار أمريكي", symbol: "$", rateNotice: "العملة الأساسية (USD)" },
    { code: "IQD", label: "دينار عراقي", symbol: "د.ع", rateNotice: "1 USD = 1,310 IQD" },
    { code: "SAR", label: "ريال سعودي", symbol: "ر.س", rateNotice: "1 USD = 3.75 SAR" },
  ];

  return (
    <div className="proposal-currency-converter p-3 rounded-xl bg-card/80 border border-amber-500/30 flex items-center justify-between gap-3 flex-wrap text-start dir-rtl shadow-md my-4">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
        <Globe className="w-4 h-4" />
        <span>عملة العرض:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {currencies.map((c) => (
          <Button
            key={c.code}
            type="button"
            variant={currentCurrency === c.code ? "default" : "outline"}
            size="sm"
            onClick={() => onCurrencyChange(c.code)}
            className={`text-xs font-bold font-mono flex items-center gap-1 ${
              currentCurrency === c.code
                ? "bg-amber-500 text-black border-amber-400"
                : "border-border/60 hover:bg-amber-500/10 text-muted-foreground"
            }`}
          >
            {currentCurrency === c.code && <CheckCircle className="w-3 h-3" />}
            <span>{c.symbol}</span>
            <span>{c.code}</span>
          </Button>
        ))}
      </div>

      <div className="text-[11px] font-mono text-muted-foreground">
        {currencies.find((c) => c.code === currentCurrency)?.rateNotice}
      </div>
    </div>
  );
}
