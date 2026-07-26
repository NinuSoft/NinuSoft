import { useRef, useState, ChangeEvent } from "react";
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
  Tag,
} from "@/components/Icons";

import {
  ApiError,
  getProposalDiscountsApi,
  type SignatureInput,
  type SignatureRecord,
} from "@/lib/proposals-api";
import { useToast } from "@/hooks/use-toast";
import { formatProposalDate } from "@/lib/format-date";

interface ProposalSignatureProps {
  clientName: string;
  /** Which section this block signs. Omitted only for legacy whole-document proposals. */
  sectionId?: string;
  sectionTitle?: string;
  /** The decision already recorded for this section, if any. */
  signature: SignatureRecord | null;
  loading?: boolean;
  onSubmit: (sectionId: string | undefined, input: SignatureInput) => Promise<SignatureRecord>;
  allowDraw?: boolean;
  allowType?: boolean;
  allowUpload?: boolean;
  allowRejection?: boolean;
  enablePromoCode?: boolean;
  onSigned?: (signatureData: SignatureRecord) => void;
}

export type { SignatureRecord };

/**
 * One copy of the finality notice, shared by the approve checkbox and the
 * reject modal. Previously each flow had its own wording and they drifted:
 * the reject modal ended up promising "flexibility and adjustments" while the
 * backend enforces the exact same 409-on-retry finality as approval.
 */
function FinalityNotice({ sectionTitle }: { sectionTitle?: string }) {
  return (
    <>
      <strong className="block mb-0.5">هذا القرار نهائي ولا يمكن التراجع عنه.</strong>
      بعد الإرسال لا يمكنك تعديل هذا القرار أو إلغاؤه أو تغييره
      {sectionTitle ? ` بخصوص "${sectionTitle}"` : ""}. للتعديل بعد ذلك يلزم
      التواصل مع فريق NinuSoft.
    </>
  );
}

/** Reads either the snake_case column name or the camelCase alias. */
function sigField(
  record: SignatureRecord | null,
  snake: keyof SignatureRecord,
  camel: keyof SignatureRecord,
): string {
  if (!record) return "";
  return String(record[snake] ?? record[camel] ?? "");
}

/** Converts Arabic/Eastern digits to 0-9 and strips non-numeric characters. */
function normalizeDigits(str: string): string {
  const map: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  return str.replace(/[٠-٩۰-۹]/g, (w) => map[w] || w).replace(/\D/g, "");
}

/**
 * Masks all but the last 4 digits for the client-facing panel. Proposals are
 * frequently unprotected by a password, so anyone holding the link could
 * otherwise read the signer's full national ID off the page; the admin
 * dashboard still shows it in full since that's where identity actually needs
 * verifying.
 */
function maskNationalId(id: string): string {
  if (id.length <= 4) return id;
  return "•".repeat(id.length - 4) + id.slice(-4);
}

export function ProposalSignature({
  clientName,
  sectionId,
  sectionTitle,
  signature,
  loading = false,
  onSubmit,
  allowDraw = true,
  allowType = true,
  allowUpload = true,
  allowRejection = true,
  enablePromoCode = true,
  onSigned,
}: ProposalSignatureProps) {
  const { toast } = useToast();
  // The hook owns the fetched list; this only holds a record produced by this
  // component's own submit so the panel updates without waiting for a refetch.
  const [localRecord, setLocalRecord] = useState<SignatureRecord | null>(null);
  const signedData = localRecord ?? signature;
  const loadingSignature = loading && !signedData;


  const [signerName, setSignerName] = useState(clientName || "");
  const [signerTitle, setSignerTitle] = useState("المدير التنفيذي / ممثل الشركة");
  const [nationalId, setNationalId] = useState(
    sigField(signature, "national_id", "nationalId"),
  );
  const [nationalIdError, setNationalIdError] = useState("");
  const initialMode = allowDraw ? "draw" : allowType ? "type" : "upload";
  const [signMode, setSignMode] = useState<"draw" | "type" | "upload">(initialMode);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  /** The client must tick the irreversibility notice before either decision. */
  const [acknowledged, setAcknowledged] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; label: string } | null>(null);
  const [promoError, setPromoError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  /**
   * Applied before every stroke rather than once on mount.
   *
   * The canvas is not in the DOM while the existing signature is being
   * fetched, so a mount-time effect ran against a null ref and never re-ran
   * once the element appeared — leaving the context on its default black until
   * something else changed signMode. Setting the canvas width or height also
   * resets these properties, so a one-shot setup is fragile either way.
   */
  const applyPenStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#e5c158";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const toCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { cx: 0, cy: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      cx: (clientX - rect.left) * scaleX,
      cy: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (x: number, y: number) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    applyPenStyle(ctx);
    const { cx, cy } = toCanvasCoords(x, y);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    setHasDrawn(true);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { cx, cy } = toCanvasCoords(x, y);
    ctx.lineTo(cx, cy);
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

  const validateNationalId = (): string | null => {
    const cleaned = normalizeDigits(nationalId);
    if (cleaned.length === 0) {
      return "الرقم الوطني مطلوب وإجباري للتوقيع (يتكون من 12 رقم).";
    }
    if (cleaned.length !== 12) {
      return `الرقم الوطني يجب أن يتكون من 12 رقم تماماً (أدخلت ${cleaned.length} رقم).`;
    }
    return null;
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !acknowledged) return;

    const nidError = validateNationalId();
    if (nidError) {
      setNationalIdError(nidError);
      toast({
        variant: "destructive",
        title: "الرقم الوطني مطلوب وإجباري",
        description: nidError,
      });
      return;
    }
    setNationalIdError("");

    setIsSubmitting(true);

    let signatureImage = "";
    if (signMode === "draw" && canvasRef.current && hasDrawn) {
      signatureImage = canvasRef.current.toDataURL("image/png");
    } else if (signMode === "upload" && uploadedImage) {
      signatureImage = uploadedImage;
    }

    await submitDecision({
      status: "SIGNED",
      name: signerName.trim(),
      title: signerTitle.trim(),
      nationalId: normalizeDigits(nationalId),
      signatureImage: signatureImage || null,
    });
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !rejectionReason.trim() || !acknowledged) return;

    const nidError = validateNationalId();
    if (nidError) {
      setNationalIdError(nidError);
      toast({
        variant: "destructive",
        title: "الرقم الوطني مطلوب وإجباري",
        description: nidError,
      });
      return;
    }
    setNationalIdError("");

    setIsSubmitting(true);
    await submitDecision(
      {
        status: "REJECTED",
        name: signerName.trim(),
        title: signerTitle.trim(),
        nationalId: normalizeDigits(nationalId),
        rejectionReason: rejectionReason.trim(),
      },
      () => setShowRejectModal(false),
    );
  };

  /**
   * Sends the decision and only then shows it as recorded. The old flow set
   * local state first, so a rejected request still rendered the full
   * "signed and verified" panel to the client.
   */
  const submitDecision = async (
    input: SignatureInput,
    onSuccess?: () => void,
  ) => {
    try {
      const record = await onSubmit(sectionId, input);
      setLocalRecord(record);
      onSuccess?.();
    } catch (err) {
      const isFinalized =
        err instanceof ApiError && err.code === "signature_finalized";
      toast({
        variant: "destructive",
        title: isFinalized ? "تم اتخاذ القرار مسبقاً" : "تعذر حفظ القرار",
        description:
          err instanceof Error
            ? err.message
            : "حدث خطأ غير متوقع. حاول مجدداً.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Without this the signing form flashes before the fetch resolves, inviting a
  // client to re-sign a proposal the server will reject with 409.
  if (loadingSignature) {
    return (
      <div className="proposal-signature-card mt-12 p-6 md:p-8 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-2xl text-start dir-rtl">
        <p className="text-xs text-muted-foreground italic">جارٍ تحميل حالة الاعتماد...</p>
      </div>
    );
  }

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
                {sigField(signedData, "verification_id", "verificationId")}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">اسم صاحب الملاحظة</span>
              <strong className="text-foreground text-base">{signedData.name} ({signedData.title})</strong>
              {sigField(signedData, "national_id", "nationalId") && (
                <span className="block text-xs font-mono text-amber-400 font-bold mt-1">
                  💳 الرقم الوطني: {maskNationalId(sigField(signedData, "national_id", "nationalId"))}
                </span>
              )}
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold mb-1">الملاحظات والسبب</span>
              <div className="p-3 rounded-xl bg-background/60 border border-border/40 text-foreground font-medium">
                {sigField(signedData, "rejection_reason", "rejectionReason")}
              </div>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">تاريخ الطلب</span>
              <span className="text-amber-300 font-mono text-xs">
                {formatProposalDate(signedData.signature_date, "long")}
              </span>
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
            <span>تم اعتماد وتوقيع المقترح</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{sigField(signedData, "verification_id", "verificationId")}</span>
            </span>
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
            {sigField(signedData, "national_id", "nationalId") && (
              <div>
                <span className="block text-xs text-muted-foreground font-semibold">الرقم الوطني المعتمد</span>
                <span className="text-amber-400 font-mono text-sm font-bold tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30 inline-block mt-0.5">
                  💳 {maskNationalId(sigField(signedData, "national_id", "nationalId"))}
                </span>
              </div>
            )}
            <div>
              <span className="block text-xs text-muted-foreground font-semibold">تاريخ التوقيع والاعتماد</span>
              <span className="text-amber-300 font-mono text-xs">
                {formatProposalDate(signedData.signature_date, "long")}
              </span>
            </div>
          </div>

          {/* Signature Preview */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/40 text-center flex flex-col items-center justify-center min-h-[7rem]">
            <span className="text-[11px] text-muted-foreground mb-2 font-mono">التوقيع الرقمي المعتمد</span>
            {sigField(signedData, "signature_image", "signatureImage") ? (
              <img
                src={sigField(signedData, "signature_image", "signatureImage")}
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
            <span className="text-foreground">
              {sigField(signedData, "document_hash", "documentHash")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="proposal-signature-section" className="proposal-signature-box mt-12 p-4 sm:p-6 md:p-8 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-2xl text-start dir-rtl space-y-6">
      <div className="proposal-signature-print-placeholder">
        <div className="proposal-signature-print-heading">
          <span>ACCEPTANCE</span>
          <h2>اعتماد العرض</h2>
          <p>بالتوقيع أدناه، يقر ممثل العميل بمراجعة العرض والموافقة على نطاقه وشروطه.</p>
        </div>
        <div className="proposal-signature-print-fields">
          <div>
            <span>اسم المعتمد</span>
            <i />
          </div>
          <div>
            <span>الصفة / المسمى الوظيفي</span>
            <i />
          </div>
          <div>
            <span>الرقم الوطني (12 رقم)</span>
            <i />
          </div>
          <div>
            <span>التوقيع</span>
            <i />
          </div>
          <div>
            <span>التاريخ</span>
            <i />
          </div>
        </div>
        <div className="proposal-signature-print-seal">
          <strong>NinuSoft</strong>
          <span>SEAL-VERIFIED-2026 · توقيع الشركة معتمد مسبقاً</span>
        </div>
      </div>

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
          <span>اعتماد العميل والتوقيع الرقمي</span>
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
        قم بإدخال اسمك ورقمك الوطني المكون من 12 رقم والتوقيع باليد/الماوس أو رفع صورة توقيعك لتأكيد الموافقة وتوليد شهادة الاعتماد الإلكترونية.
      </p>

      <form onSubmit={handleSign} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="grid gap-1.5 text-xs font-semibold text-foreground">
            <span>اسم المعتمد الكامل <span className="text-destructive">*</span></span>
            <Input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              required
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-foreground">
            <span>المسمى الوظيفي / الصفة <span className="text-destructive">*</span></span>
            <Input
              value={signerTitle}
              onChange={(e) => setSignerTitle(e.target.value)}
              placeholder="مثال: المدير التنفيذي"
              required
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-foreground">
            <span className="flex items-center justify-between">
              <span>الرقم الوطني <span className="text-destructive">* (12 رقم إجباري)</span></span>
              {nationalId.length > 0 && (
                <span className={`text-[10px] font-mono ${nationalId.length === 12 ? "text-emerald-400 font-bold" : "text-amber-400"}`}>
                  {nationalId.length} / 12
                </span>
              )}
            </span>
            <Input
              value={nationalId}
              onChange={(e) => {
                const val = normalizeDigits(e.target.value).slice(0, 12);
                setNationalId(val);
                if (val.length === 12) {
                  setNationalIdError("");
                }
              }}
              placeholder="أدخل الرقم الوطني (12 رقم)"
              maxLength={12}
              inputMode="numeric"
              pattern="[0-9]*"
              className={nationalIdError ? "border-destructive focus-visible:ring-destructive font-mono" : "font-mono"}
              required
            />
          </label>
        </div>
        {nationalIdError && (
          <p className="text-xs text-destructive font-semibold flex items-center gap-1.5 -mt-3">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{nationalIdError}</span>
          </p>
        )}

        {/* Signature Pad */}
        {signMode === "draw" && allowDraw ? (
          <div className="w-full rounded-2xl border border-amber-500/30 bg-black/30 backdrop-blur-sm p-2.5 sm:p-4 md:p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-amber-400" />
                <span>ارسم توقيعك في المربع أدناه (باستخدام الماوس أو اللمس):</span>
              </span>
              {hasDrawn && (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-amber-400 hover:text-amber-300 hover:underline text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> مسح التوقيع
                </button>
              )}
            </div>

            <div className="w-full flex items-center justify-center p-1.5 sm:p-3 rounded-xl bg-black/40 border border-border/30">
              <div className="relative rounded-xl border-2 border-dashed border-amber-500/50 bg-black/60 overflow-hidden touch-none w-full max-w-lg p-1 sm:p-2 transition-all hover:border-amber-500/70 shadow-md">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  // The displayed box must keep the same 3:1 ratio as the
                  // bitmap. With a fixed height and a fluid width, the
                  // horizontal scale changed with the viewport while the
                  // vertical one did not, so the same signature came out
                  // stretched by a different amount on every screen.
                  className="w-full aspect-[3/1] cursor-crosshair rounded-lg block"
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
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-xs text-muted-foreground/60 gap-1.5">
                    <PenTool className="w-4 h-4 text-amber-400/60" />
                    <span>انقر واسحب هنا للرسم</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : signMode === "type" && allowType ? (
          <div className="w-full rounded-2xl border border-amber-500/30 bg-black/30 backdrop-blur-sm p-2.5 sm:p-4 md:p-5 space-y-3 shadow-inner">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>معاينة التوقيع النصي:</span>
            </div>
            <div className="w-full flex items-center justify-center p-1.5 sm:p-3 rounded-xl bg-black/40 border border-border/30">
              <div className="w-full max-w-lg p-6 rounded-xl border-2 border-dashed border-amber-500/50 bg-black/60 text-center flex flex-col items-center justify-center min-h-[140px]">
                <span className="font-serif italic text-3xl text-amber-400 tracking-wider">
                  {signerName || "توقيع المعتمد"}
                </span>
              </div>
            </div>
          </div>
        ) : allowUpload ? (
          <div className="w-full rounded-2xl border border-amber-500/30 bg-black/30 backdrop-blur-sm p-2.5 sm:p-4 md:p-5 space-y-3 shadow-inner">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>رفع صورة التوقيع:</span>
            </div>
            <div className="w-full flex items-center justify-center p-1.5 sm:p-3 rounded-xl bg-black/40 border border-border/30">
              <div className="w-full max-w-lg p-6 rounded-xl border-2 border-dashed border-amber-500/50 bg-black/60 text-center flex flex-col items-center justify-center space-y-3 min-h-[140px]">
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
            </div>
          </div>
        ) : null}

        {/* Promo Code Box */}
        {enablePromoCode && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 dir-rtl text-start">
            <label className="text-xs font-bold text-amber-400 block flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>هل لديك كود خصم؟</span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError("");
                }}
                placeholder="أدخل كود الخصم (مثال: NINU10)"
                className="text-xs uppercase font-mono bg-background"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!promoCode.trim()) return;
                  try {
                    const token = window.location.pathname.split("/").filter(Boolean).pop() || "";
                    const res = await getProposalDiscountsApi(token);
                    const match = (res.discounts || []).find((d) => d.code === promoCode.trim().toUpperCase() && d.active);
                    if (match) {
                      const label = match.discountType === "percentage" ? `${match.discountValue}%` : `$${match.discountValue}`;
                      setAppliedDiscount({ code: match.code, label });
                      setPromoError("");
                    } else {
                      setPromoError("كود الخصم غير صالح أو منتهي الصلاحية.");
                    }
                  } catch {
                    setPromoError("تعذر التحقق من كود الخصم.");
                  }
                }}
                className="text-xs font-bold shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
              >
                تطبيق الخصم
              </Button>
            </div>
            {appliedDiscount && (
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
                <span>تم تطبيق خصم {appliedDiscount.label} بنجاح</span>
                <span className="font-mono text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">{appliedDiscount.code}</span>
              </div>
            )}
            {promoError && <p className="text-[11px] text-destructive font-semibold">{promoError}</p>}
          </div>
        )}

        {/* The decision is final server-side (409 on any second attempt), so it
            has to be unmistakable before the client commits to it. */}
        <label
          htmlFor={`sig-ack-${sectionId || "document"}`}
          className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 cursor-pointer"
        >
          <input
            id={`sig-ack-${sectionId || "document"}`}
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
          />
          <span className="text-xs leading-relaxed text-amber-200/90 [&>strong]:text-amber-300">
            <FinalityNotice sectionTitle={sectionTitle} />
          </span>
        </label>

        <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
          {allowRejection ? (
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
              onClick={() => setShowRejectModal(true)}
              disabled={!acknowledged}
              title={!acknowledged ? "يرجى تأكيد قراءة التنبيه أعلاه أولاً" : undefined}
            >
              <XCircle className="w-4 h-4" /> طلب تعديل / رفض المقترح
            </Button>
          ) : <div />}

          <Button
            type="submit"
            className="w-full md:w-auto px-8 font-bold text-sm flex items-center gap-2"
            disabled={isSubmitting || !acknowledged}
            title={!acknowledged ? "يرجى تأكيد قراءة التنبيه أعلاه أولاً" : undefined}
          >
            <PenTool className="w-4 h-4" />
            {isSubmitting ? "جاري الاعتماد…" : "تأكيد واعتماد المقترح"}
          </Button>
        </div>
      </form>

      {/* Rejection Recovery & Exit-Intent Survey Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-card border border-destructive/40 shadow-2xl space-y-4 text-start dir-rtl">
            <div className="flex items-center gap-2 text-destructive font-bold text-lg border-b border-border/40 pb-3">
              <XCircle className="w-6 h-6 shrink-0" />
              <span>طلب تعديل العرض أو مناقشة الخيارات</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              يسعدنا التوصل لأفضل حل يناسب مؤسستك. ما السبب الرئيسي لطلب التعديل أو الاعتراض؟
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              {/* Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "budget", label: "الميزانية أعلى من المتوقع", desc: "طلب تقسيط الدفعات أو ضبط النطاق" },
                  { id: "technical", label: "تفاصيل فنية إضافية", desc: "طلب استفسارات أو توضيح تقني" },
                  { id: "time", label: "نحتاج وقتاً أطول", desc: "طلب تمديد فترة صلاحية العرض" },
                  { id: "other", label: "ملاحظات / رفض آخر", desc: "إرسال سبب الاعتراض النهائي" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setRejectionReason((prev) => {
                        const prefix = `[نوع الطلب: ${opt.label}] `;
                        return prev.startsWith("[نوع الطلب:") ? `${prefix}${prev.replace(/^\[نوع الطلب: [^\]]+\]\s*/, "")}` : `${prefix}${prev}`;
                      });
                    }}
                    className="p-3 rounded-xl border text-right transition-all flex flex-col justify-between hover:border-primary/60 bg-muted/20 hover:bg-muted/40"
                  >
                    <span className="text-xs font-bold text-foreground block mb-0.5">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  </button>
                ))}
              </div>

              <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                <span>توضيح التفاصيل أو ملاحظاتك لمسؤول المشروع:</span>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب ملاحظاتك، تفضيلات التقسيط، أو الاستفسارات المطلوب مناقشتها..."
                  rows={3}
                  className="text-xs bg-background"
                  required
                />
              </label>

              <p className="p-3 rounded-xl border border-border/40 bg-muted/30 text-xs leading-relaxed text-muted-foreground">
                <strong className="block mb-0.5 text-foreground">💡 ملاحظة:</strong>
                سيتم إشعار مدير المشروع بملاحظاتك مباشرة لمراجعتها.
              </p>

              {/* Same wording as the approve checkbox — the reject decision is
                  equally final server-side (409 on retry), and this modal is
                  reachable without ticking that checkbox, so it must repeat
                  the warning rather than assume the client already saw it. */}
              <p className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs leading-relaxed text-amber-200 [&>strong]:text-amber-300">
                <FinalityNotice sectionTitle={sectionTitle} />
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit" variant="destructive" size="sm" disabled={isSubmitting || !acknowledged}>
                  {isSubmitting ? "جارٍ الإرسال..." : "إرسال الملاحظات والطلب"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
