import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "@/components/Mermaid";

const markdownComponents = {
  pre(props: any) {
    const { children } = props;
    if (
      children &&
      typeof children === "object" &&
      "props" in children &&
      children.props?.className?.includes("language-mermaid")
    ) {
      const code = String(children.props.children || "");
      return <Mermaid chart={code} />;
    }
    return <pre {...props}>{children}</pre>;
  },
  code(props: any) {
    const { children, className, ...rest } = props;
    if (className?.includes("language-mermaid")) {
      return <Mermaid chart={String(children || "")} />;
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
};

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

  const readMarkdownFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const markdown = await file.text();
    setForm((current) => ({
      ...current,
      markdown,
      title: current.title || file.name.replace(/\.md(?:own)?$/i, ""),
    }));
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
        <div>
          <span>لوحة عروض العملاء</span>
          <Button variant="ghost" size="sm" onClick={logout}>تسجيل الخروج</Button>
        </div>
      </header>

      <main>
        <section className="proposal-editor">
          <div className="proposal-admin-section-title">
            <div>
              <span>{form.id ? "تعديل مباشر" : "عرض جديد"}</span>
              <h1>{form.id ? "تحديث عرض العميل" : "إنشاء عرض Markdown"}</h1>
            </div>
            {form.id && (
              <Button variant="outline" onClick={() => setForm(emptyForm)}>
                إلغاء التعديل
              </Button>
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
                <span>محتوى Markdown</span>
                <small>يدعم العناوين، الجداول، القوائم، الروابط، والأكواد.</small>
              </div>
              <label className="proposal-file-button">
                رفع ملف .md
                <input type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={readMarkdownFile} />
              </label>
            </div>
            <Textarea
              className="proposal-markdown-editor"
              dir="auto"
              value={form.markdown}
              onChange={(event) => updateField("markdown", event.target.value)}
              placeholder={"# عنوان العرض\n\nمرحباً بكم...\n\n## نطاق العمل"}
              required
            />

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
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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
                        <td>
                          <Button size="sm" variant="outline" onClick={() => void copyLink(item.token)}>نسخ الرابط</Button>
                          <Button size="sm" variant="ghost" onClick={() => void editProposal(item.id)}>تعديل</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
