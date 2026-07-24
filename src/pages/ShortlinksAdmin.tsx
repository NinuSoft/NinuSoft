import { SyntheticEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/Icons";

type FormState = {
  id: string;
  targetUrl: string;
  code: string;
  expiresAt: string;
};

const emptyForm: FormState = { id: "", targetUrl: "", code: "", expiresAt: "" };

function formatDate(value: string | null | undefined): string {
  if (!value) return "لا يوجد";
  return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ShortlinksAdmin() {
  const [adminKey, setAdminKey] = useState(
    sessionStorage.getItem("ninusoft-shortlinks-admin-key") || "",
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<Shortlink[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadItems = async (key = adminKey) => {
    const result = await listShortlinks(key);
    setItems(result.shortlinks);
    setAuthenticated(true);
    sessionStorage.setItem("ninusoft-shortlinks-admin-key", key);
  };

  useEffect(() => {
    document.title = "الروابط المختصرة | NinuSoft";
    if (adminKey) {
      void loadItems().catch(() => {
        sessionStorage.removeItem("ninusoft-shortlinks-admin-key");
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

  const logout = () => {
    sessionStorage.removeItem("ninusoft-shortlinks-admin-key");
    setAdminKey("");
    setAuthenticated(false);
    setItems([]);
  };

  const saveShortlink = async (event: SyntheticEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const expiresAt = form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : null;
      if (form.id) {
        await updateShortlink(adminKey, form.id, {
          targetUrl: form.targetUrl,
          expiresAt,
        });
        setMessage("تم تحديث الرابط.");
      } else {
        const result = await createShortlink(adminKey, {
          targetUrl: form.targetUrl,
          code: form.code || undefined,
          expiresAt,
        });
        setMessage(`تم إنشاء الرابط: ${shortlinkUrl(result.shortlink.code)}`);
      }
      setForm(emptyForm);
      await loadItems();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "تعذر حفظ الرابط.",
      );
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
    if (!window.confirm(`هل أنت متأكد من حذف الرابط "${item.code}" نهائياً؟`)) {
      return;
    }
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
    setMessage("تم نسخ الرابط المختصر.");
    setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 2000);
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
          <span className="proposal-admin-eyebrow">الروابط المختصرة</span>
          <h1>مرحباً بعودتك</h1>
          <p>أدخل مفتاح الإدارة للوصول إلى الروابط المختصرة.</p>
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
    <div className="min-h-screen bg-background p-4 md:p-8 dir-rtl text-start" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">الروابط المختصرة</h1>
            <p className="text-xs text-muted-foreground">إنشاء وإدارة روابط ninusoft.com/s/*</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => void loadItems()} className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> تحديث
            </Button>
            <Button size="sm" variant="ghost" onClick={logout} className="flex items-center gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> خروج
            </Button>
          </div>
        </div>

        {message && <p className="text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">{message}</p>}
        {error && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">{error}</p>}

        <form onSubmit={saveShortlink} className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            {form.id ? "تعديل الرابط" : "رابط جديد"}
          </h2>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground block">الرابط الهدف</label>
            <Input
              type="url"
              required
              placeholder="https://example.com/campaign"
              value={form.targetUrl}
              onChange={(event) => setForm((current) => ({ ...current, targetUrl: event.target.value }))}
            />
          </div>
          {!form.id && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground block">
                رمز مخصص (اختياري)
              </label>
              <Input
                type="text"
                placeholder="promo2026"
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground block">تاريخ الانتهاء (اختياري)</label>
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" size="sm" disabled={busy} className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> {form.id ? "حفظ التعديل" : "إنشاء الرابط"}
            </Button>
            {form.id && (
              <Button type="button" size="sm" variant="outline" onClick={() => setForm(emptyForm)}>
                إلغاء
              </Button>
            )}
          </div>
        </form>

        <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border/60">
                <th className="text-start p-3 font-bold">الرابط المختصر</th>
                <th className="text-start p-3 font-bold">الهدف</th>
                <th className="text-start p-3 font-bold">النقرات</th>
                <th className="text-start p-3 font-bold">الحالة</th>
                <th className="text-start p-3 font-bold">الانتهاء</th>
                <th className="text-start p-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground text-xs">
                    لا توجد روابط بعد.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/40 last:border-0">
                  <td className="p-3 font-mono text-xs text-primary/90">/s/{item.code}</td>
                  <td className="p-3 max-w-xs truncate text-xs text-muted-foreground" title={item.targetUrl}>
                    {item.targetUrl}
                  </td>
                  <td className="p-3 text-xs">{item.clickCount}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => void toggleActive(item)}
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        item.active
                          ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                          : "border-border text-muted-foreground bg-muted"
                      }`}
                    >
                      {item.active ? "فعال" : "موقوف"}
                    </button>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDate(item.expiresAt)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="outline" onClick={() => void copyLink(item)} aria-label="نسخ الرابط">
                        <Copy className="h-3.5 w-3.5" />
                        {copiedId === item.id && <span className="text-[10px] ms-1">تم</span>}
                      </Button>
                      <a href={shortlinkUrl(item.code)} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" aria-label="فتح الرابط" type="button">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                      <Button size="sm" variant="outline" onClick={() => editShortlink(item)} aria-label="تعديل">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void removeShortlink(item)} aria-label="حذف">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
