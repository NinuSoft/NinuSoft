import { FileText, BarChart, Settings, Link, LogOut } from "@/components/Icons";

type AdminRailProps = {
  currentSection: "proposals" | "shortlinks";
  activeProposalTab?: "editor" | "analytics" | "settings";
  unresolvedCount?: number;
  onNavigateSection: (section: "proposals" | "shortlinks") => void;
  onSelectProposalTab?: (tab: "editor" | "analytics" | "settings") => void;
  onLogout: () => void;
};

export function AdminRail({
  currentSection,
  activeProposalTab = "editor",
  unresolvedCount = 0,
  onNavigateSection,
  onSelectProposalTab,
  onLogout,
}: AdminRailProps) {
  return (
    <aside className="proposal-admin-rail">
      <a className="proposal-brand" href="/">
        <img src="/logo.png" alt="" />
        <span>
          NinuSoft <small>Admin workspace</small>
        </span>
      </a>

      <nav aria-label="التنقل الرئيسي">
        <div className="proposal-admin-nav-group">
          <span className="proposal-admin-nav-label">الأقسام الرئيسية</span>

          {/* Proposals Nav Button */}
          <button
            type="button"
            className={
              currentSection === "proposals"
                ? activeProposalTab === "editor"
                  ? "is-active"
                  : "is-parent-active"
                : ""
            }
            onClick={() => {
              if (currentSection !== "proposals") {
                onNavigateSection("proposals");
              } else {
                onSelectProposalTab?.("editor");
              }
            }}
          >
            <FileText className="h-4 w-4" />
            <span>العروض</span>
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-black border border-amber-400 animate-pulse ms-auto shrink-0 shadow-sm">
                {unresolvedCount}
              </span>
            )}
          </button>

          {/* Proposal Sub-items (Analytics & Settings) */}
          {currentSection === "proposals" && (
            <div
              className="proposal-admin-nav-group is-secondary"
              aria-label="أدوات العروض"
            >
              {[
                { id: "analytics" as const, label: "التحليلات", icon: BarChart },
                { id: "settings" as const, label: "الإعدادات", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeProposalTab === tab.id ? "is-active" : ""}
                    onClick={() => onSelectProposalTab?.(tab.id)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Shortlinks Nav Button */}
          <button
            type="button"
            className={currentSection === "shortlinks" ? "is-active" : ""}
            onClick={() => onNavigateSection("shortlinks")}
          >
            <Link className="h-4 w-4" />
            <span>الروابط المختصرة</span>
          </button>
        </div>
      </nav>

      {/* Rail Footer */}
      <div className="proposal-admin-rail-footer">
        <div className="proposal-admin-avatar">NS</div>
        <div>
          <strong>فريق NinuSoft</strong>
          <span>مسؤول النظام</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
          className="proposal-admin-rail-logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="proposal-admin-logout-label">خروج</span>
        </button>
      </div>
    </aside>
  );
}
