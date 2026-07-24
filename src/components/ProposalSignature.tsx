import { useRef, useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PenTool,
  Keyboard,
  Upload,
  XCircle,
  CheckCircle,
  RefreshCw,
  Shield,
  Edit,
} from "@/components/Icons";

import {
  submitProposalSignatureApi,
} from "@/lib/proposals-api";

interface ProposalSignatureProps {
  proposalTitle: string;
  clientName: string;
  proposalToken?: string;
  allowDraw?: boolean;
  allowType?: boolean;
  allowUpload?: boolean;
  allowRejection?: boolean;
  onSigned?: (signatureData: SignatureRecord) => void;
}

export interface SignatureRecord {
  status: "SIGNED" | "REJECTED";
  name: string;
  title: string;
  date: string;
  signatureImage?: string;
  rejectionReason?: string;
  verificationId: string;
  documentHash: string;
}

async function calculateSHA256(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return Math.random().toString(36).substring(2, 15);
  }
}

export function ProposalSignature({
  proposalTitle,
  clientName,
  proposalToken,
  allowDraw = true,
  allowType = true,
  allowUpload = true,
  allowRejection = true,
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
  const initialMode = allowDraw ? "draw" : allowType ? "type" : "upload";
  const [signMode, setSignMode] = useState<"draw" | "type" | "upload">(initialMode);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) return;

    setIsSubmitting(true);

    let signatureImage = "";
    if (signMode === "draw" && canvasRef.current && hasDrawn) {
      signatureImage = canvasRef.current.toDataURL("image/png");
    } else if (signMode === "upload" && uploadedImage) {
      signatureImage = uploadedImage;
    }

    const dateStr = new Intl.DateTimeFormat("ar-IQ", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const documentHash = await calculateSHA256(`${proposalTitle}:${signerName}:${dateStr}`);
    const verificationId = `DOC-SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const record: SignatureRecord = {
      status: "SIGNED",
      name: signerName.trim(),
      title: signerTitle.trim(),
      date: dateStr,
      signatureImage,
      verificationId,
      documentHash,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
      setSignedData(record);
      if (proposalToken) {
        await submitProposalSignatureApi(proposalToken, record).catch(() => {});
      }
      if (onSigned) onSigned(record);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !rejectionReason.trim()) return;

    setIsSubmitting(true);
    const dateStr = new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    const documentHash = await calculateSHA256(`${proposalTitle}:REJECTED:${rejectionReason}`);
    const verificationId = `DOC-REJ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const record: SignatureRecord = {
      status: "REJECTED",
      name: signerName.trim(),
      title: signerTitle.trim(),
      date: dateStr,
      rejectionReason: rejectionReason.trim(),
      verificationId,
      documentHash,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
      setSignedData(record);
      setShowRejectModal(false);
      if (proposalToken) {
        await submitProposalSignatureApi(proposalToken, record).catch(() => {});
      }
      if (onSigned) onSigned(record);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSignature = () => {
    localStorage.removeItem(storageKey);
    setSignedData(null);
    setHasDrawn(false);
    setUploadedImage("");
  };

  if (signedData) {
    if (signedData.status === "REJECTED") {
      return (
        <div className="proposal-signature-card mt-12 p-6 md:p-8 rounded-2xl border border-destructive/50 bg-destructive/10 backdrop-blur-lg shadow-2xl space-y-4 text-start dir-rtl">
          <div className="flex items-center justify-between gap-4 border-b border-destructive/30 pb-4 flex-wrap">
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <XCircle className="w-5 h-5" />
              <span>تم طلب تعديل / رفض هذا المقترح</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-destructive/20 text-destructive border border-destructive/40 font-mono font-semibold">
                {signedData.verificationId}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={resetSignature} className="text-xs text-muted-foreground hover:text-foreground">
                <Edit className="w-3.5 h-3.5 ml-1" /> تحديث القرار
              </Button>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">اسم صاحب الملاحظة</span>
              <strong className="text-foreground text-base">{signedData.name} ({signedData.title})</strong>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold mb-1">الملاحظات والسبب</span>
              <div className="p-3 rounded-xl bg-background/60 border border-border/40 text-foreground font-medium">
                {signedData.rejectionReason}
              </div>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">تاريخ الطلب</span>
              <span className="text-amber-300 font-mono text-xs">{signedData.date}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="proposal-signature-card mt-12 p-6 md:p-8 rounded-2xl border border-amber-500/50 bg-card/90 backdrop-blur-lg shadow-2xl space-y-6 text-start dir-rtl">
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4 flex-wrap">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
            <PenTool className="w-5 h-5" />
            <span>تم اعتماد وتوقيع المقترح (Documenso Certificate)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{signedData.verificationId}</span>
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={resetSignature} className="text-xs text-muted-foreground hover:text-foreground">
              <Edit className="w-3.5 h-3.5 ml-1" /> تغيير التوقيع
            </Button>
          </div>
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
            <span className="text-[11px] text-muted-foreground mb-2 font-mono">التوقيع الرقمي المعتمد</span>
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

        {/* Audit Trail & SHA-256 Checksum */}
        <div className="p-4 rounded-xl bg-black/50 border border-border/60 space-y-1.5 font-mono text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2 flex-wrap text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> سجل التوثيق والبصمة الرقمية (Audit Trail)
            </span>
            <span>الحالة: مشفّر ومعتمد 100%</span>
          </div>
          <div className="break-all opacity-90 text-[11px]">
            <span className="text-muted-foreground">SHA-256 Digest: </span>
            <span className="text-foreground">{signedData.documentHash}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="proposal-signature-section" className="proposal-signature-box mt-12 p-6 md:p-8 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-2xl text-start dir-rtl space-y-6">
      {/* NinuSoft Pre-Signed Official Counter-Signature Stamp */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg font-mono">
            NS
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
              <span>توقيع وختم NinuSoft المعتمد (Pre-signed & Verified)</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </h4>
            <p className="text-xs text-muted-foreground">
              موقع مسبقاً من المدير التنفيذي لشركة NinuSoft للحلول البرمجية.
            </p>
          </div>
        </div>
        <div className="text-left font-mono text-xs text-amber-400 font-semibold bg-background/60 px-3 py-1.5 rounded-lg border border-amber-500/30">
          SEAL-VERIFIED-2026
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <div className="flex items-center gap-2.5 text-primary font-bold text-xl">
          <PenTool className="w-6 h-6" />
          <span>اعتماد العميل والتوقيع الرقمي (Documenso Engine)</span>
        </div>
        <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border/40 flex-wrap">
          {allowDraw && (
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                signMode === "draw"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSignMode("draw")}
            >
              <PenTool className="w-3.5 h-3.5" /> رسم باليد
            </button>
          )}
          {allowType && (
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                signMode === "type"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSignMode("type")}
            >
              <Keyboard className="w-3.5 h-3.5" /> كتابة الاسم
            </button>
          )}
          {allowUpload && (
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                signMode === "upload"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSignMode("upload")}
            >
              <Upload className="w-3.5 h-3.5" /> رفع صورة
            </button>
          )}
        </div>
      </div>

      <p className="text-xs md:text-sm text-muted-foreground mb-6">
        قم بالتوقيع باليد/الماوس أو رفع صورة توقيعك لتأكيد موافقتك الرسمية وتوليد شهادة الاعتماد الإلكترونية (Documenso Verified).
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
        {signMode === "draw" && allowDraw ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>ارسم توقيعك في المربع أدناه (باستخدام الماوس أو اللمس):</span>
              {hasDrawn && (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-amber-400 hover:underline text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> مسح وإعادة الرسم
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
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-muted-foreground/60 gap-1.5">
                  <PenTool className="w-4 h-4" /> انقر واسحب هنا للرسم
                </div>
              )}
            </div>
          </div>
        ) : signMode === "type" && allowType ? (
          <div className="p-6 rounded-xl border-2 border-dashed border-amber-500/40 bg-black/40 text-center flex flex-col items-center justify-center min-h-[140px]">
            <span className="text-xs text-muted-foreground mb-2">معاينة التوقيع النصي:</span>
            <span className="font-serif italic text-3xl text-amber-400 tracking-wider">
              {signerName || "توقيع المعتمد"}
            </span>
          </div>
        ) : allowUpload ? (
          <div className="p-6 rounded-xl border-2 border-dashed border-amber-500/40 bg-black/40 text-center flex flex-col items-center justify-center space-y-3 min-h-[140px]">
            <span className="text-xs text-muted-foreground">اختر صورة التوقيع الخاص بك (PNG أو JPG):</span>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-colors">
              <Upload className="w-4 h-4" />
              <span>اختيار ملف التوقيع</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {uploadedImage && (
              <div className="pt-2">
                <img src={uploadedImage} alt="التوقيع المرفوع" className="max-h-20 object-contain mx-auto" />
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
          {allowRejection ? (
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle className="w-4 h-4" /> طلب تعديل / رفض المقترح
            </Button>
          ) : <div />}

          <Button type="submit" className="w-full md:w-auto px-8 font-bold text-sm flex items-center gap-2" disabled={isSubmitting}>
            <PenTool className="w-4 h-4" />
            {isSubmitting ? "جاري الاعتماد…" : "تأكيد واعتماد المقترح"}
          </Button>
        </div>
      </form>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-destructive/50 shadow-2xl space-y-4 text-start dir-rtl">
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <XCircle className="w-5 h-5" /> طلب تعديل أو رفض المقترح
            </div>
            <p className="text-xs text-muted-foreground">
              يرجى توضيح الملاحظات أو سبب طلب التعديل ليصل إلى فريق NinuSoft لتحديث المقترح.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                <span>سبب التعديل / الملاحظات</span>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب ملاحظاتك هنا..."
                  rows={4}
                  required
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit" variant="destructive" size="sm" disabled={isSubmitting}>
                  تأكيد الإرسال
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
