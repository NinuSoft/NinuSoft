import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  FileText,
  Layers,
  Printer,
  Shield,
  Sparkles,
  Target,
  XCircle,
} from "@/components/Icons";

interface ProposalExecutiveSummaryProps {
  proposalTitle: string;
  clientName: string;
  content: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

function cleanMarkdown(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ProposalExecutiveSummary({
  proposalTitle,
  clientName,
  content,
  token,
  isOpen,
  onClose,
}: ProposalExecutiveSummaryProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const lines = content.split("\n").map((line) => line.trim());
  const headings = lines
    .filter((line) => /^#{1,3}\s+/.test(line))
    .map((line) => cleanMarkdown(line.replace(/^#{1,3}\s+/, "")))
    .filter(Boolean)
    .slice(0, 8);
  const bullets = Array.from(
    new Set(
      lines
        .filter((line) => /^[-*]\s+/.test(line))
        .map((line) => cleanMarkdown(line.replace(/^[-*]\s+/, "")))
        .filter(Boolean),
    ),
  ).slice(0, 6);
  const overview =
    content
      .split(/\n\s*\n/)
      .map(cleanMarkdown)
      .find(
        (paragraph) =>
          paragraph.length > 45 &&
          !paragraph.startsWith("section:") &&
          !paragraph.includes("```"),
      ) ||
    `يوضح هذا العرض نطاق العمل المقترح لصالح ${clientName}، والمخرجات الرئيسية وآلية التنفيذ المتفق عليها.`;
  const deliverables =
    bullets.length > 0
      ? bullets
      : ["حل متكامل قابل للتوسع", "تنفيذ بمعايير جودة وأمان عالية", "دعم واضح خلال مراحل التسليم"];
  const documentSections =
    headings.length > 0 ? headings : ["نطاق العمل", "المخرجات", "خطة التنفيذ"];
  const formattedDate = new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return createPortal(
    <div
      className="executive-summary-overlay"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="executive-summary-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="executive-summary-dialog">
        <header className="executive-summary-toolbar">
          <div className="executive-summary-toolbar-title">
            <span className="executive-summary-toolbar-icon">
              <FileText aria-hidden="true" />
            </span>
            <div>
              <span>Executive Summary</span>
              <strong id="executive-summary-title">الملخص التنفيذي</strong>
            </div>
          </div>

          <div className="executive-summary-actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="executive-summary-print"
            >
              <Printer aria-hidden="true" />
              <span>طباعة</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="إغلاق الملخص التنفيذي"
              className="executive-summary-close"
            >
              <XCircle aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div className="executive-summary-scroll">
          <article className="executive-summary-sheet">
            <section className="executive-summary-hero">
              <div className="executive-summary-brand">
                <img src="/logo.png" alt="" />
                <div>
                  <strong>NinuSoft</strong>
                  <span>Digital Solutions</span>
                </div>
              </div>

              <span className="executive-summary-status">
                <Shield aria-hidden="true" />
                وثيقة عرض رسمية
              </span>

              <div className="executive-summary-heading">
                <span>نظرة تنفيذية موجزة</span>
                <h2>{proposalTitle}</h2>
                <p>أُعد هذا الملخص لتقديم صورة سريعة وواضحة عن العرض قبل مراجعة التفاصيل الكاملة.</p>
              </div>

              <div className="executive-summary-meta">
                <div>
                  <span>مُعد لصالح</span>
                  <strong>{clientName}</strong>
                </div>
                <div>
                  <span>تاريخ الإصدار</span>
                  <strong>{formattedDate}</strong>
                </div>
                <div>
                  <span>مرجع العرض</span>
                  <strong dir="ltr">{token}</strong>
                </div>
              </div>
            </section>

            <section className="executive-summary-overview">
              <div className="executive-summary-section-title">
                <span><Sparkles aria-hidden="true" /></span>
                <div>
                  <small>THE OPPORTUNITY</small>
                  <h3>ملخص العرض</h3>
                </div>
              </div>
              <p>{overview.slice(0, 650)}</p>
            </section>

            <section className="executive-summary-grid">
              <div className="executive-summary-panel">
                <div className="executive-summary-section-title">
                  <span><Target aria-hidden="true" /></span>
                  <div>
                    <small>KEY DELIVERABLES</small>
                    <h3>المخرجات الرئيسية</h3>
                  </div>
                </div>

                <div className="executive-summary-deliverables">
                  {deliverables.map((deliverable, index) => (
                    <div key={`${deliverable}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <p>{deliverable}</p>
                      <CheckCircle aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="executive-summary-panel executive-summary-structure">
                <div className="executive-summary-section-title">
                  <span><Layers aria-hidden="true" /></span>
                  <div>
                    <small>DOCUMENT MAP</small>
                    <h3>محتويات الوثيقة</h3>
                  </div>
                </div>

                <ol>
                  {documentSections.map((heading, index) => (
                    <li key={`${heading}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <p>{heading}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <footer className="executive-summary-footer">
              <div>
                <Shield aria-hidden="true" />
                <span>معلومات خاصة ومحمية</span>
              </div>
              <p>© NinuSoft — جميع الحقوق محفوظة</p>
            </footer>
          </article>
        </div>
      </div>
    </div>,
    document.body,
  );
}