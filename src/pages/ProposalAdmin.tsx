import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { proposalMarkdownComponents, remarkAlerts } from "@/components/ProposalMarkdown";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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
import { FileText, BarChart, Settings } from "@/components/Icons";

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

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-IQ", {
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
  const [showPreview, setShowPreview] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"editor" | "analytics" | "settings">("editor");

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

  const publicOrigin = useMemo(() => window.location.origin, []);

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

  const login = async (event: FormEvent) => {
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

  const saveProposal = async (event: FormEvent) => {
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

  if (!authenticated) {
    return (
      <main className="proposal-admin-login" dir="rtl">
        <a className="proposal-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>NinuSoft</span>
        </a>
        <form onSubmit={login}>
          <span className="proposal-admin-eyebrow">منطقة خاصة بالفريق</span>
          <h1>إدارة عروض العملاء</h1>
          <p>أدخل مفتاح الإدارة المحفوظ في Cloudflare.</p>
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
          <Button type="submit" disabled={busy}>
            {busy ? "جاري التحقق…" : "دخول"}
          </Button>
        </form>
      </main>
    );
  }

  return (
    <div className="proposal-admin" dir="rtl">
      <header>
        <a className="proposal-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>NinuSoft</span>
        </a>
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border/40">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === "editor"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveAdminTab("editor")}
            >
              <FileText className="w-3.5 h-3.5" /> إدارة العروض
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === "analytics"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveAdminTab("analytics")}
            >
              <BarChart className="w-3.5 h-3.5" /> إحصائيات الأداء
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === "settings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveAdminTab("settings")}
            >
              <Settings className="w-3.5 h-3.5" /> الإعدادات والميزات
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>تسجيل الخروج</Button>
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
                <span>عنوان العرض</span>
                <Input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="مثال: عرض تطوير المنصة"
                  required
                />
              </label>
              <label>
                <span>اسم العميل</span>
                <Input
                  value={form.clientName}
                  onChange={(event) => updateField("clientName", event.target.value)}
                  placeholder="الشركة أو الشخص"
                  required
                />
              </label>
              <label>
                <span>انتهاء الصلاحية (اختياري)</span>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => updateField("expiresAt", event.target.value)}
                />
              </label>
              <label>
                <span>{form.id ? "كلمة سر جديدة (اتركها دون تغيير)" : "كلمة السر (اختيارية)"}</span>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  minLength={8}
                  disabled={form.removePassword}
                  placeholder="8 أحرف على الأقل"
                />
              </label>
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
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editorMode === "sections" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setEditorMode("sections")}
                  >
                    📑 الأقسام المستقلة ({sections.length})
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${editorMode === "raw" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setEditorMode("raw")}
                  >
                    📝 ماركداون خام
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
              <div className="proposal-sections-editor border border-border/60 rounded-xl p-4 bg-card/40 backdrop-blur-sm space-y-4">
                {/* Section Tabs Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/40 scrollbar-none">
                  {sections.map((sec, idx) => (
                    <button
                      key={sec.id}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${activeSectionId === sec.id ? "bg-primary/20 border-primary text-primary shadow" : "bg-card/80 border-border/60 text-muted-foreground hover:text-foreground"}`}
                      onClick={() => {
                        setActiveSectionId(sec.id);
                        setPreviewingSectionId(null);
                      }}
                    >
                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px]">{idx + 1}</span>
                      <span>{sec.title || `قسم ${idx + 1}`}</span>
                    </button>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs font-bold" onClick={addNewSection}>
                    + إضافة قسم
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
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-muted-foreground">عنوان هذا القسم</span>
                          <Input
                            value={activeSec.title}
                            onChange={(e) => updateSectionTitle(activeSec.id, e.target.value)}
                            placeholder="مثال: 1. نطاق العمل والتسليمات"
                            className="font-bold text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 self-end flex-wrap">
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
                            className="h-9 text-xs"
                            onClick={() => setPreviewingSectionId((prev) => (prev === activeSec.id ? null : activeSec.id))}
                          >
                            {previewingSectionId === activeSec.id ? "إخفاء المعاينة" : "👁 معاينة القسم"}
                          </Button>
                          {sections.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-9 text-xs"
                              onClick={() => removeSection(activeSec.id)}
                            >
                              🗑 حذف القسم
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
                          placeholder={`# ${activeSec.title}\n\nأكتب محتوى هذا القسم هنا...`}
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
                placeholder={"# عنوان العرض\n\nمرحباً بكم...\n\n## نطاق العمل"}
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
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.removePassword}
                      onChange={(event) => updateField("removePassword", event.target.checked)}
                    />
                    إزالة حماية كلمة السر
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.rotateToken}
                      onChange={(event) => updateField("rotateToken", event.target.checked)}
                    />
                    إلغاء الرابط القديم وإنشاء رابط جديد
                  </label>
                </>
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
            <div className="proposal-preview">
              <article className="proposal-document">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkAlerts]} components={proposalMarkdownComponents}>
                  {form.markdown || "ستظهر معاينة النص هنا."}
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
            <Button variant="outline" onClick={() => void loadItems()} disabled={busy}>تحديث</Button>
          </div>
          {items.length === 0 ? (
            <div className="proposal-empty">لا توجد عروض بعد. أنشئ العرض الأول من النموذج أعلاه.</div>
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
                  {items.map((item) => {
                    const expired = item.expiresAt && new Date(item.expiresAt) <= new Date();
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title}</strong>
                          <span>{item.clientName}</span>
                        </td>
                        <td>
                          <span className={`proposal-status ${!item.active || expired ? "is-off" : ""}`}>
                            {!item.active ? "موقوف" : expired ? "منتهي" : item.protected ? "محمي" : "فعّال"}
                          </span>
                          <small>{item.expiresAt ? `ينتهي ${formatDate(item.expiresAt)}` : "دون تاريخ انتهاء"}</small>
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
                          <Button size="sm" variant="outline" onClick={() => void copyLink(item.token)}>نسخ الرابط</Button>
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
        </>
        )}
      </main>
    </div>
  );
}
