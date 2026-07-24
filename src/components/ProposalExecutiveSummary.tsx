import { Button } from "@/components/ui/button";
import { XCircle, Printer, Download, CheckCircle, FileText } from "@/components/Icons";

interface ProposalExecutiveSummaryProps {
  proposalTitle: string;
  clientName: string;
  content: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalExecutiveSummary({
  proposalTitle,
  clientName,
  content,
  token,
  isOpen,
  onClose,
}: ProposalExecutiveSummaryProps) {
  if (!isOpen) return null;

  // Extract sections/bullet points for executive overview
  const lines = content.split("\n").filter((l) => l.trim());
  const headings = lines.filter((l) => l.startsWith("#"));
  const bullets = lines.filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* ")).slice(0, 6);

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 dir-rtl">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-2xl bg-card border border-amber-500/50 shadow-2xl space-y-6 text-start">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <FileText className="w-5 h-5" />
            <span>الملخص التنفيذي (Executive Summary Sheet)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePrintSummary} className="flex items-center gap-1 text-xs font-bold">
              <Printer className="w-3.5 h-3.5 text-amber-400" /> طباعة الملخص
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Printable Executive Card Content */}
        <div className="p-6 rounded-xl bg-background border border-amber-500/30 space-y-6 text-xs leading-relaxed font-sans shadow-inner">
          <div className="flex justify-between items-start border-b border-border/60 pb-4">
            <div>
              <div className="text-lg font-black text-amber-400 font-mono">NINUSOFT</div>
              <h2 className="text-base font-extrabold text-foreground mt-1">{proposalTitle}</h2>
              <p className="text-muted-foreground font-semibold">مُعد لصالح: {clientName}</p>
            </div>
            <div className="text-left font-mono text-[11px] text-muted-foreground">
              <div>معرف العرض: {token}</div>
              <div>التاريخ: {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date())}</div>
            </div>
          </div>

          {/* Core Objectives & Deliverables Summary */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 text-amber-400">
              <CheckCircle className="w-4 h-4" /> أهداف النطاق والمخرجات الرئيسية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
              {bullets.length > 0 ? (
                bullets.map((b, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/40 border border-border/40 font-mono text-[11px]">
                    {b.replace(/^[-*]\s*/, "")}
                  </div>
                ))
              ) : (
                <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                  تطوير وحلول برمجية متكاملة وفق أرقى معايير الجودة والأمان.
                </div>
              )}
            </div>
          </div>

          {/* Structure Overview */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground text-amber-400">هيكلية وأقسام الوثيقة</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {headings.slice(0, 8).map((h, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20 text-[11px]">
                  {h.replace(/^#+\s*/, "")}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Commitment */}
          <div className="border-t border-border/60 pt-4 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>حقوق الطبع والتنفيذ محفوظة لـ NinuSoft</span>
            <span>وثيقة رسمية مشفّرة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
