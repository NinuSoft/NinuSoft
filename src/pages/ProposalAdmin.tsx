import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { proposalMarkdownComponents, remarkAlerts } from "@/components/ProposalMarkdown";

import { ChangeEvent, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminRequest,
  ApiError,
  type Proposal,
  type ProposalSummary,
} from "@/lib/proposals-api";
import {
  parseProposalSections,
  serializeProposalSections,
  type ProposalSection,
} from "@/lib/proposal-sections";
import { ProposalSettingsManager } from "@/components/ProposalSettingsManager";
import { ProposalAnalytics } from "@/components/ProposalAnalytics";
import {
  FileText,
  BarChart,
  Settings,
  Eye,
  EyeOff,
  FileSpreadsheet,
  BookOpen,
  Send,
  CheckCircle,
  XCircle,
  Layers,
  Edit,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Link,
  Shield,
  ArrowLeft,
  LogOut,
  Lock,
  Share2,
} from "@/components/Icons";

type FormState = {
  id: string;
  title: string;
  clientName: string;
  markdown: string;
  password: string;
  expiresAt: string;
  active: boolean;
  rotateToken: boolean;
  removePassword: boolean;
};

const emptyForm: FormState = {
  id: "",
  title: "",
  clientName: "",
  markdown: "",
  password: "",
  expiresAt: "",
  active: true,
  rotateToken: false,
  removePassword: false,
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "لا يوجد";
  return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProposalAdmin() {
  const [adminKey, setAdminKey] = useState(
    sessionStorage.getItem("ninusoft-proposals-admin-key") || "",
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<ProposalSummary[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [protectionType, setProtectionType] = useState<"pin" | "password">("pin");
  const [showPin, setShowPin] = useState(false);
  const [selectedAuditProposal, setSelectedAuditProposal] = useState<ProposalSummary | null>(null);
  const [shareProposal, setShareProposal] = useState<ProposalSummary | null>(null);
  const [sharePassword, setSharePassword] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"editor" | "analytics" | "settings">("editor");
  const [searchQuery, setSearchQuery] = useState("");

  const [sections, setSections] = useState<ProposalSection[]>(() =>
    parseProposalSections(emptyForm.markdown)
  );
  const [activeSectionId, setActiveSectionId] = useState<string>("sec-1");
  const [editorMode, setEditorMode] = useState<"sections" | "raw">("sections");
  const [previewingSectionId, setPreviewingSectionId] = useState<string | null>(null);

  // Sync sections whenever form.markdown changes externally or on load
  useEffect(() => {
    const parsed = parseProposalSections(form.markdown);
    setSections(parsed);
    if (parsed.length > 0 && !parsed.some((s) => s.id === activeSectionId)) {
      setActiveSectionId(parsed[0].id);
    }
  }, [form.markdown]);

  const updateSectionTitle = (id: string, newTitle: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, title: newTitle } : sec
    );
    setSections(updated);
    setForm((current) => ({
      ...current,
      markdown: serializeProposalSections(updated),
    }));
  };

  const updateSectionContent = (id: string, newContent: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, content: newContent } : sec
    );
    setSections(updated);
    setForm((current) => ({
      ...current,
      markdown: serializeProposalSections(updated),
    }));
  };

  const updateSectionSignature = (id: string, hasSignature: boolean) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, hasSignature } : sec
    );
    setSections(updated);
    setForm((current) => ({
      ...current,
      markdown: serializeProposalSections(updated),
    }));
  };

  const addNewSection = () => {
    const newId = `sec-${Date.now()}`;
    const newSec: ProposalSection = {
      id: newId,
      title: `قسم جديد ${sections.length + 1}`,
      content: "## عنوان فرعي\n\nأكتب محتوى هذا القسم هنا...",
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setActiveSectionId(newId);
    setForm((current) => ({
      ...current,
      markdown: serializeProposalSections(updated),
    }));
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) {
      setError("يجب أن يحتوي العرض على قسم واحد على الأقل.");
      return;
    }
    const updated = sections.filter((sec) => sec.id !== id);
    setSections(updated);
    if (activeSectionId === id) {
      setActiveSectionId(updated[0]?.id || "");
    }
    setForm((current) => ({
      ...current,
      markdown: serializeProposalSections(updated),
    }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setSections(copy);
    setForm((current) => ({
      ...current,
      markdown: serializeProposalSections(copy),
    }));
  };

  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [copiedSectionContentId, setCopiedSectionContentId] = useState<string | null>(null);
  const [indexCopied, setIndexCopied] = useState<boolean>(false);

  const copySectionHyperlink = async (sec: ProposalSection) => {
    const hyperlink = `[${sec.title || "القسم"}](#${sec.id})`;
    try {
      await navigator.clipboard.writeText(hyperlink);
      setCopiedSectionId(sec.id);
      setMessage(`تم نسخ رابط القسم كـ Hyperlink: ${hyperlink}`);
      setTimeout(() => setCopiedSectionId(null), 2500);
    } catch {
      setError("تعذر النسخ للحافظة.");
    }
  };

  const copySingleSection = async (sec: ProposalSection) => {
    const sigMeta = sec.hasSignature ? " | signature: true" : "";
    const sectionBlock = `<!-- section: ${sec.title || "قسم"}${sigMeta} -->\n${sec.content || ""}`;
    try {
      await navigator.clipboard.writeText(sectionBlock);
      setCopiedSectionContentId(sec.id);
      setMessage(`تم نسخ نص ومحتوى القسم "${sec.title || "القسم"}" كـ Markdown.`);
      setTimeout(() => setCopiedSectionContentId(null), 2500);
    } catch {
      setError("تعذر النسخ للحافظة.");
    }
  };

  const copyAllSectionsHyperlinks = async () => {
    const text = sections
      .map((sec, idx) => `${idx + 1}. [${sec.title || `قسم ${idx + 1}`}](#${sec.id})`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setIndexCopied(true);
      setMessage("تم نسخ فهرس جميع الأقسام كروابط Hyperlinks.");
      setTimeout(() => setIndexCopied(false), 2500);
    } catch {
      setError("تعذر النسخ للحافظة.");
    }
  };

  const publicOrigin = useMemo(() => window.location.origin, []);
  const dashboardStats = useMemo(() => {
    const now = Date.now();
    return {
      active: items.filter((item) => item.active && (!item.expiresAt || new Date(item.expiresAt).getTime() > now)).length,
      opens: items.reduce((sum, item) => sum + item.openCount, 0),
      reads: items.reduce((sum, item) => sum + item.readCount, 0),
    };
  }, [items]);
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.clientName.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  const loadItems = async (key = adminKey) => {
    const result = await adminRequest<{ proposals: ProposalSummary[] }>(
      key,
      "/proposals",
    );
    setItems(result.proposals);
    setAuthenticated(true);
    sessionStorage.setItem("ninusoft-proposals-admin-key", key);
  };

  useEffect(() => {
    document.title = "إدارة العروض | NinuSoft";
    if (adminKey) {
      void loadItems().catch(() => {
        sessionStorage.removeItem("ninusoft-proposals-admin-key");
        setAuthenticated(false);
      });
    }
    return () => {
      document.title = "NinuSoft";
    };
    // Initial session restoration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (event: SyntheticEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loadItems(adminKey);
    } catch {
      setError("مفتاح الإدارة غير صحيح.");
    } finally {
      setBusy(false);
    }
  };

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const readMarkdownFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    if (fileList.length === 1) {
      const file = fileList[0];
      const text = await file.text();
      const sectionTitle = file.name.replace(/\.md(?:own)?$/i, "");
      const formatted = text.includes("<!-- section:") ? text : `<!-- section: ${sectionTitle} -->\n${text.trim()}`;
      setForm((current) => ({
        ...current,
        markdown: current.markdown ? `${current.markdown.trim()}\n\n${formatted}` : formatted,
        title: current.title || sectionTitle,
      }));
    } else {
      const sectionPromises = fileList.map(async (file) => {
        const text = await file.text();
        const sectionTitle = file.name.replace(/\.md(?:own)?$/i, "");
        if (text.includes("<!-- section:")) {
          return text.trim();
        }
        return `<!-- section: ${sectionTitle} -->\n${text.trim()}`;
      });

      const sectionBlocks = await Promise.all(sectionPromises);
      const combined = sectionBlocks.join("\n\n");
      const firstTitle = fileList[0].name.replace(/\.md(?:own)?$/i, "");

      setForm((current) => ({
        ...current,
        markdown: current.markdown ? `${current.markdown.trim()}\n\n${combined}` : combined,
        title: current.title || firstTitle,
      }));
    }

    event.target.value = "";
  };

  const editProposal = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      const result = await adminRequest<{ proposal: ProposalSummary & { markdown: string } }>(
        adminKey,
        `/proposals/${id}`,
      );
      const proposal = result.proposal;
      setIsProtected(Boolean(proposal.protected));
      setForm({
        id: proposal.id,
        title: proposal.title,
        clientName: proposal.clientName,
        markdown: proposal.markdown,
        password: "",
        expiresAt: proposal.expiresAt
          ? new Date(proposal.expiresAt).toISOString().slice(0, 16)
          : "",
        active: proposal.active,
        rotateToken: false,
        removePassword: false,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("تعذر تحميل العرض للتعديل.");
    } finally {
      setBusy(false);
    }
  };

  const saveProposal = async (event: SyntheticEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        title: form.title,
        clientName: form.clientName,
        markdown: form.markdown,
        password: form.removePassword
          ? null
          : form.password || undefined,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
        active: form.active,
        rotateToken: form.rotateToken,
      };
      const result = form.id
        ? await adminRequest<{ proposal: Proposal }>(
            adminKey,
            `/proposals/${form.id}`,
            { method: "PUT", body: JSON.stringify(payload) },
          )
        : await adminRequest<{ proposal: Proposal }>(
            adminKey,
            "/proposals",
            { method: "POST", body: JSON.stringify(payload) },
          );
      const link = `${publicOrigin}/proposals/${result.proposal.token}`;
      setMessage(
        form.id
          ? `تم تحديث العرض فوراً. رابط العميل: ${link}`
          : `تم إنشاء العرض. رابط العميل: ${link}`,
      );
      setForm(emptyForm);
      await loadItems();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "تعذر حفظ العرض.",
      );
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (token: string) => {
    await navigator.clipboard.writeText(`${publicOrigin}/proposals/${token}`);
    setMessage("تم نسخ رابط العميل.");
  };

  const deleteProposal = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت تأكد من حذف العرض "${title}" نهائياً؟`)) {
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await adminRequest<{ ok: boolean }>(
        adminKey,
        `/proposals/${id}`,
        { method: "DELETE" },
      );
      setMessage(`تم حذف العرض "${title}" بنجاح.`);
      if (form.id === id) {
        setForm(emptyForm);
      }
      await loadItems();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "تعذر حذف العرض.",
      );
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("ninusoft-proposals-admin-key");
    setAdminKey("");
    setAuthenticated(false);
    setItems([]);
  };

  const exportCSV = () => {
    if (items.length === 0) return;
    const headers = ["العنوان", "العميل", "المشاهدات", "القراءات", "الحالة", "تاريخ الانشاء"];
    const rows = items.map((item) => [
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.clientName.replace(/"/g, '""')}"`,
      item.openCount,
      item.readCount,
      item.active ? "فعال" : "موقوف",
      `"${new Date(item.updatedAt).toLocaleDateString("ar-IQ")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ninusoft_proposals_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!authenticated) {
    return (
      <main className="proposal-admin-login" dir="rtl">
        <div className="proposal-login-glow" />
        <form onSubmit={login}>
          <a className="proposal-brand" href="/">
            <img src="/logo.png" alt="" />
            <span>NinuSoft</span>
          </a>
          <div className="proposal-login-icon"><Shield className="h-5 w-5" /></div>
          <span className="proposal-admin-eyebrow">مساحة عمل الفريق</span>
          <h1>مرحباً بعودتك</h1>
          <p>أدخل مفتاح الإدارة للوصول إلى عروض العملاء والتحليلات.</p>
          <label htmlFor="admin-key">مفتاح الإدارة</label>
          <Input
            id="admin-key"
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            autoFocus
            required
          />
          {error && <p className="proposal-form-error">{error}</p>}
          <Button type="submit" disabled={busy} className="proposal-login-submit">
            {busy ? "جاري التحقق…" : "دخول"}
            {!busy && <ArrowLeft className="h-4 w-4" />}
          </Button>
          <small>اتصال مشفّر · وصول خاص بفريق NinuSoft</small>
        </form>
      </main>
    );
  }

  return (
    <div className="proposal-admin" dir="rtl">
      <aside className="proposal-admin-rail">
        <a className="proposal-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>NinuSoft <small>Proposals</small></span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          {[
            { id: "editor" as const, label: "العروض", icon: FileText },
            { id: "analytics" as const, label: "التحليلات", icon: BarChart },
            { id: "settings" as const, label: "الإعدادات", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={activeAdminTab === tab.id ? "is-active" : ""}
                onClick={() => setActiveAdminTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="proposal-admin-rail-footer">
          <div className="proposal-admin-avatar">NS</div>
          <div>
            <strong>فريق NinuSoft</strong>
            <span>مسؤول النظام</span>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="تسجيل الخروج"
            title="تسجيل الخروج"
            className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="proposal-admin-workspace">
        <header className="proposal-admin-topbar">
          <div>
            <span className="proposal-admin-mobile-brand">NinuSoft</span>
            <h1>
              {activeAdminTab === "editor"
                ? "إدارة العروض"
                : activeAdminTab === "analytics"
                  ? "التحليلات والأداء"
                  : "إعدادات التجربة"}
            </h1>
            <p>
              {activeAdminTab === "editor"
                ? "أنشئ عروضاً احترافية وتابع تفاعل العملاء من مكان واحد."
                : activeAdminTab === "analytics"
                  ? "راقب وصول العملاء وقراءة العروض."
                  : "خصص تجربة العرض والميزات المتاحة للعملاء."}
            </p>
          </div>
          <div className="proposal-admin-top-actions">
            <span className="proposal-admin-live"><i /> النظام متصل</span>
            {activeAdminTab === "editor" && (
              <Button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Plus className="h-4 w-4" />
                عرض جديد
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-9 px-3 text-xs font-bold text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-1.5"
              title="تسجيل الخروج من لوحة التحكم"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </header>

        <main>
        {activeAdminTab === "settings" ? (
          <section className="proposal-editor">
            <ProposalSettingsManager />
          </section>
        ) : activeAdminTab === "analytics" ? (
          <section className="proposal-editor">
            <ProposalAnalytics proposalsCount={items.length} />
          </section>
        ) : (
          <>
            <section className="proposal-admin-overview" aria-label="ملخص العروض">
              <div>
                <span className="proposal-stat-icon is-gold"><FileText className="h-4 w-4" /></span>
                <p>إجمالي العروض</p>
                <strong>{items.length}</strong>
                <small>كل العروض المنشأة</small>
              </div>
              <div>
                <span className="proposal-stat-icon is-green"><CheckCircle className="h-4 w-4" /></span>
                <p>روابط فعّالة</p>
                <strong>{dashboardStats.active}</strong>
                <small>متاحة للعملاء الآن</small>
              </div>
              <div>
                <span className="proposal-stat-icon is-blue"><Eye className="h-4 w-4" /></span>
                <p>مرات الفتح</p>
                <strong>{dashboardStats.opens}</strong>
                <small>إجمالي الزيارات</small>
              </div>
              <div>
                <span className="proposal-stat-icon is-purple"><BookOpen className="h-4 w-4" /></span>
                <p>قراءات مكتملة</p>
                <strong>{dashboardStats.reads}</strong>
                <small>تفاعل عميق مع المحتوى</small>
              </div>
            </section>
            <section className="proposal-editor">
          <div className="proposal-admin-section-title">
            <div>
              <span>{form.id ? "تعديل مباشر" : "عرض جديد"}</span>
              <h1>{form.id ? "تحديث عرض العميل" : "إنشاء عرض Markdown"}</h1>
            </div>
            {form.id && (
              <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => void deleteProposal(form.id, form.title)} disabled={busy}>
                  حذف هذا العرض
                </Button>
                <Button variant="outline" size="sm" onClick={() => setForm(emptyForm)}>
                  إلغاء التعديل
                </Button>
              </div>
            )}
          </div>

          <form onSubmit={saveProposal}>
            <div className="proposal-form-grid">
              <label>
                <span>عنوان العرض الفني والمالي</span>
                <Input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="مثال: عرض تطوير المنصة الرقمية والتطبيق الذكي"
                  required
                />
              </label>
              <label>
                <span>اسم العميل أو الجهة المستهدفة</span>
                <Input
                  value={form.clientName}
                  onChange={(event) => updateField("clientName", event.target.value)}
                  placeholder="مثال: شركة الحلول المتقدمة / م. أحمد علي"
                  required
                />
              </label>
              <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">تاريخ ووقت انتهاء الصلاحية</span>
                    <span className="text-[11px] font-mono text-amber-400 font-semibold">
                      {form.expiresAt ? `ينتهي في: ${formatDate(form.expiresAt)}` : "غير محدد (رابط دائمی)"}
                    </span>
                  </div>
                  <Input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) => updateField("expiresAt", event.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                {/* Preset Duration Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-muted-foreground font-bold">اختصارات سريعة:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                      updateField("expiresAt", iso);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-card/80 hover:bg-muted text-[11px] font-mono font-bold text-amber-400 border border-amber-500/30 transition-all shadow-sm"
                  >
                    +7 أيام
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 14);
                      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                      updateField("expiresAt", iso);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-card/80 hover:bg-muted text-[11px] font-mono font-bold text-amber-400 border border-amber-500/30 transition-all shadow-sm"
                  >
                    +14 يوم
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                      updateField("expiresAt", iso);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-card/80 hover:bg-muted text-[11px] font-mono font-bold text-amber-400 border border-amber-500/30 transition-all shadow-sm"
                  >
                    +30 يوم
                  </button>
                  {form.expiresAt && (
                    <button
                      type="button"
                      onClick={() => updateField("expiresAt", "")}
                      className="px-2.5 py-1 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-[11px] font-bold text-destructive border border-destructive/30 transition-all"
                    >
                      إلغاء الانتهاء
                    </button>
                  )}
                </div>
              </div>

              {/* Protection Card */}
              <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        حماية العرض برمز مرور
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {form.id && isProtected && !form.removePassword
                          ? "العرض محمي برمز مرور حالياً"
                          : "اختر نوع الحماية المطلوبة للوثيقة"}
                      </span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const currentMode: "none" | "pin" | "password" = form.removePassword
                    ? "none"
                    : (isProtected || Boolean(form.password))
                    ? protectionType
                    : "none";

                  return (
                    <div className="pt-2 border-t border-border/40 space-y-3">
                      {/* Protection Mode Options */}
                      <div className="flex items-center justify-between gap-1.5 p-1 rounded-lg bg-muted/60 border border-border/40">
                        <button
                          type="button"
                          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all ${
                            currentMode === "none"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => {
                            updateField("removePassword", true);
                            updateField("password", "");
                            setIsProtected(false);
                          }}
                        >
                          بدون حماية
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all ${
                            currentMode === "pin"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => {
                            updateField("removePassword", false);
                            setIsProtected(true);
                            setProtectionType("pin");
                            updateField("password", "");
                            setShowPin(false);
                          }}
                        >
                          رمز PIN عددي
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all ${
                            currentMode === "password"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => {
                            updateField("removePassword", false);
                            setIsProtected(true);
                            setProtectionType("password");
                            updateField("password", "");
                            setShowPin(false);
                          }}
                        >
                          كلمة سر نصية
                        </button>
                      </div>

                      {currentMode !== "none" && (
                        <div>
                          <label htmlFor="proposal-pin-input" className="text-xs font-bold text-muted-foreground block mb-1">
                            {currentMode === "pin"
                              ? form.id ? "رمز PIN العددي الجديد" : "رمز PIN العددي"
                              : form.id ? "كلمة السر النصية الجديدة" : "كلمة السر النصية"}
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                id="proposal-pin-input"
                                type={showPin ? "text" : "password"}
                                inputMode={currentMode === "pin" ? "numeric" : "text"}
                                value={form.password}
                                onChange={(event) => {
                                  const val = event.target.value;
                                  if (currentMode === "pin") {
                                    const onlyDigits = val.replace(/\D/g, "").slice(0, 12);
                                    updateField("password", onlyDigits);
                                  } else {
                                    updateField("password", val);
                                  }
                                }}
                                placeholder={
                                  currentMode === "pin"
                                    ? "رمز PIN من 8 أرقام على الأقل (مثال: 48218210)"
                                    : "أدخل كلمة سر نصية مخصصة (مثال: NinuSoft#2026)"
                                }
                                className="font-mono text-sm h-10 pr-10 w-full"
                                autoFocus
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPin((v) => !v)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                                title={showPin ? "إخفاء" : "إظهار"}
                              >
                                {showPin ? <EyeOff width={15} height={15} /> : <Eye width={15} height={15} />}
                              </button>
                            </div>
                            <button
                              type="button"
                              title={currentMode === "pin" ? "توليد PIN عشوائي" : "توليد كلمة سر عشوائية"}
                              onClick={() => {
                                let generated = "";
                                if (currentMode === "pin") {
                                  generated = Array.from(
                                    { length: 8 },
                                    () => Math.floor(Math.random() * 10)
                                  ).join("");
                                } else {
                                  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&";
                                  generated = Array.from(
                                    { length: 12 },
                                    () => chars[Math.floor(Math.random() * chars.length)]
                                  ).join("");
                                }
                                updateField("password", generated);
                              }}
                              className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            >
                              <RefreshCw width={15} height={15} />
                            </button>
                            <button
                              type="button"
                              title="نسخ"
                              disabled={!form.password}
                              onClick={() => {
                                if (!form.password) return;
                                navigator.clipboard.writeText(form.password).catch(() => {});
                                const btn = document.getElementById("pin-copy-btn") as HTMLButtonElement | null;
                                if (btn) {
                                  btn.dataset.copied = "1";
                                  setTimeout(() => { delete btn.dataset.copied; btn.innerHTML = btn.dataset.orig ?? ""; }, 1500);
                                }
                              }}
                              id="pin-copy-btn"
                              className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Copy width={15} height={15} />
                            </button>
                          </div>
                          <small className="text-[11px] text-muted-foreground block mt-1">
                            {currentMode === "pin"
                              ? "يجب أن يتكون رمز PIN من 8 أرقام على الأقل."
                              : "يجب أن تتكون كلمة السر من 8 أحرف على الأقل."}
                          </small>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="proposal-markdown-label">
              <div>
                <span>إدارة المحتوى والأقسام</span>
                <small>يمكنك تعديل كل قسم على حدة (العنوان والمحتوى) أو رفع عدة ملفات .md.</small>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex rounded-lg p-1 bg-muted border border-border/40">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${editorMode === "sections" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setEditorMode("sections")}
                  >
                    <Layers className="w-3.5 h-3.5" /> الأقسام المستقلة ({sections.length})
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${editorMode === "raw" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setEditorMode("raw")}
                  >
                    <Edit className="w-3.5 h-3.5" /> سورس كود
                  </button>
                </div>
                <label className="proposal-file-button">
                  + رفع ملف / ملفات .md
                  <input
                    type="file"
                    accept=".md,.markdown,text/markdown,text/plain"
                    multiple
                    onChange={readMarkdownFiles}
                  />
                </label>
              </div>
            </div>

            {editorMode === "sections" ? (
              <div className="space-y-4">
                {/* Sections Bar & Tab Selector */}
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
                    {sections.map((sec, idx) => (
                      <button
                        key={sec.id}
                        type="button"
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                          activeSectionId === sec.id
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card/60 text-muted-foreground hover:text-foreground border-border/50"
                        }`}
                        onClick={() => setActiveSectionId(sec.id)}
                      >
                        <span>{idx + 1}. {sec.title || "قسم جديد"}</span>
                        {sec.hasSignature && <span className="text-[10px] text-amber-400 font-extrabold" title="يتطلب توقيع">✍️</span>}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-dashed border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-all flex items-center gap-1 shrink-0"
                      onClick={addNewSection}
                    >
                      <Plus className="w-3.5 h-3.5" /> قسم جديد
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold flex items-center gap-1.5 border-border/60"
                    onClick={() => void copyAllSectionsHyperlinks()}
                    title="نسخ قائمة كل الأقسام مع روابطها الداخلية كـ Hyperlinks"
                  >
                    {indexCopied ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Link className="w-3.5 h-3.5" />
                    )}
                    <span>نسخ فهرس الأقسام</span>
                  </Button>
                </div>

                {/* Active Section Editor Card */}
                {(() => {
                  const activeSec = sections.find((s) => s.id === activeSectionId) || sections[0];
                  const activeIdx = sections.findIndex((s) => s.id === activeSectionId);
                  if (!activeSec) return null;

                  return (
                    <div className="space-y-4 pt-1">
                      {/* Section Header Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center bg-card/60 p-3 rounded-lg border border-border/60">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground">عنوان القسم</span>
                            <Input
                              value={activeSec.title}
                              onChange={(e) => updateSectionTitle(activeSec.id, e.target.value)}
                              placeholder="مثال: 01. الملخص التنفيذي ونطاق العمل"
                              className="font-bold text-sm"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400 select-none pt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(activeSec.hasSignature)}
                              onChange={(e) => updateSectionSignature(activeSec.id, e.target.checked)}
                              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                            <span>يتطلب توقيع إلكتروني خاص بهذا القسم</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-1.5 self-end flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs font-bold flex items-center gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                            onClick={() => void copySectionHyperlink(activeSec)}
                            title="نسخ رابط هذا القسم كـ Hyperlink (لاستخدامه في نص العرض)"
                          >
                            {copiedSectionId === activeSec.id ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>تم النسخ!</span>
                              </>
                            ) : (
                              <>
                                <Link className="w-3.5 h-3.5" />
                                <span>نسخ رابط القسم (Hyperlink)</span>
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs font-bold flex items-center gap-1.5"
                            onClick={() => void copySingleSection(activeSec)}
                            title="نسخ نص ومحتوى هذا القسم بالكامل كـ Markdown"
                          >
                            {copiedSectionContentId === activeSec.id ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>تم نسخ المحتوى!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ القسم</span>
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-2 text-xs"
                            disabled={activeIdx === 0}
                            onClick={() => moveSection(activeIdx, "up")}
                            title="نقل القسم للأعلى"
                          >
                            ↑ للأعلى
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-2 text-xs"
                            disabled={activeIdx === sections.length - 1}
                            onClick={() => moveSection(activeIdx, "down")}
                            title="نقل القسم للأسفل"
                          >
                            ↓ للأسفل
                          </Button>
                          <Button
                            type="button"
                            variant={previewingSectionId === activeSec.id ? "default" : "outline"}
                            size="sm"
                            className="h-9 text-xs flex items-center gap-1"
                            onClick={() => setPreviewingSectionId((prev) => (prev === activeSec.id ? null : activeSec.id))}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{previewingSectionId === activeSec.id ? "إخفاء المعاينة" : "معاينة القسم"}</span>
                          </Button>
                          {sections.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-9 text-xs flex items-center gap-1"
                              onClick={() => removeSection(activeSec.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف القسم</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Section Independent Preview */}
                      {previewingSectionId === activeSec.id && (
                        <div className="p-4 rounded-xl border border-primary/30 bg-card/80 shadow-lg space-y-2">
                          <span className="text-xs font-bold text-primary">معاينة مباشرة للقسم: {activeSec.title}</span>
                          <article className="proposal-document">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlerts]} components={proposalMarkdownComponents}>
                              {activeSec.content || "لا يوجد محتوى لهذا القسم بعد."}
                            </ReactMarkdown>
                          </article>
                        </div>
                      )}

                      {/* Section Content Textarea */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground">محتوى هذا القسم (Markdown)</span>
                        <Textarea
                          className="proposal-markdown-editor min-h-[18rem]"
                          dir="auto"
                          value={activeSec.content}
                          onChange={(e) => updateSectionContent(activeSec.id, e.target.value)}
                          placeholder={`# ${activeSec.title}\n\nاكتب أو ألصق محتوى هذا القسم هنا باستخدام صيغة Markdown...`}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <Textarea
                className="proposal-markdown-editor min-h-[22rem]"
                dir="auto"
                value={form.markdown}
                onChange={(event) => updateField("markdown", event.target.value)}
                placeholder={"# عنوان العرض الفني والمالي\n\nمرحباً بكم في وثيقة العرض...\n\n## 01. نطاق العمل والتسليمات"}
                required
              />
            )}

            <div className="proposal-form-options">
              <label>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateField("active", event.target.checked)}
                />
                الرابط فعّال
              </label>
              {form.id && (
                <label>
                  <input
                    type="checkbox"
                    checked={form.rotateToken}
                    onChange={(event) => updateField("rotateToken", event.target.checked)}
                  />
                  إلغاء الرابط القديم وإنشاء رابط جديد
                </label>
              )}
              <Button type="button" variant="outline" onClick={() => setShowPreview((value) => !value)}>
                {showPreview ? "إخفاء المعاينة" : "معاينة المحتوى"}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "جاري الحفظ…" : form.id ? "حفظ التعديلات" : "إنشاء الرابط الخاص"}
              </Button>
            </div>
          </form>

          {showPreview && (
            <div className="proposal-preview p-4 rounded-xl border border-border/60 bg-card/60 space-y-3">
              <div className="text-xs font-bold text-amber-400 border-b border-border/40 pb-2 flex items-center justify-between">
                <span>معاينة المستند الكلي للعرض ({editorMode === "sections" ? `${sections.length} أقسام` : "سورس كود"})</span>
              </div>
              <article className="proposal-document">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlerts]} components={proposalMarkdownComponents}>
                  {editorMode === "sections"
                    ? sections.map((sec) => `## ${sec.title}\n\n${sec.content}`).join("\n\n---\n\n") || "ستظهر معاينة النص هنا."
                    : form.markdown || "ستظهر معاينة النص هنا."}
                </ReactMarkdown>
              </article>
            </div>
          )}
          {message && <p className="proposal-admin-message">{message}</p>}
          {error && <p className="proposal-form-error">{error}</p>}
        </section>

        <section className="proposal-list">
          <div className="proposal-admin-section-title">
            <div>
              <span>المتابعة</span>
              <h2>عروض العملاء</h2>
            </div>
            <div className="proposal-list-tools">
              <label className="proposal-list-search">
                <Search className="h-3.5 w-3.5" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="بحث باسم العرض، العميل، أو رمز الرابط..."
                  aria-label="البحث في العروض"
                />
              </label>
              <Button variant="outline" size="sm" onClick={() => void loadItems()} disabled={busy} aria-label="تحديث القائمة">
                <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="secondary" size="sm" onClick={exportCSV} disabled={items.length === 0} className="font-bold text-xs flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> تصدير تقرير CSV
              </Button>
            </div>
          </div>
          {filteredItems.length === 0 ? (
            <div className="proposal-empty">
              <Search className="h-5 w-5" />
              {items.length === 0 ? "لا توجد عروض بعد. أنشئ العرض الأول من الأعلى." : "لا توجد نتائج مطابقة لبحثك."}
            </div>
          ) : (
            <div className="proposal-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>العرض</th>
                    <th>الحالة</th>
                    <th>الفتح / القراءة</th>
                    <th>آخر نشاط</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const expired = item.expiresAt && new Date(item.expiresAt) <= new Date();
                    let sigStatus: "SIGNED" | "REJECTED" | null = null;
                    try {
                      const rawSig = localStorage.getItem(`ninusoft-documenso-sig:${item.title}`);
                      if (rawSig) {
                        const parsed = JSON.parse(rawSig);
                        sigStatus = parsed.status || "SIGNED";
                      }
                    } catch {}

                    return (
                      <tr key={item.id}>
                        <td>
                          <a
                            href={`/proposals/${item.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-foreground hover:text-amber-400 hover:underline flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>{item.title}</span>
                          </a>
                          <span className="text-xs text-muted-foreground block">{item.clientName}</span>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1 items-start">
                            {sigStatus === "SIGNED" ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> معتمد
                              </span>
                            ) : sigStatus === "REJECTED" ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/30 font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> طلب تعديل
                              </span>
                            ) : item.readCount > 0 ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> تمت القراءة
                              </span>
                            ) : item.openCount > 0 ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> تم الفتح
                              </span>
                            ) : (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40 font-bold flex items-center gap-1">
                                <Send className="w-3.5 h-3.5" /> مرسل
                              </span>
                            )}
                            <small className="text-[11px] text-muted-foreground">
                              {!item.active ? "موقوف" : expired ? "منتهي" : item.protected ? "محمي برمز" : "رابط فعّال"}
                            </small>
                          </div>
                        </td>
                        <td>
                          <strong>{item.openCount} / {item.readCount}</strong>
                          <span>فتح / قراءة</span>
                        </td>
                        <td>
                          <strong>{formatDate(item.lastReadAt || item.lastOpenedAt)}</strong>
                          <span>{item.firstOpenedAt ? `أول فتح ${formatDate(item.firstOpenedAt)}` : "لم يُفتح بعد"}</span>
                        </td>
                        <td className="proposal-actions-cell">
                          <Button size="sm" variant="secondary" onClick={() => window.open(`/proposals/${item.token}`, "_blank")} className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> معاينة
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedAuditProposal(item)} className="flex items-center gap-1">
                            <BarChart className="w-3.5 h-3.5" /> تدقيق
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void copyLink(item.token)} aria-label="نسخ رابط العرض">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setShareProposal(item); setSharePassword(""); setShareCopied(false); }} className="flex items-center gap-1" aria-label="مشاركة العرض">
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => void editProposal(item.id)}>تعديل</Button>
                          <Button size="sm" variant="destructive" onClick={() => void deleteProposal(item.id, item.title)} disabled={busy}>حذف</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Engagement Audit Modal */}
        {selectedAuditProposal && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xl p-6 rounded-2xl bg-card border border-border/80 shadow-2xl space-y-4 text-start dir-rtl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-amber-400" />
                    <span>تقرير تفاعل وتدقيق العرض</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedAuditProposal.title} ({selectedAuditProposal.clientName})</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedAuditProposal(null)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              {/* Engagement Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">مرات الفتح</span>
                  <strong className="text-lg font-bold text-sky-400">{selectedAuditProposal.openCount}</strong>
                </div>
                <div className="p-3 rounded-xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">القراءة الكاملة</span>
                  <strong className="text-lg font-bold text-amber-400">{selectedAuditProposal.readCount}</strong>
                </div>
                <div className="p-3 rounded-xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">أول زيارة</span>
                  <strong className="text-xs font-mono block text-foreground pt-1">{formatDate(selectedAuditProposal.firstOpenedAt) || "لم يُفتح"}</strong>
                </div>
                <div className="p-3 rounded-xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">آخر نشاط</span>
                  <strong className="text-xs font-mono block text-foreground pt-1">{formatDate(selectedAuditProposal.lastReadAt || selectedAuditProposal.lastOpenedAt) || "لا يوجد"}</strong>
                </div>
              </div>

              {/* Section Feedback Audit */}
              {(() => {
                let sectionApprovals: Record<string, string> = {};
                try {
                  const raw = localStorage.getItem(`ninusoft-section-approvals:${selectedAuditProposal.token}`);
                  if (raw) sectionApprovals = JSON.parse(raw);
                } catch {}

                const feedbackEntries = Object.entries(sectionApprovals).filter(([_, v]) => Boolean(v));

                return (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>تقييم الأقسام من العميل ({feedbackEntries.length})</span>
                    </h4>
                    {feedbackEntries.length > 0 ? (
                      <div className="space-y-1.5">
                        {feedbackEntries.map(([title, status]) => (
                          <div key={title} className="p-2.5 rounded-lg border border-border/40 bg-muted/30 flex items-center justify-between text-xs">
                            <span className="font-bold">{title}</span>
                            {status === "APPROVED" ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> موافق على البند
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                                <Edit className="w-3 h-3" /> طلب تعديل
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/20 border border-border/30">
                        لم يقم العميل بتقييم أقسام محددة بعد.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Token Access Info */}
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1 text-xs font-mono">
                <span className="text-[11px] text-muted-foreground block font-sans font-bold">رابط التتبع الفريد:</span>
                <p className="text-amber-300 break-all">{window.location.origin}/proposals/{selectedAuditProposal.token}</p>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedAuditProposal(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Share Modal */}
        {shareProposal && (() => {
          const link = `${window.location.origin}/proposals/${shareProposal.token}`;
          const msg = [
            `السلام عليكم ورحمة الله وبركاته،`,
            ``,
            `يسعدنا مشاركتكم عرض ${shareProposal.title} المُعدّ خصيصاً لكم.`,
            ``,
            `🔗 رابط العرض:`,
            link,
            ...(sharePassword ? [``, `🔑 ${shareProposal.protected ? "رمز الدخول" : "كلمة المرور"}:`, sharePassword] : []),
            ``,
            `نتطلع إلى تعليقاتكم وآرائكم الكريمة.`,
            ``,
            `مع تحيات فريق نينوسوفت 🚀`,
          ].join("\n");
          return (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-lg p-6 rounded-2xl bg-card border border-border/80 shadow-2xl space-y-4 text-start dir-rtl">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary" />
                    <span>مشاركة العرض</span>
                  </h3>
                  <button type="button" onClick={() => setShareProposal(null)} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">&times;</button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold">{shareProposal.title} &mdash; {shareProposal.clientName}</p>
                  <p className="text-xs text-muted-foreground font-mono break-all text-primary/80">{link}</p>
                </div>

                {shareProposal.protected && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground block">
                      <Lock className="inline w-3 h-3 mb-0.5 me-1" />
                      أدخل رمز الدخول لتضمينه في الرسالة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={sharePassword}
                      onChange={(e) => { setSharePassword(e.target.value); setShareCopied(false); }}
                      placeholder="رمز PIN أو كلمة السر..."
                      className="w-full h-9 rounded-md border border-border bg-muted px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground block">الرسالة الجاهزة للإرسال</label>
                  <pre className="text-xs text-foreground bg-muted/60 border border-border/60 rounded-xl p-3 whitespace-pre-wrap leading-relaxed font-sans dir-rtl text-right max-h-52 overflow-y-auto">{msg}</pre>
                </div>

                <div className="flex items-center gap-2 justify-end pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShareProposal(null)}>إغلاق</Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(msg).catch(() => {});
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    {shareCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {shareCopied ? "تم النسخ!" : "نسخ الرسالة"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
        </>
        )}
      </main>
      </div>
    </div>
  );
}
