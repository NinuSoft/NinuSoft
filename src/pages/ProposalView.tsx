import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
  submitProposalCommentApi,
} from "@/lib/proposals-api";
import { parseProposalSections } from "@/lib/proposal-sections";
import { ProposalSignature } from "@/components/ProposalSignature";
import { getProposalSettings } from "@/lib/proposal-settings";
import { ProposalAiAssistant } from "@/components/ProposalAiAssistant";
import { ProposalExecutiveSummary } from "@/components/ProposalExecutiveSummary";
import { ProposalExpiryCountdown } from "@/components/ProposalExpiryCountdown";
import { ProposalAttachments } from "@/components/ProposalAttachments";
import { ProposalIncentiveBanner } from "@/components/ProposalIncentiveBanner";
import { ProposalCurrencyConverter, Currency } from "@/components/ProposalCurrencyConverter";
import { ProposalPackageSwitcher } from "@/components/ProposalPackageSwitcher";
import { ProposalComments } from "@/components/ProposalComments";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Printer, Download, FileText, Globe, Layers, MessageSquare, XCircle, CheckCircle, Edit, Sparkles } from "@/components/Icons";

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

  const [settings, setSettings] = useState(getProposalSettings);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [showMobileNav, setShowMobileNav] = useState(false);

  const [selectedText, setSelectedText] = useState("");
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlightCommentText, setHighlightCommentText] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showExecSummary, setShowExecSummary] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    const handleSettingsChange = () => setSettings(getProposalSettings());
    window.addEventListener("ninusoft_settings_updated", handleSettingsChange);
    return () => window.removeEventListener("ninusoft_settings_updated", handleSettingsChange);
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!showHighlightModal) {
          setSelectionPos(null);
          setSelectedText("");
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setSelectedText(text);
            // Use viewport-relative coordinates for fixed positioning
            setSelectionPos({
              top: Math.max(12, rect.top - 48),
              left: Math.max(12, Math.min(window.innerWidth - 170, rect.left + rect.width / 2 - 75)),
            });
          }
        } catch {}
      }
    };

    const handleScroll = () => {
      if (!showHighlightModal) {
        setSelectionPos(null);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showHighlightModal]);

  const submitHighlightComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightCommentText.trim() || !selectedText || !proposal) return;

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: proposal.clientName || "العميل",
      text: highlightCommentText.trim(),
      selectedText: selectedText,
      date: new Intl.DateTimeFormat("ar-IQ-u-nu-latn", { dateStyle: "short", timeStyle: "short" }).format(new Date()),
    };

    const storageKey = `ninusoft-comments:${proposal.title}`;
    try {
      const raw = localStorage.getItem(storageKey);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [newComment, ...existing];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (proposal.token) {
        await submitProposalCommentApi(proposal.token, newComment).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    }

    setShowHighlightModal(false);
    setSelectionPos(null);
    setSelectedText("");
    setHighlightCommentText("");

    const el = document.getElementById("proposal-comments");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const sessionId = useMemo(() => {
    const key = `ninusoft-proposal-session:${token}`;
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
    return value;
  }, [token]);

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

  const unlock = async (event: FormEvent) => {
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

  const print = (type: "print" | "pdf") => {
    void recordProposalEvent(
      token,
      type,
      sessionId,
      accessToken.current,
    ).catch(() => undefined);
    window.print();
  };

  if (status === "loading") {
    return (
      <CenteredState icon="…" title="جاري تجهيز العرض" description="لحظات ونفتح لك الوثيقة بأمان." />
    );
  }

  if (status === "locked") {
    return (
      <CenteredState
        icon="⌁"
        title="هذا العرض محمي"
        description="أدخل كلمة السر التي أرسلها لك فريق NinuSoft للوصول إلى العرض."
      >
        <form className="proposal-password-form" onSubmit={unlock}>
          <label htmlFor="proposal-password">كلمة السر</label>
          <Input
            id="proposal-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
          {error && <p className="proposal-form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={unlocking}>
            {unlocking ? "جاري التحقق…" : "فتح العرض"}
          </Button>
        </form>
      </CenteredState>
    );
  }

  if (status === "expired") {
    return <CenteredState icon="⌛" title="انتهت صلاحية الرابط" description="تواصل مع فريق NinuSoft للحصول على رابط محدّث لهذا العرض." />;
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

  return (
    <div className="proposal-page" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Branded PDF Cover Page (Only visible during print/PDF export) */}
      <div className="hidden print:flex print:flex-col justify-between p-12 text-center bg-black text-white dir-rtl min-h-[95vh] border-b-2 border-amber-500 mb-8 page-break-after">
        <div className="space-y-4 pt-12">
          <div className="text-4xl font-black text-amber-400 font-mono tracking-widest">NINUSOFT</div>
          <p className="text-sm text-gray-400 font-semibold">حلول البرمجيات والأنظمة الحسابية المتكاملة</p>
        </div>

        <div className="space-y-6 my-auto border-y border-gray-800 py-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            PROPOSAL DOCUMENT
          </span>
          <h1 className="text-4xl font-extrabold text-white leading-tight">{proposal.title}</h1>
          <p className="text-xl text-gray-300 font-bold">مُعد خصيصاً لـ: {proposal.clientName}</p>
        </div>

        <div className="flex justify-between items-end border-t border-gray-800 pt-8 text-xs text-gray-400 font-mono">
          <div>تاريخ الإصدار: {new Intl.DateTimeFormat("ar-IQ-u-nu-latn", { dateStyle: "medium" }).format(new Date())}</div>
          <div>معرف العرض: {proposal.token}</div>
        </div>
      </div>

      {settings.enableReadingTime && (
        <div
          className="proposal-reading-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      )}
      <header className="proposal-toolbar">
        <Brand />
        <div className="proposal-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang((prev) => (prev === "ar" ? "en" : "ar"))}
            className="text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "English" : "العربية"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExecSummary(true)}
            className="text-xs font-bold flex items-center gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ملخص تنفيذي</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiModal(true)}
            className="text-xs font-bold flex items-center gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>المساعد الذكي</span>
          </Button>

          {settings.enableReadingTime && (
            <span className="proposal-reading-badge flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{toEnglishDigits(readTimeMinutes)} {lang === "ar" ? "د قراءة" : "min read"}</span>
            </span>
          )}
          {settings.enablePdfExport && (
            <>
              <Button variant="outline" onClick={() => print("print")} className="flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> {lang === "ar" ? "طباعة" : "Print"}
              </Button>
              <Button onClick={() => print("pdf")} className="flex items-center gap-1.5">
                <Download className="w-4 h-4" /> {lang === "ar" ? "تنزيل PDF" : "Download PDF"}
              </Button>
            </>
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

        <div className="proposal-layout-grid">
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
                      className={`proposal-sidebar-item ${activeSectionId === sec.id ? "is-active" : ""}`}
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

                <div className="proposal-sidebar-footer">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5 font-bold" onClick={() => print("pdf")}>
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>تنزيل الوثيقة (PDF)</span>
                  </Button>
                </div>
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

              {activeSectionId === "sec-all" ? (
                <div className="proposal-all-sections">
                  {sections.map((sec, idx) => (
                    <section key={sec.id} className="proposal-section-block">
                      {sections.length > 1 && idx > 0 && <hr className="my-8" />}
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlerts]} components={proposalMarkdownComponents}>
                        {sec.content}
                      </ReactMarkdown>
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

              <ProposalCurrencyConverter
                currentCurrency={currency}
                onCurrencyChange={(c) => setCurrency(c)}
              />

              <ProposalPackageSwitcher
                currency={currency}
              />

              <ProposalAttachments />

              {settings.enableDigitalSignature && (
                <ProposalSignature
                  proposalTitle={proposal.title}
                  clientName={proposal.clientName}
                  proposalToken={proposal.token}
                  allowDraw={settings.allowDrawSignature}
                  allowType={settings.allowTypeSignature}
                  allowUpload={settings.allowUploadSignature}
                  allowRejection={settings.allowRejection}
                />
              )}

              {settings.enableInlineComments && (
                <ProposalComments proposalTitle={proposal.title} proposalToken={proposal.token} clientName={proposal.clientName} />
              )}
            </article>
          </div>
        </div>

        <footer className="proposal-footer">
          <Brand />
          <p>هذه الوثيقة خاصة ومعدّة للقراءة فقط.</p>
        </footer>
      </main>

      {/* Mobile Floating Drawer Button */}
      {sections.length > 1 && (
        <div className="fixed bottom-6 left-6 z-40 lg:hidden">
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
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Selection Popover Button */}
      {selectionPos && selectedText && !showHighlightModal && (
        <div
          className="fixed z-40 animate-in fade-in zoom-in duration-150"
          style={{ top: `${selectionPos.top}px`, left: `${selectionPos.left}px` }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
        />
      )}
    </div>
  );
}
