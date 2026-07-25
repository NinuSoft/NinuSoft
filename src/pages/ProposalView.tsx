import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { proposalMarkdownComponents, remarkAlerts, slugify } from "@/components/ProposalMarkdown";
import { useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ApiError,
  getProposal,
  type Proposal,
  recordProposalEvent,
  unlockProposal,
} from "@/lib/proposals-api";
import { parseProposalSections } from "@/lib/proposal-sections";
import { ProposalSignature } from "@/components/ProposalSignature";
import { defaultProposalSettings, type ProposalSettings } from "@/lib/proposal-settings";
import { useProposalComments } from "@/hooks/use-proposal-comments";
import { useProposalSignatures } from "@/hooks/use-proposal-signatures";
import { useToast } from "@/hooks/use-toast";
import { ProposalAiAssistant } from "@/components/ProposalAiAssistant";
import { ProposalExecutiveSummary } from "@/components/ProposalExecutiveSummary";
import { ProposalExpiryCountdown } from "@/components/ProposalExpiryCountdown";
import { ProposalAttachments } from "@/components/ProposalAttachments";
import { ProposalIncentiveBanner } from "@/components/ProposalIncentiveBanner";
import { ProposalPackageSwitcher } from "@/components/ProposalPackageSwitcher";
import { ProposalComments } from "@/components/ProposalComments";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Printer, Download, FileText, Globe, Layers, MessageSquare, XCircle, CheckCircle, Edit, Sparkles, Shield, Lock } from "@/components/Icons";

function Brand() {
  return (
    <a className="proposal-brand" href="/" aria-label="العودة إلى NinuSoft">
      <img src="/logo.png" alt="" />
      <span>NinuSoft</span>
    </a>
  );
}

function CenteredState({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="proposal-state" dir="rtl">
      <Brand />
      <section className="proposal-state-card">
        <span className="proposal-state-icon" aria-hidden="true">{icon}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </section>
      <p className="proposal-security-note">مشاركة خاصة ومشفّرة عبر NinuSoft</p>
    </main>
  );
}

function toEnglishDigits(val: string | number): string {
  return String(val).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

function waitForDelay(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

async function waitForPrintableAssets() {
  await Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    waitForDelay(4_000),
  ]);

  const printableImages = Array.from(
    document.querySelectorAll<HTMLImageElement>(".proposal-page img"),
  );
  await Promise.allSettled(
    printableImages.map(async (image) => {
      await Promise.race([
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
        waitForDelay(4_000),
      ]);

      if (image.decode && image.naturalWidth > 0) {
        await Promise.race([
          image.decode().catch(() => undefined),
          waitForDelay(2_000),
        ]);
      }
    }),
  );

  const startedAt = performance.now();
  while (
    document.querySelector(".proposal-page .mermaid-loading") &&
    performance.now() - startedAt < 7_000
  ) {
    await waitForDelay(100);
  }

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

export default function ProposalView() {
  const { token = "" } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [status, setStatus] = useState<"loading" | "locked" | "ready" | "expired" | "missing" | "error">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const readRecorded = useRef(false);
  const accessStorageKey = `ninusoft-proposal-access:${token}`;
  const accessToken = useRef(sessionStorage.getItem(accessStorageKey) || "");

  // Server settings arrive with the proposal; until then the page renders a
  // loading state, so these defaults are never shown to a client.
  const [settings, setSettings] = useState<ProposalSettings>(defaultProposalSettings);
  const readingProgressRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [showMobileNav, setShowMobileNav] = useState(false);

  const [selectedText, setSelectedText] = useState("");
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlightCommentText, setHighlightCommentText] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showExecSummary, setShowExecSummary] = useState(false);
  const [printStatus, setPrintStatus] = useState<"print" | "pdf" | null>(null);
  const [submittingHighlight, setSubmittingHighlight] = useState(false);
  /** Timestamp until which a collapsed selection must not dismiss the popover. */
  const suppressSelectionClear = useRef(0);
  const { toast } = useToast();

  const sessionId = useMemo(() => {
    const key = `ninusoft-proposal-session:${token}`;
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
    return value;
  }, [token]);

  // One owner for the comment list — both the comment box and the selection
  // popover submit through this, so neither can overwrite the other.
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    submit: submitComment,
    edit: editComment,
    remove: removeComment,
    toggleResolve: toggleResolveComment,
    reload: reloadComments,
  } = useProposalComments(
    status === "ready" ? proposal?.token : undefined,
    sessionId,
    accessToken.current,
  );

  // Signatures are per-section: signing one section must leave the rest open.
  const {
    loading: signaturesLoading,
    getForSection,
    submit: submitSignature,
  } = useProposalSignatures(
    status === "ready" ? proposal?.token : undefined,
    sessionId,
    accessToken.current,
  );

  useEffect(() => {
    let debounce = 0;
    let frame = 0;

    const POPOVER_H = 48;

    /** Viewport coordinates for the popover, given the live selection rect. */
    const positionFor = (rect: DOMRect) => {
      // Touch devices draw their own Copy/Look-Up callout directly above the
      // selection, so prefer below it there; above is fine with a mouse.
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const below = rect.bottom + 12;
      const above = rect.top - POPOVER_H;
      const fitsBelow = below + POPOVER_H <= window.innerHeight - 12;
      const fitsAbove = above >= 12;

      // Fall back to the other side rather than letting the clamp drop the
      // button on top of the text the client just selected.
      let top: number;
      if (coarse) top = fitsBelow ? below : fitsAbove ? above : below;
      else top = fitsAbove ? above : fitsBelow ? below : above;

      return {
        top: Math.max(12, Math.min(top, window.innerHeight - POPOVER_H - 12)),
        left: Math.max(
          12,
          Math.min(window.innerWidth - 170, rect.left + rect.width / 2 - 75),
        ),
      };
    };

    const readSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return null;
      const text = selection.toString().trim();
      if (text.length <= 2) return null;
      try {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        return { text, rect };
      } catch {
        return null;
      }
    };

    // `selectionchange` is the only selection signal touch devices emit —
    // long-pressing to select text fires no mouse events at all. It also
    // covers the mouse, so desktop and touch share one path. Debounced because
    // it fires continuously while the selection is being dragged.
    const handleSelectionChange = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        if (showHighlightModal) return;
        const current = readSelection();
        if (current) {
          setSelectedText(current.text);
          setSelectionPos(positionFor(current.rect));
          return;
        }
        // A tap on the popover itself can collapse the selection before the
        // click registers; ignore the clear for a moment so the tap lands.
        if (suppressSelectionClear.current > Date.now()) return;
        setSelectionPos(null);
        setSelectedText("");
      }, 250);
    };

    // Follow the text rather than hiding: momentum and rubber-band scrolling on
    // mobile fire constantly, and clearing on any scroll made the popover
    // vanish the instant it appeared.
    const handleScroll = () => {
      if (showHighlightModal) return;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const current = readSelection();
        if (current) setSelectionPos(positionFor(current.rect));
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.clearTimeout(debounce);
      if (frame) window.cancelAnimationFrame(frame);
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [showHighlightModal]);

  const submitHighlightComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightCommentText.trim() || !selectedText || !proposal) return;
    if (submittingHighlight) return;

    setSubmittingHighlight(true);
    try {
      await submitComment({
        text: highlightCommentText.trim(),
        author: proposal.clientName || "العميل",
        selectedText,
      });
    } catch (err) {
      // Keep the modal open with the text intact so the client can retry.
      toast({
        variant: "destructive",
        title: "تعذر إرسال التعليق",
        description:
          err instanceof Error ? err.message : "حدث خطأ غير متوقع. حاول مجدداً.",
      });
      return;
    } finally {
      setSubmittingHighlight(false);
    }

    setShowHighlightModal(false);
    setSelectionPos(null);
    setSelectedText("");
    setHighlightCommentText("");

    const el = document.getElementById("proposal-comments");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!settings.enableReadingTime) return;

    let animationFrame = 0;

    const updateProgress = () => {
      animationFrame = 0;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0
        ? Math.min(1, Math.max(0, window.scrollY / totalHeight))
        : 0;

      readingProgressRef.current?.style.setProperty(
        "transform",
        `scaleX(${progress})`,
      );
    };

    const scheduleProgressUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
    window.addEventListener("resize", scheduleProgressUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleProgressUpdate);
      window.removeEventListener("resize", scheduleProgressUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [settings.enableReadingTime]);

  const readTimeMinutes = useMemo(() => {
    if (!proposal?.markdown) return 1;
    const words = proposal.markdown.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180));
  }, [proposal?.markdown]);

  const sections = useMemo(
    () => parseProposalSections(proposal?.markdown || ""),
    [proposal?.markdown],
  );
  const [activeSectionId, setActiveSectionId] = useState<string>("sec-all");
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);
  const sectionStorageKey = `ninusoft-proposal-sec:${token}`;

  useEffect(() => {
    if (sections.length === 0) return;

    const resolveSectionFromHash = (hash: string) => {
      if (!hash) return null;
      if (hash === "sec-all" || sections.some((s) => s.id === hash)) {
        return hash;
      }
      const matched = sections.find(
        (s) =>
          s.title.trim().toLowerCase() === hash.toLowerCase() ||
          slugify(s.title) === hash.toLowerCase(),
      );
      return matched ? matched.id : null;
    };

    const rawHash = window.location.hash.replace("#", "").trim();
    const savedSec = localStorage.getItem(sectionStorageKey);
    const resolvedFromHash = resolveSectionFromHash(rawHash);
    const resolvedFromSaved = resolveSectionFromHash(savedSec || "");

    const candidate = resolvedFromHash || resolvedFromSaved;

    if (candidate) {
      setActiveSectionId(candidate);
    } else if (sections.length > 1) {
      setActiveSectionId(sections[0].id);
    } else {
      setActiveSectionId("sec-all");
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "").trim();
      const newCandidate = resolveSectionFromHash(newHash);
      if (newCandidate) {
        setActiveSectionId(newCandidate);
        localStorage.setItem(sectionStorageKey, newCandidate);
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [sections, token, sectionStorageKey]);

  const handleSelectSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    try {
      localStorage.setItem(sectionStorageKey, sectionId);
      if (window.history.replaceState) {
        window.history.replaceState(null, "", `#${sectionId}`);
      } else {
        window.location.hash = sectionId;
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (activeSectionId !== "sec-all" || sections.length === 0) {
      setVisibleSectionId(null);
      return;
    }

    const sectionElements = sections
      .map((section) =>
        document.querySelector<HTMLElement>(
          `[data-proposal-section-id="${section.id}"]`,
        ),
      )
      .filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0) return;

    let animationFrame = 0;
    let currentVisibleId: string | null = null;

    const updateVisibleSection = () => {
      animationFrame = 0;
      const readingLine = 140;
      let currentSection = sectionElements[0];

      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      ) {
        currentSection = sectionElements[sectionElements.length - 1];
      } else {
        for (const element of sectionElements) {
          if (element.getBoundingClientRect().top <= readingLine) {
            currentSection = element;
          } else {
            break;
          }
        }
      }

      const nextId = currentSection.dataset.proposalSectionId || null;
      if (currentVisibleId !== nextId) {
        currentVisibleId = nextId;
        setVisibleSectionId(nextId);
      }
    };

    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateVisibleSection);
      }
    };

    updateVisibleSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [activeSectionId, sections]);

  // Deterrence, not protection: hiding the buttons left Cmd+P and the browser
  // menu wide open. Screenshots and devtools still defeat this — the watermark
  // setting is the real control.
  useEffect(() => {
    if (settings.enablePrint || settings.enablePdfExport) return;

    const root = document.documentElement;
    const block = () => {
      if (!root.dataset.printMode) root.dataset.printBlocked = "true";
    };
    const unblock = () => {
      delete root.dataset.printBlocked;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeprint", block);
    window.addEventListener("afterprint", unblock);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("beforeprint", block);
      window.removeEventListener("afterprint", unblock);
      window.removeEventListener("keydown", onKeyDown, true);
      unblock();
    };
  }, [settings.enablePrint, settings.enablePdfExport]);

  const load = async () => {
    setStatus("loading");
    try {
      const result = await getProposal(token, sessionId, accessToken.current);
      if (result.locked) {
        accessToken.current = "";
        sessionStorage.removeItem(accessStorageKey);
        setStatus("locked");
      } else {
        setProposal(result.proposal);
        document.title = `${result.proposal.title} | NinuSoft`;
        setStatus("ready");

        // Settings ship with the proposal. They are deliberately not cached in
        // localStorage: the viewer must reflect what the admin saved on the
        // server, not whatever this browser last saw.
        if (result.settings) {
          setSettings({ ...defaultProposalSettings, ...result.settings });
        }
      }
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        if (requestError.status === 410) setStatus("expired");
        else if (requestError.status === 404) setStatus("missing");
        else setStatus("error");
      } else {
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    void load();
    return () => {
      document.title = "NinuSoft";
    };
    // token identifies the complete load lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (status !== "ready" || readRecorded.current) return;
    const timer = window.setTimeout(() => {
      readRecorded.current = true;
      void recordProposalEvent(
        token,
        "read",
        sessionId,
        accessToken.current,
      ).catch(() => undefined);
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [sessionId, status, token]);

  const unlock = async (event: SyntheticEvent) => {
    event.preventDefault();
    setError("");
    setUnlocking(true);
    try {
      const result = await unlockProposal(token, password);
      accessToken.current = result.accessToken;
      sessionStorage.setItem(accessStorageKey, result.accessToken);
      setPassword("");
      await load();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 429) {
        setError("محاولات كثيرة. يرجى الانتظار قليلاً ثم المحاولة مجدداً.");
      } else {
        setError("كلمة السر غير صحيحة. تحقق منها وحاول مجدداً.");
      }
    } finally {
      setUnlocking(false);
    }
  };

  const print = async (type: "print" | "pdf") => {
    if (printStatus) return;
    setPrintStatus(type);

    void recordProposalEvent(
      token,
      type,
      sessionId,
      accessToken.current,
    ).catch(() => undefined);

    const previousSectionId = activeSectionId;
    const previousTitle = document.title;
    const root = document.documentElement;
    let cleanedUp = false;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      delete root.dataset.printMode;
      document.title = previousTitle;
      if (previousSectionId !== "sec-all") setActiveSectionId(previousSectionId);
      setPrintStatus(null);
      window.removeEventListener("afterprint", cleanup);
    };

    root.dataset.printMode = type;
    document.title =
      type === "pdf"
        ? `${proposal?.title || "Proposal"} - ${proposal?.clientName || "Client"} - NinuSoft`
        : previousTitle;

    if (activeSectionId !== "sec-all") {
      setActiveSectionId("sec-all");
    }

    try {
      await waitForPrintableAssets();
      window.addEventListener("afterprint", cleanup, { once: true });
      window.print();
      window.setTimeout(cleanup, 60_000);
    } catch {
      cleanup();
    }
  };

  if (status === "loading") {
    return (
      <CenteredState icon="…" title="جاري تجهيز العرض" description="لحظات ونفتح لك الوثيقة بأمان." />
    );
  }

  if (status === "locked") {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4 py-8" dir="rtl">
        <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border/60 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">وثيقة العرض محمية</h1>
            <p className="text-sm text-muted-foreground mt-2">
              يرجى إدخال رمز PIN أو كلمة السر الخاصة بكم للاطلاع على تفاصيل العرض الفني والمالي.
            </p>
          </div>
          <form className="space-y-4 text-right" onSubmit={unlock}>
            <div>
              <label htmlFor="proposal-password" className="text-xs font-bold text-foreground block mb-1.5">
                رمز PIN / كلمة المرور
              </label>
              <Input
                id="proposal-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="أدخل رمز PIN أو كلمة السر الخاصة بك"
                autoComplete="current-password"
                autoFocus
                required
                className="text-center font-mono text-base h-11"
              />
            </div>
            {error && <p className="text-xs font-bold text-destructive" role="alert">{error}</p>}
            <Button type="submit" disabled={unlocking} className="w-full h-11 font-bold">
              {unlocking ? "جاري التحقق…" : "فتح العرض"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return <CenteredState icon="!" title="انتهت صلاحية الرابط" description="تواصل مع فريق NinuSoft للحصول على رابط محدّث لهذا العرض." />;
  }

  if (status === "missing") {
    return <CenteredState icon="404" title="العرض غير موجود" description="تأكد من نسخ الرابط كاملاً، أو اطلب رابطاً جديداً من فريق NinuSoft." />;
  }

  if (status === "error" || !proposal) {
    return (
      <CenteredState icon="!" title="تعذر فتح العرض" description="حدث عطل مؤقت في الاتصال. أعد المحاولة بعد قليل.">
        <Button type="button" onClick={() => void load()}>إعادة المحاولة</Button>
      </CenteredState>
    );
  }

  const proposalIssueDate = new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    dateStyle: "long",
  }).format(new Date(proposal.updatedAt));
  const proposalReference = `NS-${proposal.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;
  const proposalValidity = proposal.expiresAt
    ? new Intl.DateTimeFormat("ar-IQ-u-nu-latn", { dateStyle: "long" }).format(
        new Date(proposal.expiresAt),
      )
    : "حسب الشروط الواردة في العرض";

  return (
    <div className="proposal-page" dir={lang === "ar" ? "rtl" : "ltr"}>
      <section className="proposal-print-cover" aria-hidden="true">
        <div className="proposal-print-cover-brand">
          <img src="/logo.png" alt="" />
          <div>
            <strong>NinuSoft</strong>
            <span>Digital Solutions</span>
          </div>
        </div>

        <div className="proposal-print-cover-content">
          <span>PROPOSAL DOCUMENT</span>
          <h1>{proposal.title}</h1>
          <p>عرض مُعد خصيصاً لصالح</p>
          <strong>{proposal.clientName}</strong>
        </div>

        <div className="proposal-print-cover-meta">
          <div>
            <span>تاريخ الإصدار</span>
            <strong>{proposalIssueDate}</strong>
          </div>
          <div>
            <span>مرجع العرض</span>
            <strong dir="ltr">{proposalReference}</strong>
          </div>
        </div>
      </section>

      <div className="proposal-print-running-footer" aria-hidden="true">
        <span>NinuSoft · وثيقة عرض خاصة</span>
        <span>{proposal.title}</span>
      </div>

      <section className="proposal-print-overview" aria-hidden="true">
        <div className="proposal-print-overview-heading">
          <span>DOCUMENT OVERVIEW</span>
          <h2>بيانات العرض ومحتوياته</h2>
          <p>نسخة مخصصة للمراجعة واتخاذ القرار، أعدتها NinuSoft لصالح {proposal.clientName}.</p>
        </div>

        <div className="proposal-print-overview-meta">
          <div>
            <span>العميل</span>
            <strong>{proposal.clientName}</strong>
          </div>
          <div>
            <span>تاريخ الإصدار</span>
            <strong>{proposalIssueDate}</strong>
          </div>
          <div>
            <span>صالح حتى</span>
            <strong>{proposalValidity}</strong>
          </div>
          <div>
            <span>مرجع الوثيقة</span>
            <strong dir="ltr">{proposalReference}</strong>
          </div>
        </div>

        <div className="proposal-print-contents">
          <h3>محتويات الوثيقة</h3>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{section.title}</strong>
              </li>
            ))}
          </ol>
        </div>

        <div className="proposal-print-confidentiality">
          <Shield className="w-4 h-4" />
          <p>هذه الوثيقة خاصة وسرية، ومخصصة للجهة المذكورة أعلاه فقط.</p>
        </div>
      </section>

      <header className="proposal-print-document-header" aria-hidden="true">
        <div className="proposal-print-document-brand">
          <img src="/logo.png" alt="" />
          <div>
            <strong>NinuSoft</strong>
            <span>PROPOSAL</span>
          </div>
        </div>
        <div className="proposal-print-document-info">
          <strong>{proposal.title}</strong>
          <span>{proposal.clientName} · {proposalIssueDate} · {proposalReference}</span>
        </div>
      </header>

      {settings.enableReadingTime && (
        <div
          ref={readingProgressRef}
          className="proposal-reading-progress-bar"
        />
      )}
      <header className="proposal-toolbar">
        <Brand />
        <div className="proposal-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang((prev) => (prev === "ar" ? "en" : "ar"))}
            className="proposal-action-language text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="proposal-action-label">{lang === "ar" ? "English" : "العربية"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExecSummary(true)}
            className="proposal-action-summary text-xs font-bold flex items-center gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="proposal-action-label">الملخص التنفيذي</span>
          </Button>

          {settings.enableReadingTime && (
            <span className="proposal-reading-badge flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{toEnglishDigits(readTimeMinutes)} {lang === "ar" ? "د قراءة" : "min read"}</span>
            </span>
          )}
          {settings.enablePrint && (
            <Button
              variant="outline"
              disabled={Boolean(printStatus)}
              onClick={() => void print("print")}
              className="proposal-action-print flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="proposal-action-label">
                {printStatus === "print"
                  ? (lang === "ar" ? "جاري التجهيز…" : "Preparing…")
                  : (lang === "ar" ? "طباعة" : "Print")}
              </span>
            </Button>
          )}
          {settings.enablePdfExport && (
            <Button
              disabled={Boolean(printStatus)}
              onClick={() => void print("pdf")}
              className="proposal-action-pdf flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="proposal-action-label">
                {printStatus === "pdf"
                  ? (lang === "ar" ? "جاري تجهيز PDF…" : "Preparing PDF…")
                  : (lang === "ar" ? "حفظ PDF" : "Save PDF")}
              </span>
            </Button>
          )}
        </div>
      </header>

      <main className="proposal-shell">
        {settings.enableExpiryCountdown && (
          <ProposalExpiryCountdown />
        )}

        <ProposalIncentiveBanner
          content={proposal.markdown}
          clientName={proposal.clientName}
          proposalToken={proposal.token}
          accessToken={accessToken.current}
          expiresAt={proposal.expiresAt}
          onScrollToSign={() => {
            const sigEl = document.getElementById("proposal-signature-section");
            if (sigEl) sigEl.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <div className="proposal-meta">
          <div>
            <span>عرض خاص إلى</span>
            <strong>{proposal.clientName}</strong>
          </div>
          <div className="proposal-meta-date">
            <span>آخر تحديث</span>
            <strong>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(proposal.updatedAt))}</strong>
          </div>
        </div>

        <div
          className={`proposal-layout-grid ${
            settings.enableSidebarNav && sections.length > 0 ? "has-sidebar" : ""
          }`}
        >
          {/* Right Panel Sidebar Navigation */}
          {settings.enableSidebarNav && sections.length > 0 && (
            <aside className="proposal-sidebar">
              <div className="proposal-sidebar-card">
                <div className="proposal-sidebar-header">
                  <h3>أقسام الوثيقة</h3>
                  <span className="proposal-section-count">{toEnglishDigits(sections.length)} أقسام</span>
                </div>

                <nav className="proposal-sidebar-nav" aria-label="أقسام العرض">
                  <button
                    type="button"
                    className={`proposal-sidebar-item ${activeSectionId === "sec-all" ? "is-active" : ""}`}
                    onClick={() => {
                      handleSelectSection("sec-all");
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                  >
                    <span className="proposal-sidebar-icon flex items-center justify-center">
                      <Layers className="w-4 h-4 text-amber-400" />
                    </span>
                    <div className="proposal-sidebar-info">
                      <strong>عرض كافة الأقسام</strong>
                      <small>الوثيقة الكاملة</small>
                    </div>
                  </button>

                  <div className="proposal-sidebar-divider" />

                  {sections.map((sec, idx) => (
                    <button
                      key={sec.id}
                      type="button"
                      className={`proposal-sidebar-item ${
                        activeSectionId === sec.id ? "is-active" : ""
                      } ${
                        activeSectionId === "sec-all" && visibleSectionId === sec.id
                          ? "is-in-view"
                          : ""
                      }`}
                      onClick={() => {
                        handleSelectSection(sec.id);
                        window.scrollTo({ top: 120, behavior: "smooth" });
                      }}
                    >
                      <span className="proposal-sidebar-num">{toEnglishDigits(idx + 1)}</span>
                      <div className="proposal-sidebar-info">
                        <strong>{sec.title}</strong>
                      </div>
                    </button>
                  ))}
                </nav>

                {settings.enablePdfExport && (
                  <div className="proposal-sidebar-footer">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={Boolean(printStatus)}
                      className="w-full flex items-center justify-center gap-1.5 font-bold"
                      onClick={() => void print("pdf")}
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>{printStatus === "pdf" ? "جاري تجهيز PDF…" : "حفظ الوثيقة PDF"}</span>
                    </Button>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <div className="proposal-content-area">
            <article className="proposal-document">
              {/* Active Section Header if single section mode */}
              {sections.length > 1 && activeSectionId !== "sec-all" && (() => {
                const activeIdx = sections.findIndex((s) => s.id === activeSectionId);
                const activeSec = sections[activeIdx];
                return (
                  <div className="proposal-active-section-header">
                    <span className="proposal-section-badge">القسم {toEnglishDigits(activeIdx + 1)} من {toEnglishDigits(sections.length)}</span>
                    <h2>{activeSec?.title}</h2>
                  </div>
                );
              })()}

              {(() => {
                const hasAnySectionSignature = sections.some((s) => s.hasSignature);
                return (
                  <>
                    {activeSectionId === "sec-all" ? (
                      <div className="proposal-all-sections">
                        {sections.map((sec, idx) => (
                          <section
                            key={sec.id}
                            id={sec.id}
                            data-proposal-section-id={sec.id}
                            className="proposal-section-block"
                          >
                            <header className="proposal-print-section-heading">
                              <span>SECTION {String(idx + 1).padStart(2, "0")}</span>
                              <h2>{sec.title}</h2>
                            </header>
                            {sections.length > 1 && idx > 0 && <hr className="my-8" />}
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlerts]} components={proposalMarkdownComponents}>
                              {sec.content}
                            </ReactMarkdown>

                            {settings.enableDigitalSignature && sec.hasSignature && (
                              <div className="mt-8">
                                <ProposalSignature
                                  clientName={proposal.clientName}
                                  sectionId={sec.stableId}
                                  sectionTitle={sec.title}
                                  signature={getForSection(sec.stableId)}
                                  loading={signaturesLoading}
                                  onSubmit={submitSignature}
                                  allowDraw={settings.allowDrawSignature}
                                  allowType={settings.allowTypeSignature}
                                  allowUpload={settings.allowUploadSignature}
                                  allowRejection={settings.allowRejection}
                                />
                              </div>
                            )}
                          </section>
                        ))}
                      </div>
                    ) : (
                      <div className="proposal-single-section">
                        {(() => {
                          const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
                          const activeIdx = sections.findIndex((s) => s.id === activeSectionId);
                          const prevSection = activeIdx > 0 ? sections[activeIdx - 1] : null;
                          const nextSection = activeIdx >= 0 && activeIdx < sections.length - 1 ? sections[activeIdx + 1] : null;

                          return (
                            <>
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlerts]} components={proposalMarkdownComponents}>
                                {activeSection.content}
                              </ReactMarkdown>

                              {settings.enableDigitalSignature && activeSection.hasSignature && (
                                <div className="mt-8">
                                  <ProposalSignature
                                    clientName={proposal.clientName}
                                    sectionId={activeSection.stableId}
                                    sectionTitle={activeSection.title}
                                    signature={getForSection(activeSection.stableId)}
                                    loading={signaturesLoading}
                                    onSubmit={submitSignature}
                                    allowDraw={settings.allowDrawSignature}
                                    allowType={settings.allowTypeSignature}
                                    allowUpload={settings.allowUploadSignature}
                                    allowRejection={settings.allowRejection}
                                  />
                                </div>
                              )}

                              {sections.length > 1 && (
                                <div className="proposal-section-pager">
                                  {prevSection ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        handleSelectSection(prevSection.id);
                                        window.scrollTo({ top: 120, behavior: "smooth" });
                                      }}
                                    >
                                      → القسم السابق: {prevSection.title}
                                    </Button>
                                  ) : <div />}

                                  {nextSection ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        handleSelectSection(nextSection.id);
                                        window.scrollTo({ top: 120, behavior: "smooth" });
                                      }}
                                    >
                                      القسم التالي: {nextSection.title} ←
                                    </Button>
                                  ) : <div />}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {settings.enableDigitalSignature && !hasAnySectionSignature && (
                      <ProposalSignature
                        clientName={proposal.clientName}
                        signature={getForSection(undefined)}
                        loading={signaturesLoading}
                        onSubmit={submitSignature}
                        allowDraw={settings.allowDrawSignature}
                        allowType={settings.allowTypeSignature}
                        allowUpload={settings.allowUploadSignature}
                        allowRejection={settings.allowRejection}
                      />
                    )}
                  </>
                );
              })()}

              {settings.enableInlineComments && (
                <ProposalComments
                  comments={comments}
                  loading={commentsLoading}
                  error={commentsError}
                  onSubmit={submitComment}
                  onEdit={editComment}
                  onDelete={removeComment}
                  onRetry={reloadComments}
                  clientName={proposal.clientName}
                />
              )}
            </article>
          </div>
        </div>

        <footer className="proposal-footer">
          <Brand />
          <p>هذه الوثيقة خاصة ومعدّة للقراءة فقط.</p>
        </footer>
      </main>

      {/* NinuSoft AI launcher */}
      <div className="proposal-ai-launcher fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="group relative flex h-12 items-center gap-2.5 overflow-hidden rounded-2xl border border-amber-300/25 bg-[#11141b]/95 px-3 text-white shadow-[0_16px_45px_rgba(0,0,0,.45),0_0_24px_rgba(245,185,55,.10)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/45 hover:bg-[#161922] active:translate-y-0 sm:h-14 sm:px-3.5"
          aria-label="فتح NinuSoft AI"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-300 text-[#17130a] shadow-[0_0_20px_rgba(252,211,77,.16)] sm:h-9 sm:w-9">
            <Sparkles className="h-4 w-4 stroke-[2.4]" />
          </span>
          <span className="hidden min-w-0 pr-0.5 text-right sm:grid">
            <span className="text-[9px] font-semibold leading-none text-white/35">تحتاج مساعدة؟</span>
            <span className="mt-1 text-xs font-extrabold leading-none text-white/90">اسأل NinuSoft AI</span>
          </span>
          <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-[#11141b]" />
        </button>
      </div>

      {/* Mobile Floating Drawer Button */}
      {sections.length > 1 && (
        <div className="proposal-mobile-sections-launcher fixed bottom-6 left-6 z-40 lg:hidden">
          <Button
            type="button"
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="shadow-2xl font-bold text-xs rounded-full px-5 py-3 flex items-center gap-2 bg-primary text-primary-foreground border border-amber-500/40"
          >
            <FileText className="w-4 h-4" />
            <span>{lang === "ar" ? "أقسام الوثيقة" : "Sections"} ({toEnglishDigits(sections.length)})</span>
          </Button>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden flex flex-col justify-end p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-3 max-h-[80vh] overflow-y-auto text-start dir-rtl shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{lang === "ar" ? "اختر القسم للتنقل" : "Select Section"}</span>
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowMobileNav(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeSectionId === "sec-all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  handleSelectSection("sec-all");
                  setShowMobileNav(false);
                }}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "عرض جميع الأقسام معاً" : "View All Sections"}</span>
              </button>

              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeSectionId === sec.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    handleSelectSection(sec.id);
                    setShowMobileNav(false);
                  }}
                >
                  <span className="w-5 h-5 rounded-full bg-muted/80 flex items-center justify-center text-[10px] font-mono">
                    {toEnglishDigits(idx + 1)}
                  </span>
                  <span className="truncate">{sec.title}</span>
                  {activeSectionId === "sec-all" && visibleSectionId === sec.id && (
                    <span
                      className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                      aria-label={lang === "ar" ? "القسم الحالي" : "Current section"}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Selection Popover Button */}
      {selectionPos && selectedText && !showHighlightModal && (
        <div
          // z-[60] clears the AI launcher (z-50) and the mobile sections
          // launcher (z-40), both of which are fixed near the viewport edges.
          className="fixed z-[60] animate-in fade-in zoom-in duration-150"
          style={{ top: `${selectionPos.top}px`, left: `${selectionPos.left}px` }}
          // pointerdown covers mouse and touch, and unlike touchstart React does
          // not attach it passively, so preventDefault actually holds the
          // selection open while the button is pressed.
          onPointerDown={(e) => {
            suppressSelectionClear.current = Date.now() + 600;
            e.preventDefault();
          }}
        >
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              suppressSelectionClear.current = 0;
              setShowHighlightModal(true);
            }}
            className="shadow-2xl font-bold text-xs rounded-full px-4 py-2 flex items-center gap-1.5 bg-amber-500 text-black hover:bg-amber-400 border border-amber-300"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>تعليق على التحديد</span>
          </Button>
        </div>
      )}

      {/* Selection Comment Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-amber-500/50 shadow-2xl space-y-4 text-start dir-rtl">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>إضافة تعليق على النص المحدد</span>
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowHighlightModal(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border-r-2 border-amber-500 text-amber-300 text-xs font-mono italic max-h-24 overflow-y-auto">
              &ldquo;{selectedText}&rdquo;
            </div>

            <form onSubmit={submitHighlightComment} className="space-y-3">
              <Textarea
                value={highlightCommentText}
                onChange={(e) => setHighlightCommentText(e.target.value)}
                placeholder="اكتب ملاحظتك أو استفسارك بخصوص هذا النص المحدد..."
                rows={3}
                className="text-xs"
                required
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowHighlightModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" className="font-bold text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> حفظ التعليق
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposal AI Assistant Modal */}
      {proposal && (
        <ProposalAiAssistant
          proposalTitle={proposal.title}
          clientName={proposal.clientName}
          proposalToken={proposal.token}
          accessToken={accessToken.current}
          content={proposal.markdown}
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* One-Page Executive Summary Sheet Modal */}
      {proposal && (
        <ProposalExecutiveSummary
          proposalTitle={proposal.title}
          clientName={proposal.clientName}
          content={proposal.markdown}
          token={proposal.token}
          isOpen={showExecSummary}
          onClose={() => setShowExecSummary(false)}
          enablePrint={settings.enablePrint}
        />
      )}
    </div>
  );
}
