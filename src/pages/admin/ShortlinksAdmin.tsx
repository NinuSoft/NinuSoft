import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLoading from "@/pages/admin/AdminLoading";
import {
  ApiError,
  createShortlink,
  deleteShortlink,
  listShortlinks,
  shortlinkUrl,
  updateShortlink,
  type Shortlink,
} from "@/lib/shortlinks-api";
import {
  Shield,
  ArrowLeft,
  LogOut,
  Plus,
  Copy,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  Link,
  FileText,
  Search,
  BarChart,
  CheckCircle,
  Clock,
} from "@/components/Icons";

type FormState = {
  id: string;
  targetUrl: string;
  code: string;
  expiresAt: string;
};

type ShortlinksAdminProps = {
  onNavigate?: (section: "proposals" | "shortlinks") => void;
  onLogout?: () => void;
};

type StatusFilter = "all" | "active" | "inactive" | "expired";

const emptyForm: FormState = { id: "", targetUrl: "", code: "", expiresAt: "" };

function isExpired(item: Shortlink) {
  return Boolean(item.expiresAt && new Date(item.expiresAt).getTime() <= Date.now());
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "دائم";
  return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ShortlinksAdmin({ onNavigate, onLogout }: ShortlinksAdminProps) {
  const [adminKey, setAdminKey] = useState(
    sessionStorage.getItem("ninusoft-admin-key") ||
      sessionStorage.getItem("ninusoft-shortlinks-admin-key") ||
      sessionStorage.getItem("ninusoft-proposals-admin-key") ||
      "",
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(Boolean(adminKey));
  const [items, setItems] = useState<Shortlink[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const loadItems = async (key = adminKey) => {
    const result = await listShortlinks(key);
    setItems(result.shortlinks);
    setAuthenticated(true);
    sessionStorage.setItem("ninusoft-admin-key", key);
    sessionStorage.setItem("ninusoft-shortlinks-admin-key", key);
  };

  useEffect(() => {
    document.title = "الروابط المختصرة | NinuSoft";
    if (adminKey) {
      void loadItems().catch(() => {
        sessionStorage.removeItem("ninusoft-admin-key");
        sessionStorage.removeItem("ninusoft-shortlinks-admin-key");
        setAuthenticated(false);
      }).finally(() => setCheckingSession(false));
    } else {
      setCheckingSession(false);
    }
    return () => {
      document.title = "NinuSoft";
    };
    // Initial session restoration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((item) => item.active && !isExpired(item)).length;
    return {
      active,
      inactive: items.length - active,
      clicks: items.reduce((total, item) => total + item.clickCount, 0),
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.code.toLowerCase().includes(query) ||
        item.targetUrl.toLowerCase().includes(query);
      const expired = isExpired(item);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.active && !expired) ||
        (statusFilter === "inactive" && !item.active && !expired) ||
        (statusFilter === "expired" && expired);
      return matchesQuery && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

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

  const logout = () => {
    sessionStorage.removeItem("ninusoft-admin-key");
    sessionStorage.removeItem("ninusoft-shortlinks-admin-key");
    sessionStorage.removeItem("ninusoft-proposals-admin-key");
    setAdminKey("");
    setAuthenticated(false);
    setItems([]);
    onLogout?.();
  };

  const saveShortlink = async (event: SyntheticEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const expiresAt = form.expiresAt ? new Date(form.expiresAt).toISOString() : null;
      if (form.id) {
        await updateShortlink(adminKey, form.id, { targetUrl: form.targetUrl, expiresAt });
        setMessage("تم تحديث الرابط بنجاح.");
      } else {
        const result = await createShortlink(adminKey, {
          targetUrl: form.targetUrl,
          code: form.code.trim() || undefined,
          expiresAt,
        });
        setMessage(`تم إنشاء الرابط: ${shortlinkUrl(result.shortlink.code)}`);
      }
      setForm(emptyForm);
      await loadItems();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر حفظ الرابط.");
    } finally {
      setBusy(false);
    }
  };

  const editShortlink = (item: Shortlink) => {
    setForm({
      id: item.id,
      targetUrl: item.targetUrl,
      code: item.code,
      expiresAt: item.expiresAt
        ? new Date(item.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (item: Shortlink) => {
    setBusy(true);
    setError("");
    try {
      await updateShortlink(adminKey, item.id, { active: !item.active });
      await loadItems();
    } catch {
      setError("تعذر تحديث حالة الرابط.");
    } finally {
      setBusy(false);
    }
  };

  const removeShortlink = async (item: Shortlink) => {
    if (!window.confirm(`هل أنت متأكد من حذف الرابط "${item.code}" نهائياً؟`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await deleteShortlink(adminKey, item.id);
      setMessage(`تم حذف الرابط "${item.code}" بنجاح.`);
      if (form.id === item.id) setForm(emptyForm);
      await loadItems();
    } catch {
      setError("تعذر حذف الرابط.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (item: Shortlink) => {
    await navigator.clipboard.writeText(shortlinkUrl(item.code));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 2000);
  };

  if (checkingSession) {
    return <AdminLoading />;
  }

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
          <span className="proposal-admin-eyebrow">لوحة الإدارة · الروابط</span>
          <h1>مرحباً بعودتك</h1>
          <p>أدخل مفتاح الإدارة للوصول إلى مساحة الروابط المختصرة.</p>
          <label htmlFor="shortlinks-admin-key">مفتاح الإدارة</label>
          <Input
            id="shortlinks-admin-key"
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
          <button
            type="button"
            className="shortlinks-login-switch"
            onClick={() => onNavigate?.("proposals")}
          >
            الانتقال إلى إدارة العروض
          </button>
          <small>اتصال مشفّر · وصول خاص بفريق NinuSoft</small>
        </form>
      </main>
    );
  }

  return (
    <div className="proposal-admin shortlinks-admin" dir="rtl">
      <aside className="proposal-admin-rail">
        <a className="proposal-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>NinuSoft <small>Admin workspace</small></span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <div className="proposal-admin-nav-group">
            <span className="proposal-admin-nav-label">الأقسام الرئيسية</span>
            <button type="button" onClick={() => onNavigate?.("proposals")}>
              <FileText className="h-4 w-4" />
              <span>العروض</span>
            </button>
            <button type="button" className="is-active">
              <Link className="h-4 w-4" />
              <span>الروابط المختصرة</span>
            </button>
          </div>
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
            className="proposal-admin-rail-logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="proposal-admin-logout-label">خروج</span>
          </button>
        </div>
      </aside>

      <div className="proposal-admin-workspace">
        <header className="proposal-admin-topbar">
          <div>
            <span className="proposal-admin-mobile-brand">NinuSoft Admin</span>
            <h1>الروابط المختصرة</h1>
            <p>أنشئ روابط نظيفة، راقب استخدامها وتحكّم بصلاحيتها من مكان واحد.</p>
          </div>
          <div className="proposal-admin-top-actions">
            <span className="proposal-admin-live"><i /> النظام متصل</span>
            <Button onClick={() => {
              setForm(emptyForm);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}>
              <Plus className="h-4 w-4" />
              رابط جديد
            </Button>
          </div>
        </header>

        <main>
          <section className="proposal-admin-overview" aria-label="ملخص الروابط">
            <div>
              <span className="proposal-stat-icon is-gold"><Link className="h-4 w-4" /></span>
              <p>إجمالي الروابط</p>
              <strong>{items.length}</strong>
              <small>كل الروابط المنشأة</small>
            </div>
            <div>
              <span className="proposal-stat-icon is-green"><CheckCircle className="h-4 w-4" /></span>
              <p>روابط فعّالة</p>
              <strong>{stats.active}</strong>
              <small>تستقبل الزوار الآن</small>
            </div>
            <div>
              <span className="proposal-stat-icon is-blue"><BarChart className="h-4 w-4" /></span>
              <p>إجمالي النقرات</p>
              <strong>{stats.clicks.toLocaleString("ar-IQ-u-nu-latn")}</strong>
              <small>عبر جميع الروابط</small>
            </div>
            <div>
              <span className="proposal-stat-icon is-purple"><Clock className="h-4 w-4" /></span>
              <p>غير متاحة</p>
              <strong>{stats.inactive}</strong>
              <small>موقوفة أو منتهية</small>
            </div>
          </section>

          {message && <p className="shortlinks-notice is-success">{message}</p>}
          {error && <p className="shortlinks-notice is-error">{error}</p>}

          <section className="shortlinks-create-card">
            <div className="shortlinks-create-intro">
              <span className="proposal-stat-icon is-gold"><Plus className="h-4 w-4" /></span>
              <div>
                <small>{form.id ? "تعديل الرابط" : "رابط جديد"}</small>
                <h2>{form.id ? `تحديث /s/${form.code}` : "اختصر رابطاً طويلاً"}</h2>
                <p>اكتب الوجهة واختر رمزاً واضحاً يسهل مشاركته وتذكره.</p>
              </div>
            </div>
            <form onSubmit={saveShortlink}>
              <label className="shortlinks-field is-wide">
                <span>الرابط الهدف</span>
                <Input
                  type="url"
                  required
                  dir="ltr"
                  placeholder="https://example.com/campaign"
                  value={form.targetUrl}
                  onChange={(event) => setForm((current) => ({ ...current, targetUrl: event.target.value }))}
                />
              </label>
              {!form.id && (
                <label className="shortlinks-field">
                  <span>الرمز المخصص <em>اختياري</em></span>
                  <div className="shortlinks-code-input" dir="ltr">
                    <b>ninusoft.com/s/</b>
                    <input
                      type="text"
                      pattern="[A-Za-z0-9_-]+"
                      placeholder="campaign"
                      value={form.code}
                      onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                    />
                  </div>
                </label>
              )}
              <label className="shortlinks-field">
                <span>تاريخ الانتهاء <em>اختياري</em></span>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
                />
              </label>
              <div className="shortlinks-form-actions">
                <Button type="submit" disabled={busy}>
                  <Plus className="h-4 w-4" />
                  {form.id ? "حفظ التعديلات" : "إنشاء الرابط"}
                </Button>
                {form.id && (
                  <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>
                    إلغاء
                  </Button>
                )}
              </div>
            </form>
          </section>

          <section className="shortlinks-list-card">
            <div className="shortlinks-list-head">
              <div>
                <span>مكتبة الروابط</span>
                <h2>روابطك المختصرة</h2>
              </div>
              <div className="shortlinks-list-tools">
                <label className="proposal-list-search">
                  <Search className="h-3.5 w-3.5" />
                  <input
                    type="search"
                    placeholder="ابحث بالرمز أو الوجهة…"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadItems()}
                  disabled={busy}
                  aria-label="تحديث القائمة"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                </Button>
                <div className="shortlinks-filters">
                  {([
                    ["all", "الكل"],
                    ["active", "فعّالة"],
                    ["inactive", "موقوفة"],
                    ["expired", "منتهية"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={statusFilter === value ? "is-active" : ""}
                      onClick={() => setStatusFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="shortlinks-empty">
                <Link className="h-6 w-6" />
                <strong>{items.length ? "لا توجد نتائج مطابقة" : "لا توجد روابط بعد"}</strong>
                <span>{items.length ? "جرّب تغيير البحث أو عامل التصفية." : "أنشئ رابطك الأول من النموذج أعلاه."}</span>
              </div>
            ) : (
              <div className="shortlinks-grid">
                {filteredItems.map((item) => {
                  const expired = isExpired(item);
                  const available = item.active && !expired;
                  return (
                    <article key={item.id} className="shortlink-card">
                      <div className="shortlink-card-top">
                        <div className="shortlink-code">
                          <span className="proposal-stat-icon is-gold"><Link className="h-4 w-4" /></span>
                          <div>
                            <strong dir="ltr">/s/{item.code}</strong>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void toggleActive(item)}
                          disabled={busy || expired}
                          className={`shortlink-status ${available ? "is-active" : ""}`}
                          title={expired ? "انتهت صلاحية الرابط" : "تغيير الحالة"}
                        >
                          <i />
                          {expired ? "منتهي" : item.active ? "فعّال" : "موقوف"}
                        </button>
                      </div>
                      <a
                        className="shortlink-target"
                        href={item.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        dir="ltr"
                        title={item.targetUrl}
                      >
                        {item.targetUrl}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <div className="shortlink-meta">
                        <span><BarChart className="h-3.5 w-3.5" /><b>{item.clickCount.toLocaleString("ar-IQ-u-nu-latn")}</b> نقرة</span>
                        <span><Clock className="h-3.5 w-3.5" />{item.expiresAt ? formatDate(item.expiresAt) : "بدون انتهاء"}</span>
                      </div>
                      <div className="shortlink-actions">
                        <Button size="sm" onClick={() => void copyLink(item)}>
                          <Copy className="h-3.5 w-3.5" />
                          {copiedId === item.id ? "تم النسخ" : "نسخ"}
                        </Button>
                        <a href={shortlinkUrl(item.code)} target="_blank" rel="noreferrer" aria-label="فتح الرابط المختصر">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button type="button" onClick={() => editShortlink(item)} aria-label="تعديل الرابط">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" className="is-danger" onClick={() => void removeShortlink(item)} aria-label="حذف الرابط">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
