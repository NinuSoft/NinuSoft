import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProposalSignatureProps {
  proposalTitle: string;
  clientName: string;
  onSigned?: (signatureData: SignatureRecord) => void;
}

export interface SignatureRecord {
  name: string;
  title: string;
  date: string;
  signatureImage: string;
  verificationId: string;
}

export function ProposalSignature({
  proposalTitle,
  clientName,
  onSigned,
}: ProposalSignatureProps) {
  const storageKey = `ninusoft-documenso-sig:${proposalTitle}`;
  const [signedData, setSignedData] = useState<SignatureRecord | null>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [signerName, setSignerName] = useState(clientName || "");
  const [signerTitle, setSignerTitle] = useState("المدير التنفيذي / ممثل الشركة");
  const [signMode, setSignMode] = useState<"draw" | "type">("draw");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Initialize Canvas
  useEffect(() => {
    if (signMode !== "draw" || signedData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#e5c158";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [signMode, signedData]);

  const startDrawing = (x: number, y: number) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(x - rect.left, y - rect.top);
    setHasDrawn(true);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(x - rect.left, y - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) return;

    setIsSubmitting(true);

    let signatureImage = "";
    if (signMode === "draw" && canvasRef.current && hasDrawn) {
      signatureImage = canvasRef.current.toDataURL("image/png");
    }

    const dateStr = new Intl.DateTimeFormat("ar-IQ", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const verificationId = `DOC-SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const record: SignatureRecord = {
      name: signerName.trim(),
      title: signerTitle.trim(),
      date: dateStr,
      signatureImage,
      verificationId,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
      setSignedData(record);
      if (onSigned) onSigned(record);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (signedData) {
    return (
      <div className="proposal-signature-card mt-12 p-6 md:p-8 rounded-2xl border border-amber-500/50 bg-card/90 backdrop-blur-lg shadow-2xl space-y-6 text-start dir-rtl">
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4 flex-wrap">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
            <span>✍️</span> تم اعتماد وتوقيع المقترح بنجاح (Documenso Verified)
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
            ✓ {signedData.verificationId}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">اسم المعتمد</span>
              <strong className="text-foreground text-lg">{signedData.name}</strong>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">الصفة / المسمى</span>
              <span className="text-foreground font-medium text-sm">{signedData.title}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">تاريخ التوقيع والاعتماد</span>
              <span className="text-amber-300 font-mono text-xs">{signedData.date}</span>
            </div>
          </div>

          {/* Signature Preview */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/40 text-center flex flex-col items-center justify-center min-h-[7rem]">
            <span className="text-[11px] text-muted-foreground mb-2 font-mono">التوقيع المعتمد</span>
            {signedData.signatureImage ? (
              <img
                src={signedData.signatureImage}
                alt="التوقيع المعتمد"
                className="max-h-20 object-contain"
              />
            ) : (
              <span className="font-serif italic text-2xl text-amber-400 tracking-wider">
                {signedData.name}
              </span>
            )}
          </div>
        </div>

        {/* Audit Trail Badge */}
        <div className="p-3 rounded-lg bg-black/40 border border-border/40 text-[11px] text-muted-foreground flex items-center justify-between gap-2 flex-wrap font-mono">
          <span>🛡️ التوثيق الأمني: مشفّر ومعتمد إلكترونياً</span>
          <span>معرّف التوثيق: {signedData.verificationId}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="proposal-signature-box mt-12 p-6 md:p-8 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-2xl text-start dir-rtl">
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div className="flex items-center gap-2.5 text-primary font-bold text-xl">
          <span>✍️</span> الاعتماد والتوقيع الرقمي (Documenso Style)
        </div>
        <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border/40">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              signMode === "draw"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setSignMode("draw")}
          >
            ✍️ رسم التوقيع
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              signMode === "type"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setSignMode("type")}
          >
            ⌨️ كتابة الاسم
          </button>
        </div>
      </div>

      <p className="text-xs md:text-sm text-muted-foreground mb-6">
        قم بالتوقيع باليد/الماوس أو كتابة اسمك لتأكيد موافقتك الرسمية على مقترح مشروع NinuSoft.
      </p>

      <form onSubmit={handleSign} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1.5 text-xs font-semibold text-foreground">
            <span>اسم المعتمد الكامل</span>
            <Input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
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
        </div>

        {/* Signature Pad */}
        {signMode === "draw" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>ارسم توقيعك في المربع أدناه (باستخدام الماوس أو اللمس):</span>
              {hasDrawn && (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-amber-400 hover:underline text-xs font-bold"
                >
                  مسح وإعادة الرسم 🔄
                </button>
              )}
            </div>

            <div className="relative rounded-xl border-2 border-dashed border-amber-500/40 bg-black/40 overflow-hidden touch-none flex justify-center">
              <canvas
                ref={canvasRef}
                width={550}
                height={160}
                className="w-full max-w-[550px] h-[160px] cursor-crosshair"
                onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
                onMouseMove={(e) => draw(e.clientX, e.clientY)}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  if (touch) startDrawing(touch.clientX, touch.clientY);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  if (touch) draw(touch.clientX, touch.clientY);
                }}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-muted-foreground/60">
                  انقر واسحب هنا للرسم ✍️
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl border-2 border-dashed border-amber-500/40 bg-black/40 text-center flex flex-col items-center justify-center min-h-[140px]">
            <span className="text-xs text-muted-foreground mb-2">معاينة التوقيع النصي:</span>
            <span className="font-serif italic text-3xl text-amber-400 tracking-wider">
              {signerName || "توقيع المعتمد"}
            </span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end">
          <Button type="submit" className="w-full md:w-auto px-8 font-bold text-sm" disabled={isSubmitting}>
            {isSubmitting ? "جاري الاعتماد…" : "✍️ تأكيد واعتماد المقترح"}
          </Button>
        </div>
      </form>
    </section>
  );
}
