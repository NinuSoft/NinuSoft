import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProposalSignatureProps {
  proposalTitle: string;
  clientName: string;
  onSigned?: (signatureData: { name: string; title: string; date: string }) => void;
}

export function ProposalSignature({
  proposalTitle,
  clientName,
  onSigned,
}: ProposalSignatureProps) {
  const storageKey = `ninusoft-signature:${proposalTitle}`;
  const [signedData, setSignedData] = useState<{
    name: string;
    title: string;
    date: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [signerName, setSignerName] = useState(clientName || "");
  const [signerTitle, setSignerTitle] = useState("المدير التنفيذي / ممثل الشركة");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) return;

    setIsSubmitting(true);
    const dateStr = new Intl.DateTimeFormat("ar-IQ", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const data = {
      name: signerName.trim(),
      title: signerTitle.trim(),
      date: dateStr,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSignedData(data);
      if (onSigned) onSigned(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (signedData) {
    return (
      <div className="proposal-signature-card mt-12 p-6 md:p-8 rounded-2xl border border-amber-500/40 bg-card/80 backdrop-blur-md shadow-2xl space-y-4 text-start">
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <span>✍️</span> تم اعتماد وتوقيع المقترح بنجاح
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
            ✓ موثق إلكترونياً
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
          <div>
            <span className="block text-xs text-muted-foreground font-semibold">اسم الموقّع</span>
            <strong className="text-foreground text-base">{signedData.name}</strong>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground font-semibold">الصفة / المسمى</span>
            <span className="text-foreground font-medium">{signedData.title}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground font-semibold">تاريخ التوقيع</span>
            <span className="text-amber-300 font-mono text-xs">{signedData.date}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="proposal-signature-box mt-12 p-6 md:p-8 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xl text-start">
      <div className="flex items-center gap-2.5 text-primary font-bold text-lg mb-2">
        <span>✍️</span> الاعتماد والتوقيع الإلكتروني
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-6">
        يرجى إدخال اسم المعتمد وتأكيد الموافقة على هذا المقترح الفني والمالي.
      </p>

      <form onSubmit={handleSign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="grid gap-1.5 text-xs font-semibold text-foreground">
          <span>اسم المعتمد الكامل</span>
          <Input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="أدخل اسمك الكريم"
            required
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-foreground">
          <span>المسمى الوظيفي / الصفة</span>
          <Input
            value={signerTitle}
            onChange={(e) => setSignerTitle(e.target.value)}
            placeholder="مثال: المدير التنفيذي"
            required
          />
        </label>

        <div className="md:col-span-2 pt-2">
          <Button type="submit" className="w-full md:w-auto px-8 font-bold" disabled={isSubmitting}>
            {isSubmitting ? "جاري الاعتماد…" : "✍️ اعتماد وتوقيع المقترح"}
          </Button>
        </div>
      </form>
    </section>
  );
}
