import { RefreshCw, Shield } from "@/components/Icons";

export default function AdminLoading() {
  return (
    <main className="proposal-admin-login" dir="rtl">
      <div className="proposal-login-glow" />
      <div
        className="admin-session-loading"
        role="status"
        aria-live="polite"
        aria-label="جاري استعادة جلسة الإدارة"
      >
        <a className="proposal-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>NinuSoft</span>
        </a>
        <div className="admin-session-loading-icon">
          <Shield className="h-5 w-5" />
          <RefreshCw className="h-3 w-3 animate-spin" />
        </div>
        <span className="proposal-admin-eyebrow">لوحة الإدارة</span>
        <h1>جاري استعادة الجلسة</h1>
        <p>يتم التحقق من صلاحية الوصول وتحميل مساحة العمل.</p>
        <div className="admin-session-loading-bar"><i /></div>
      </div>
    </main>
  );
}
