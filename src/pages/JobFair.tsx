import React, { useEffect, useState } from "react";

export interface StatItem {
  val: string;
  lbl: string;
}

export interface CategoryItem {
  title: string;
  desc: string;
  icon: string;
}

export interface JobFairState {
  siteTitle: string;
  siteSubtitle: string;
  heroTitle: string;
  heroYear: string;
  heroSubtitle: string;
  heroBadge: string;
  heroDate: string;
  heroLocation: string;
  heroLocationUrl: string;
  heroDesc: string;
  locDateDesc: string;
  locTimeDesc: string;
  locAddressDesc: string;
  registerUrl: string;
  registerBtnText: string;
  announcementText: string;
  announcementBadge: string;
  showAnnouncement: boolean;
  showCountdown: boolean;
  countdownTargetDate: string;
  bgDark: string;
  cardDark: string;
  colorGold: string;
  colorBlue: string;
  colorRed: string;
  colorNavy: string;
  showShapes: boolean;
  showNinusoftBadge: boolean;
  stats: StatItem[];
  sectors: string[];
  categories: CategoryItem[];
  partners: string[];
}

const STORAGE_KEY = "ninusoft_baghdad_fair_state_v1";

const DEFAULT_STATE: JobFairState = {
  siteTitle: "معرض بغداد للتوظيف 2026",
  siteSubtitle: "وزارة الشباب والرياضة",
  heroTitle: "معرض بغداد للتوظيف",
  heroYear: "2026",
  heroSubtitle: "الشباب أولاً",
  heroBadge: "فرصتك تبدأ بخطوة",
  heroDate: "17 - 20 تشرين الثاني 2026",
  heroLocation: "مقر وزارة الشباب والرياضة - بغداد",
  heroLocationUrl: "https://maps.app.goo.gl/cfdPqkMUqFTqPRNFA?g_st=aw",
  heroDesc:
    "تعلن وزارة الشباب والرياضة عن إقامة معرض بغداد للتوظيف 2026، بمشاركة أكثر من 90 شركة، وبما يوفر أكثر من 2000 فرصة عمل بالتعاون وبالشراكة مع مشروع تعزيز التحول الاقتصادي في العراق (SET)، المموّل من قبل BMZ والمنفّذ من قبل GIZ.",
  locDateDesc: "من 17 إلى 20 تشرين الثاني 2026 (على مدى أربعة أيام)",
  locTimeDesc: "من 10 صباحاً وحتى 5 مساءً يومياً",
  locAddressDesc: "بغداد - مقر وزارة الشباب والرياضة / دائرة شؤون الأقاليم والمحافظات",
  registerUrl: "https://forms.gle/k7EBYEjJF9tkR5aT6",
  registerBtnText: "سجّل الآن",
  announcementText:
    "تجهيز وطباعة السيرة الذاتية (CV) متوفرة مجاناً طيلة أيام المعرض برعاية دائرة الرعاية العلمية",
  announcementBadge: "هام جداً",
  showAnnouncement: true,
  showCountdown: true,
  countdownTargetDate: "2026-11-17T10:00:00",
  bgDark: "#0c1017",
  cardDark: "#121722",
  colorGold: "#d9a520",
  colorBlue: "#2563eb",
  colorRed: "#e63926",
  colorNavy: "#162032",
  showShapes: true,
  showNinusoftBadge: true,
  stats: [
    { val: "+90", lbl: "شركة مشاركة" },
    { val: "+2000", lbl: "فرصة عمل" },
    { val: "4", lbl: "أيام متتالية" },
    { val: "CV", lbl: "طباعة وتجهيز مجاني" },
  ],
  sectors: [
    "التقنية",
    "المصرفية",
    "الصحية",
    "الإعلامية",
    "الصناعية",
    "الهندسية",
    "التجارية",
  ],
  categories: [
    {
      title: "خدمة السيرة الذاتية (CV)",
      desc: "تقدم دائرة الرعاية العلمية خدمة طباعة وتجهيز السيرة الذاتية بشكل مجاني لجميع الباحثين عن عمل.",
      icon: "file-text",
    },
    {
      title: "ورش وجلسات حوارية",
      desc: "لقاءات مباشرة وجلسات تطوير مهارات يقدمها نخبة من الخبراء والاستشاريين لتأهيل الشباب سوق العمل.",
      icon: "users",
    },
    {
      title: "البازارات والبيع المباشر",
      desc: "عروض متميزة للمشاريع الشبابية الناشئة والأعمال الريادية مع إمكانية الشراء المباشر لدعم الطاقة المحلية.",
      icon: "shopping-bag",
    },
  ],
  partners: [
    "وزارة الشباب والرياضة العراقية",
    "الوزارة الاتحادية الألمانية للتعاون الاقتصادي والتنمية BMZ",
    "الوكالة الألمانية للتعاون الدولي GIZ",
    "مشروع تعزيز التحول الاقتصادي في العراق SET",
  ],
};

type AdminTab =
  | "general"
  | "announcement"
  | "sectors"
  | "categories"
  | "stats"
  | "partners"
  | "styles"
  | "json";

function DynamicIcon({ name, className = "w-6 h-6" }: { name: string; className?: string }) {
  const key = (name || "star").trim().toLowerCase();
  const baseProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (key) {
    case "file-text":
      return (
        <svg {...baseProps}>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a1 1 0 0 0 1 1h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      );
    case "users":
      return (
        <svg {...baseProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "shopping-bag":
      return (
        <svg {...baseProps}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...baseProps}>
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...baseProps}>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M19 17v4" />
          <path d="M3 5h4" />
          <path d="M17 19h4" />
        </svg>
      );
    case "building-2":
      return (
        <svg {...baseProps}>
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <path d="M10 6h4" />
          <path d="M10 10h4" />
          <path d="M10 14h4" />
          <path d="M10 18h4" />
        </svg>
      );
    default:
      return (
        <svg {...baseProps}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

export default function JobFair() {
  const [state, setState] = useState<JobFairState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...DEFAULT_STATE, ...JSON.parse(saved) };
        } catch {
          // ignore invalid JSON
        }
      }
    }
    return DEFAULT_STATE;
  });

  const [draftState, setDraftState] = useState<JobFairState>(state);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("general");
  const [jsonText, setJsonText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Set RTL and Arabic document metadata
  useEffect(() => {
    const prevDir = document.documentElement.dir;
    const prevLang = document.documentElement.lang;
    const prevTitle = document.title;

    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
    document.title = `${state.siteTitle} | NinuSoft`;

    return () => {
      document.documentElement.dir = prevDir || "en";
      document.documentElement.lang = prevLang || "en";
      document.title = prevTitle;
    };
  }, [state.siteTitle]);

  // Open admin modal on #admin or Ctrl+Shift+A
  useEffect(() => {
    if (window.location.hash === "#admin") {
      setDraftState(state);
      setJsonText(JSON.stringify(state, null, 2));
      setIsAdminOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setDraftState(state);
        setJsonText(JSON.stringify(state, null, 2));
        setIsAdminOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  // Live Countdown Timer
  useEffect(() => {
    const updateTimer = () => {
      const target = new Date(state.countdownTargetDate || "2026-11-17T10:00:00").getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({
          days: String(d).padStart(2, "0"),
          hours: String(h).padStart(2, "0"),
          minutes: String(m).padStart(2, "0"),
          seconds: String(s).padStart(2, "0"),
        });
      } else {
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.countdownTargetDate]);

  const openAdmin = () => {
    setDraftState(JSON.parse(JSON.stringify(state)));
    setJsonText(JSON.stringify(state, null, 2));
    setIsAdminOpen(true);
  };

  const saveAdminChanges = () => {
    setState(draftState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftState));
    setIsAdminOpen(false);
  };

  const resetDefaults = () => {
    if (window.confirm("هل أنت متأكد من استعادة كافة البيانات الافتراضية؟")) {
      localStorage.removeItem(STORAGE_KEY);
      setState(DEFAULT_STATE);
      setDraftState(DEFAULT_STATE);
      setJsonText(JSON.stringify(DEFAULT_STATE, null, 2));
      setIsAdminOpen(false);
    }
  };

  const exportJSONFile = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftState, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "baghdad_fair_ninusoft_config.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const importJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result));
        const merged = { ...DEFAULT_STATE, ...parsed };
        setState(merged);
        setDraftState(merged);
        setJsonText(JSON.stringify(merged, null, 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        alert("تم استيراد وتطبيق ملف الـ JSON بنجاح!");
      } catch {
        alert("خطأ في قراءة ملف الـ JSON!");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const importJSONFromTextarea = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const merged = { ...DEFAULT_STATE, ...parsed };
      setState(merged);
      setDraftState(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      alert("تم تطبيق البيانات من نص الـ JSON بنجاح!");
    } catch {
      alert("صيغة JSON غير صحيحة!");
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', 'Inter', sans-serif",
        backgroundColor: state.bgDark || "#0c1017",
        ["--jf-gold" as string]: state.colorGold || "#d9a520",
        ["--jf-blue" as string]: state.colorBlue || "#2563eb",
        ["--jf-red" as string]: state.colorRed || "#e63926",
        ["--jf-navy" as string]: state.colorNavy || "#162032",
        ["--jf-card" as string]: state.cardDark || "#121722",
      }}
      className="min-h-screen flex flex-col text-slate-100 relative overflow-x-hidden selection:bg-[#d9a520]/30"
    >
      {/* NinuSoft Luxury Ambient Background Grid & Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div
          className="absolute top-1/4 right-1/4 w-[480px] h-[480px] rounded-full blur-[140px] opacity-20"
          style={{ backgroundColor: state.colorGold }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[520px] h-[520px] rounded-full blur-[160px] opacity-15"
          style={{ backgroundColor: state.colorBlue }}
        />
      </div>

      {/* 1. Top Announcement Banner */}
      {state.showAnnouncement && (
        <div
          className="relative z-40 py-2.5 px-4 border-b"
          style={{
            background: `linear-gradient(90deg, ${state.colorNavy}, #1a1508, ${state.colorNavy})`,
            borderColor: `${state.colorGold}40`,
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3 text-center text-xs sm:text-sm font-bold">
            <span
              className="px-3 py-0.5 rounded-full font-black text-xs shadow-sm"
              style={{
                backgroundColor: state.colorGold,
                color: "#0c1017",
              }}
            >
              {state.announcementBadge}
            </span>
            <p className="m-0 leading-normal text-slate-100">{state.announcementText}</p>
          </div>
        </div>
      )}

      {/* 2. Header Navigation */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors"
        style={{
          backgroundColor: `${state.bgDark}e6`,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logos: Baghdad Job Fair + NinuSoft */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Baghdad Job Fair Geometric Arch Logo */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 rounded-xl bg-white/[0.03] border border-white/10 p-1.5 shadow-inner">
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow">
                <path
                  d="M 10 120 V 50 A 40 40 0 0 1 90 50 V 120 H 70 V 50 A 20 20 0 0 0 30 50 V 120 Z"
                  fill={state.colorGold}
                />
                <path
                  d="M 30 120 V 60 A 20 20 0 0 1 70 60 V 120 H 55 V 60 A 5 5 0 0 0 45 60 V 120 Z"
                  fill="#ffffff"
                  fillOpacity="0.9"
                />
                <path
                  d="M 38 120 V 85 A 12 12 0 0 1 62 85 V 120 Z"
                  fill={state.colorBlue}
                />
                <path
                  d="M 60 120 V 100 A 8 8 0 0 1 76 100 V 120 Z"
                  fill={state.colorRed}
                />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-base sm:text-xl text-white leading-tight">
                  {state.siteTitle}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs font-bold" style={{ color: state.colorGold }}>
                  {state.siteSubtitle}
                </p>
                {state.showNinusoftBadge && (
                  <>
                    <span className="text-white/20">•</span>
                    <a
                      href="/"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white transition bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-full border border-white/10"
                      title="NinuSoft — نينوسوفت"
                    >
                      <img src="/logo.png" alt="NinuSoft" className="w-3.5 h-3.5 object-contain" />
                      <span>
                        نينو<span style={{ color: state.colorGold }}>سوفت</span>
                      </span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-bold text-slate-300 text-sm lg:text-base">
            <a href="#about" className="hover:text-[#d9a520] transition">
              عن المعرض
            </a>
            <a href="#stats" className="hover:text-[#d9a520] transition">
              الأرقام
            </a>
            <a href="#sectors" className="hover:text-[#d9a520] transition">
              القطاعات
            </a>
            <a href="#features" className="hover:text-[#d9a520] transition">
              الفعاليات
            </a>
            <a href="#location" className="hover:text-[#d9a520] transition">
              التوقيت والموقع
            </a>
            <a href="#partners" className="hover:text-[#d9a520] transition">
              الشركاء
            </a>
          </nav>

          {/* CTA & Mobile Menu Button */}
          <div className="flex items-center gap-2.5">
            <a
              href={state.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: state.colorGold,
                color: "#0c1017",
              }}
              className="px-4 sm:px-5 py-2.5 font-black rounded-xl shadow-lg shadow-[#d9a520]/20 hover:brightness-110 transition flex items-center gap-2 text-xs sm:text-sm"
            >
              <span>{state.registerBtnText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition"
              aria-label="القائمة"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                {mobileMenuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 5h16" />
                    <path d="M4 12h16" />
                    <path d="M4 19h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-2"
            style={{
              backgroundColor: state.cardDark,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {[
              { label: "عن المعرض", href: "#about" },
              { label: "الأرقام والإحصائيات", href: "#stats" },
              { label: "القطاعات المشمولة", href: "#sectors" },
              { label: "أقسام وفعاليات المعرض", href: "#features" },
              { label: "تفاصيل الحضور والتوقيت", href: "#location" },
              { label: "الشركاء والجهات المنظمة", href: "#partners" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg font-bold text-sm text-slate-200 hover:bg-white/5 hover:text-[#d9a520] transition"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* 3. Top Geometric Banner Strip */}
      {state.showShapes && (
        <div
          className="relative z-10 w-full py-3 border-b overflow-hidden"
          style={{
            backgroundColor: `${state.cardDark}99`,
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center opacity-90 h-9 sm:h-10 gap-2">
            <svg viewBox="0 0 800 60" className="w-full h-full">
              <circle
                cx="30"
                cy="30"
                r="22"
                fill="none"
                stroke={state.colorGold}
                strokeWidth="12"
              />
              <path d="M 80 30 A 20 20 0 0 1 120 30 Z" fill={state.colorBlue} />
              <path d="M 80 35 A 20 20 0 0 0 120 35 Z" fill={state.colorGold} />
              <rect x="145" y="10" width="30" height="40" rx="15" fill="#1e293b" />
              <rect x="153" y="18" width="14" height="24" rx="7" fill={state.colorGold} />
              <rect x="190" y="10" width="30" height="40" rx="15" fill={state.colorBlue} />
              <rect x="198" y="18" width="14" height="24" rx="7" fill={state.colorGold} />
              <circle cx="250" cy="30" r="18" fill={state.colorGold} />
              <path d="M 285 45 V 25 A 15 15 0 0 1 315 25 V 45 Z" fill={state.colorRed} />
              <circle
                cx="360"
                cy="30"
                r="22"
                fill="none"
                stroke={state.colorBlue}
                strokeWidth="12"
              />
              <path d="M 410 30 A 20 20 0 0 1 450 30 Z" fill={state.colorGold} />
              <rect x="475" y="10" width="30" height="40" rx="15" fill={state.colorGold} />
              <rect x="483" y="18" width="14" height="24" rx="7" fill="#0c1017" />
              <rect x="520" y="10" width="30" height="40" rx="15" fill="#1e293b" />
              <rect x="528" y="18" width="14" height="24" rx="7" fill={state.colorRed} />
              <circle cx="580" cy="30" r="18" fill={state.colorRed} />
              <path d="M 615 45 V 25 A 15 15 0 0 1 645 25 V 45 Z" fill={state.colorBlue} />
              <circle
                cx="690"
                cy="30"
                r="22"
                fill="none"
                stroke={state.colorGold}
                strokeWidth="12"
              />
              <path d="M 740 30 A 20 20 0 0 1 780 30 Z" fill={state.colorBlue} />
            </svg>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {/* 4. Hero Section */}
        <section
          id="about"
          className="relative py-12 lg:py-20 overflow-hidden border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Right Column: Hero Text & Actions */}
              <div className="lg:col-span-7 space-y-6 text-right">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border"
                  style={{
                    backgroundColor: `${state.colorGold}15`,
                    borderColor: `${state.colorGold}40`,
                    color: state.colorGold,
                  }}
                >
                  <DynamicIcon name="sparkles" className="w-4 h-4" />
                  <span>{state.heroBadge}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                  {state.heroTitle}{" "}
                  <span style={{ color: state.colorGold }}>{state.heroYear}</span>
                </h1>

                <h2
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: state.colorGold }}
                >
                  {state.heroSubtitle}
                </h2>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-medium">
                  {state.heroDesc}
                </p>

                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  {/* Primary Register CTA */}
                  <a
                    href={state.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: state.colorGold,
                      color: "#0c1017",
                    }}
                    className="px-8 py-3.5 font-black text-lg rounded-2xl shadow-xl shadow-[#d9a520]/25 hover:brightness-110 hover:-translate-y-0.5 transition flex items-center gap-3"
                  >
                    <span>{state.registerBtnText}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="m12 19-7-7 7-7" />
                      <path d="M19 12H5" />
                    </svg>
                  </a>

                  {/* Date Card */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border shadow-sm"
                    style={{
                      backgroundColor: state.cardDark,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${state.colorGold}20`,
                        color: state.colorGold,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 font-semibold">التاريخ</div>
                      <div className="font-bold text-white">{state.heroDate}</div>
                    </div>
                  </div>

                  {/* Location with Google Maps Link */}
                  <a
                    href={state.heroLocationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: state.cardDark,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border shadow-sm hover:border-[#d9a520]/60 transition group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition"
                      style={{
                        backgroundColor: `${state.colorBlue}25`,
                        color: "#60a5fa",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 font-semibold flex items-center gap-1">
                        <span>المكان</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3 text-[#d9a520]"
                        >
                          <path d="M15 3h6v6" />
                          <path d="M10 14 21 3" />
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                      </div>
                      <div className="font-bold text-white group-hover:text-[#d9a520] transition">
                        {state.heroLocation}
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Left Column: Visual Composition Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  className="relative w-full max-w-sm aspect-[4/5] rounded-3xl shadow-2xl p-8 overflow-hidden flex flex-col justify-between border"
                  style={{
                    backgroundColor: state.cardDark,
                    borderColor: `${state.colorGold}35`,
                    boxShadow: `0 25px 60px -15px rgba(0,0,0,0.7), 0 0 40px ${state.colorGold}12`,
                  }}
                >
                  {/* Ambient top glow inside card */}
                  <div
                    className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
                    style={{ backgroundColor: state.colorGold }}
                  />

                  {/* Top NinuSoft + Job Fair Header inside card */}
                  {state.showNinusoftBadge && (
                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src="/logo.png"
                          alt="NinuSoft"
                          className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(217,165,32,0.4)]"
                        />
                        <span className="text-xs font-extrabold tracking-tight text-white">
                          Ninu<span style={{ color: state.colorGold }}>Soft</span>
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${state.colorGold}15`,
                          borderColor: `${state.colorGold}35`,
                          color: state.colorGold,
                        }}
                      >
                        بغداد 2026
                      </span>
                    </div>
                  )}

                  {state.showShapes && (
                    <div className="relative z-10 my-auto flex flex-col items-center justify-center gap-4 py-2">
                      <svg viewBox="0 0 200 240" className="w-44 h-56 drop-shadow-xl">
                        <path
                          d="M 20 240 V 100 A 80 80 0 0 1 180 100 V 240 H 145 V 100 A 45 45 0 0 0 55 100 V 240 Z"
                          fill={state.colorGold}
                        />
                        <path
                          d="M 55 240 V 110 A 45 45 0 0 1 145 110 V 240 H 115 V 110 A 15 15 0 0 0 85 110 V 240 Z"
                          fill="#1e293b"
                        />
                        <path
                          d="M 75 240 V 155 A 25 25 0 0 1 125 155 V 240 Z"
                          fill={state.colorBlue}
                        />
                        <path
                          d="M 90 240 V 170 A 10 10 0 0 1 110 170 V 240 Z"
                          fill={state.cardDark}
                        />
                        <path
                          d="M 120 240 V 195 A 18 18 0 0 1 156 195 V 240 Z"
                          fill={state.colorRed}
                        />
                        <path
                          d="M 140 240 V 210 A 10 10 0 0 1 160 210 V 240 Z"
                          fill="#f8fafc"
                        />
                      </svg>
                      <div className="text-center font-black text-white text-lg tracking-wider">
                        JOB FAIR <span style={{ color: state.colorGold }}>{state.heroYear}</span>
                      </div>
                    </div>
                  )}

                  <div
                    className="relative z-10 text-center p-3 rounded-2xl border"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <p className="font-black text-sm" style={{ color: state.colorGold }}>
                      فرصتك تبدأ بخطوة .. بغداد 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Countdown Timer Section */}
        {state.showCountdown && (
          <section
            className="py-10 border-b relative overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${state.colorNavy}80, ${state.cardDark})`,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h3
                className="text-xl sm:text-2xl font-black mb-6 flex items-center justify-center gap-2"
                style={{ color: state.colorGold }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <line x1="10" x2="14" y1="2" y2="2" />
                  <line x1="12" x2="15" y1="14" y2="11" />
                  <circle cx="12" cy="14" r="8" />
                </svg>
                <span>الوقت المتبقي لانطلاق المعرض</span>
              </h3>

              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
                dir="rtl"
              >
                {[
                  { val: countdown.days, label: "يوم", highlight: false },
                  { val: countdown.hours, label: "ساعة", highlight: false },
                  { val: countdown.minutes, label: "دقيقة", highlight: false },
                  { val: countdown.seconds, label: "ثانية", highlight: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="backdrop-blur-md p-4 rounded-2xl border shadow-inner"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: item.highlight
                        ? `${state.colorGold}60`
                        : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <span
                      className="block text-3xl sm:text-4xl font-black font-mono"
                      style={{ color: item.highlight ? state.colorGold : "#ffffff" }}
                    >
                      {item.val}
                    </span>
                    <label className="text-xs sm:text-sm font-bold text-slate-400 mt-1 block">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. Stats Counter Section */}
        <section
          id="stats"
          className="py-12 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {state.stats.map((stat, idx) => {
                const colors = [
                  state.colorGold,
                  "#f8fafc",
                  state.colorGold,
                  "#60a5fa",
                ];
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl text-center border transition hover:-translate-y-0.5"
                    style={{
                      backgroundColor: state.cardDark,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="text-3xl sm:text-4xl font-black mb-1.5"
                      style={{ color: colors[idx % colors.length] }}
                    >
                      {stat.val}
                    </div>
                    <div className="text-sm font-bold text-slate-300">{stat.lbl}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. Sectors Section */}
        <section
          id="sectors"
          className="py-16 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-black text-white mb-3">
                القطاعات المشمولة بالتوظيف
              </h2>
              <p className="text-slate-400 font-medium">
                يغطي المعرض العديد من التخصصات والقطاعات الحيوية لتلبية تطلعات الكفاءات والشباب:
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {state.sectors.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: state.cardDark,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                  className="px-6 py-3.5 rounded-2xl border shadow-sm font-bold text-white flex items-center gap-2.5 hover:border-[#d9a520]/50 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={state.colorGold}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{sec}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Dynamic Sections & Categories Section */}
        <section id="features" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-black text-white mb-3">أقسام وفعاليات المعرض</h2>
              <p className="text-slate-400 font-medium">
                مجموعة متنوعة من الخدمات والفعاليات المصممة لدعم الشباب والباحثين عن عمل.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {state.categories.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: state.cardDark,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                  className="p-8 rounded-3xl border hover:border-[#d9a520]/40 transition text-right flex flex-col"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border"
                    style={{
                      backgroundColor: `${state.colorGold}15`,
                      borderColor: `${state.colorGold}30`,
                      color: state.colorGold,
                    }}
                  >
                    <DynamicIcon name={cat.icon} className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{cat.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Location & Details Section */}
        <section
          id="location"
          className="py-16 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border"
              style={{
                background: `linear-gradient(135deg, ${state.cardDark}, ${state.colorNavy})`,
                borderColor: `${state.colorGold}35`,
              }}
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <h2 className="text-3xl font-black text-white mb-6">
                    تفاصيل الحضور والتوقيت
                  </h2>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${state.colorGold}15`,
                          borderColor: `${state.colorGold}30`,
                          color: state.colorGold,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">التاريخ</h4>
                        <p className="text-slate-300 text-sm sm:text-base">
                          {state.locDateDesc}
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${state.colorGold}15`,
                          borderColor: `${state.colorGold}30`,
                          color: state.colorGold,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">أوقات الدوام</h4>
                        <p className="text-slate-300 text-sm sm:text-base">
                          {state.locTimeDesc}
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${state.colorGold}15`,
                          borderColor: `${state.colorGold}30`,
                          color: state.colorGold,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">الموقع التفصيلي</h4>
                        <a
                          href={state.heroLocationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-200 hover:text-[#d9a520] font-bold underline flex items-center gap-1.5 transition mt-0.5 text-sm sm:text-base"
                        >
                          <span>{state.locAddressDesc}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 shrink-0"
                          >
                            <path d="M15 3h6v6" />
                            <path d="M10 14 21 3" />
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          </svg>
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/[0.04] backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 text-center space-y-4">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border"
                    style={{
                      backgroundColor: `${state.colorGold}15`,
                      borderColor: `${state.colorGold}35`,
                      color: state.colorGold,
                    }}
                  >
                    <DynamicIcon name="building-2" className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">أهلاً وسهلاً بالجميع</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    المعرض مفتوح لكافة الشباب والباحثين عن عمل للتواصل المباشر مع أصحاب الشركات.
                  </p>

                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <a
                      href={state.registerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: state.colorGold,
                        color: "#0c1017",
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 font-black text-sm rounded-xl transition shadow-lg hover:brightness-110"
                    >
                      <span>{state.registerBtnText}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="m12 19-7-7 7-7" />
                        <path d="M19 12H5" />
                      </svg>
                    </a>
                    <a
                      href={state.heroLocationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl transition border border-white/20"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={state.colorGold}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>الموقع على الخريطة</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Partners Section */}
        <section
          id="partners"
          className="py-12 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: state.colorGold }}
            >
              الشركاء والجهات المنظمة
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 font-black text-white text-sm md:text-base">
              {state.partners.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: state.cardDark,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                  className="px-5 py-3 rounded-xl border shadow-sm font-bold text-slate-100 hover:border-[#d9a520]/40 transition"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 11. Footer */}
      <footer
        className="relative z-10 py-8 border-t"
        style={{
          backgroundColor: "#080b10",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <span>© {state.heroYear} {state.siteTitle} - جميع الحقوق محفوظة</span>
          </div>

          {state.showNinusoftBadge && (
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/10">
              <span>تصميم وتطوير</span>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 font-extrabold text-white hover:opacity-90 transition"
              >
                <img src="/logo.png" alt="NinuSoft" className="w-4 h-4 object-contain" />
                <span>
                  Ninu<span style={{ color: state.colorGold }}>Soft</span>
                </span>
              </a>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="font-bold" style={{ color: state.colorGold }}>
              {state.heroBadge}
            </span>
            <button
              onClick={openAdmin}
              title="لوحة التحكم (Ctrl+Shift+A)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

      {/* 12. ADMIN DASHBOARD (#admin or Ctrl+Shift+A) */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className="rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border"
            style={{
              backgroundColor: "#0f141e",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            {/* Modal Header */}
            <div className="p-6 bg-[#141b29] text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  style={{ backgroundColor: state.colorGold, color: "#0c1017" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <line x1="4" x2="4" y1="21" y2="14" />
                    <line x1="4" x2="4" y1="10" y2="3" />
                    <line x1="12" x2="12" y1="21" y2="12" />
                    <line x1="12" x2="12" y1="8" y2="3" />
                    <line x1="20" x2="20" y1="21" y2="16" />
                    <line x1="20" x2="20" y1="12" y2="3" />
                    <line x1="2" x2="6" y1="14" y2="14" />
                    <line x1="10" x2="14" y1="8" y2="8" />
                    <line x1="18" x2="22" y1="16" y2="16" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black">لوحة التحكم الاحترافية الشاملة — NinuSoft</h2>
                  <p className="text-xs text-slate-400">
                    تعديل الإعلانات، العداد التنازلي، خرائط جوجل، التسجيل والـ JSON
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-[#0c1017] border-b border-white/10 flex overflow-x-auto px-6 gap-2 text-sm font-bold">
              {(
                [
                  { id: "general", label: "الرئيسية والمواقع" },
                  { id: "announcement", label: "شريط الإعلان والعداد" },
                  { id: "sectors", label: "القطاعات المشمولة" },
                  { id: "categories", label: "الأقسام والفعاليات" },
                  { id: "stats", label: "الإحصائيات والأرقام" },
                  { id: "partners", label: "الشركاء" },
                  { id: "styles", label: "الأشكال والألوان" },
                  { id: "json", label: "استيراد / تصدير JSON" },
                ] as { id: AdminTab; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition ${
                    activeTab === t.id
                      ? "border-[#d9a520] text-[#d9a520]"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow text-right">
              {activeTab === "general" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-[#d9a520] border-b border-white/10 pb-2">
                    النصوص وروابط الخريطة والتسجيل
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        رابط موقع المعرض على الخريطة (Google Maps)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftState.heroLocationUrl}
                        onChange={(e) =>
                          setDraftState({ ...draftState, heroLocationUrl: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        رابط نموذج التسجيل (Google Form)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftState.registerUrl}
                        onChange={(e) =>
                          setDraftState({ ...draftState, registerUrl: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        نص زر التسجيل
                      </label>
                      <input
                        type="text"
                        value={draftState.registerBtnText}
                        onChange={(e) =>
                          setDraftState({ ...draftState, registerBtnText: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-[#d9a520] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        اسم الموقع / الهيدر
                      </label>
                      <input
                        type="text"
                        value={draftState.siteTitle}
                        onChange={(e) =>
                          setDraftState({ ...draftState, siteTitle: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الشعار الجانبي (Subtext)
                      </label>
                      <input
                        type="text"
                        value={draftState.siteSubtitle}
                        onChange={(e) =>
                          setDraftState({ ...draftState, siteSubtitle: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        عنوان الهيرو (Main Title)
                      </label>
                      <input
                        type="text"
                        value={draftState.heroTitle}
                        onChange={(e) =>
                          setDraftState({ ...draftState, heroTitle: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        العنوان الفرعي (Subtitle)
                      </label>
                      <input
                        type="text"
                        value={draftState.heroSubtitle}
                        onChange={(e) =>
                          setDraftState({ ...draftState, heroSubtitle: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        التاريخ والمعاد
                      </label>
                      <input
                        type="text"
                        value={draftState.heroDate}
                        onChange={(e) =>
                          setDraftState({ ...draftState, heroDate: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الوصف المكتوب الشامل
                      </label>
                      <textarea
                        rows={3}
                        value={draftState.heroDesc}
                        onChange={(e) =>
                          setDraftState({ ...draftState, heroDesc: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        موقع المعرض المختصر
                      </label>
                      <input
                        type="text"
                        value={draftState.heroLocation}
                        onChange={(e) =>
                          setDraftState({ ...draftState, heroLocation: e.target.value })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "announcement" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-[#d9a520] border-b border-white/10 pb-2">
                    إدارة شريط الإعلان العلوي والعداد التنازلي
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#0c1017] p-4 border border-white/10 rounded-xl md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draftState.showAnnouncement}
                          onChange={(e) =>
                            setDraftState({
                              ...draftState,
                              showAnnouncement: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-[#d9a520] rounded"
                        />
                        <span className="text-sm font-bold text-white">
                          إظهار شريط الإعلان العلوي
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        نص الشارة الإعلانية
                      </label>
                      <input
                        type="text"
                        value={draftState.announcementBadge}
                        onChange={(e) =>
                          setDraftState({
                            ...draftState,
                            announcementBadge: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-[#d9a520] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        نص الإعلان الشامل
                      </label>
                      <input
                        type="text"
                        value={draftState.announcementText}
                        onChange={(e) =>
                          setDraftState({
                            ...draftState,
                            announcementText: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white"
                      />
                    </div>

                    <div className="bg-[#0c1017] p-4 border border-white/10 rounded-xl md:col-span-2 mt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draftState.showCountdown}
                          onChange={(e) =>
                            setDraftState({
                              ...draftState,
                              showCountdown: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-[#d9a520] rounded"
                        />
                        <span className="text-sm font-bold text-white">
                          إظهار العداد التنازلي لانطلاق المعرض
                        </span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        تاريخ ووقت انطلاق المعرض للعداد (ISO Format)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftState.countdownTargetDate}
                        onChange={(e) =>
                          setDraftState({
                            ...draftState,
                            countdownTargetDate: e.target.value,
                          })
                        }
                        placeholder="2026-11-17T10:00:00"
                        className="w-full p-2.5 border border-white/15 rounded-xl text-sm bg-[#0c1017] text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sectors" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="font-bold text-lg text-[#d9a520]">
                      إدارة القطاعات المشمولة بالتوظيف
                    </h3>
                    <button
                      onClick={() =>
                        setDraftState({
                          ...draftState,
                          sectors: [...draftState.sectors, "قطاع جديد"],
                        })
                      }
                      className="px-3 py-1.5 bg-[#d9a520] text-[#0c1017] text-xs font-black rounded-lg hover:brightness-110 transition"
                    >
                      + إضافة قطاع
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {draftState.sectors.map((sec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#0c1017] p-2 border border-white/10 rounded-xl"
                      >
                        <input
                          type="text"
                          value={sec}
                          onChange={(e) => {
                            const next = [...draftState.sectors];
                            next[idx] = e.target.value;
                            setDraftState({ ...draftState, sectors: next });
                          }}
                          className="flex-grow p-2 border border-white/10 rounded-lg text-xs bg-[#141b29] text-white"
                        />
                        <button
                          onClick={() =>
                            setDraftState({
                              ...draftState,
                              sectors: draftState.sectors.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "categories" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="font-bold text-lg text-[#d9a520]">
                      إدارة الأقسام والخدمات والتصنيفات
                    </h3>
                    <button
                      onClick={() =>
                        setDraftState({
                          ...draftState,
                          categories: [
                            ...draftState.categories,
                            {
                              title: "عنوان قسم جديد",
                              desc: "تفاصيل ووصف القسم الجديد هنا.",
                              icon: "sparkles",
                            },
                          ],
                        })
                      }
                      className="px-3 py-1.5 bg-[#d9a520] text-[#0c1017] text-xs font-black rounded-lg hover:brightness-110 transition"
                    >
                      + إضافة تصنيف جديد
                    </button>
                  </div>
                  <div className="space-y-4">
                    {draftState.categories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0c1017] p-4 rounded-xl border border-white/10 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="font-bold text-xs text-[#d9a520]">
                            قسم / تصنيف رقم {idx + 1}
                          </span>
                          <button
                            onClick={() =>
                              setDraftState({
                                ...draftState,
                                categories: draftState.categories.filter(
                                  (_, i) => i !== idx
                                ),
                              })
                            }
                            className="text-red-400 hover:text-red-300 text-xs font-bold"
                          >
                            حذف
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              عنوان التصنيف
                            </label>
                            <input
                              type="text"
                              value={cat.title}
                              onChange={(e) => {
                                const next = [...draftState.categories];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setDraftState({ ...draftState, categories: next });
                              }}
                              className="w-full p-2 border border-white/15 rounded-lg text-xs bg-[#141b29] text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              رمز الأيقونة (file-text, users, shopping-bag, sparkles)
                            </label>
                            <input
                              type="text"
                              value={cat.icon}
                              onChange={(e) => {
                                const next = [...draftState.categories];
                                next[idx] = { ...next[idx], icon: e.target.value };
                                setDraftState({ ...draftState, categories: next });
                              }}
                              className="w-full p-2 border border-white/15 rounded-lg text-xs bg-[#141b29] text-white font-mono"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              وصف التفاصيل
                            </label>
                            <textarea
                              rows={2}
                              value={cat.desc}
                              onChange={(e) => {
                                const next = [...draftState.categories];
                                next[idx] = { ...next[idx], desc: e.target.value };
                                setDraftState({ ...draftState, categories: next });
                              }}
                              className="w-full p-2 border border-white/15 rounded-lg text-xs bg-[#141b29] text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-[#d9a520] border-b border-white/10 pb-2">
                    إدارة الأرقام والإحصائيات
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {draftState.stats.map((st, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0c1017] p-3 border border-white/10 rounded-xl"
                      >
                        <label className="block text-xs font-bold text-slate-400 mb-1">
                          الرقم {idx + 1}
                        </label>
                        <input
                          type="text"
                          value={st.val}
                          onChange={(e) => {
                            const next = [...draftState.stats];
                            next[idx] = { ...next[idx], val: e.target.value };
                            setDraftState({ ...draftState, stats: next });
                          }}
                          className="w-full p-2 border border-white/15 rounded-lg text-sm font-bold text-[#d9a520] bg-[#141b29] mb-2"
                        />
                        <label className="block text-xs font-bold text-slate-400 mb-1">
                          العنوان
                        </label>
                        <input
                          type="text"
                          value={st.lbl}
                          onChange={(e) => {
                            const next = [...draftState.stats];
                            next[idx] = { ...next[idx], lbl: e.target.value };
                            setDraftState({ ...draftState, stats: next });
                          }}
                          className="w-full p-2 border border-white/15 rounded-lg text-xs bg-[#141b29] text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "partners" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="font-bold text-lg text-[#d9a520]">
                      قائمة الشركاء والجهات المنظمة
                    </h3>
                    <button
                      onClick={() =>
                        setDraftState({
                          ...draftState,
                          partners: [...draftState.partners, "اسم شريك جديد"],
                        })
                      }
                      className="px-3 py-1.5 bg-[#d9a520] text-[#0c1017] text-xs font-black rounded-lg hover:brightness-110 transition"
                    >
                      + إضافة شريك
                    </button>
                  </div>
                  <div className="space-y-3">
                    {draftState.partners.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#0c1017] p-2 border border-white/10 rounded-xl"
                      >
                        <input
                          type="text"
                          value={p}
                          onChange={(e) => {
                            const next = [...draftState.partners];
                            next[idx] = e.target.value;
                            setDraftState({ ...draftState, partners: next });
                          }}
                          className="flex-grow p-2 border border-white/15 rounded-lg text-xs bg-[#141b29] text-white"
                        />
                        <button
                          onClick={() =>
                            setDraftState({
                              ...draftState,
                              partners: draftState.partners.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "styles" && (
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-[#d9a520] border-b border-white/10 pb-2">
                    التحكم في الأشكال، الألوان، والهوية
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#0c1017] p-4 border border-white/10 rounded-xl">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draftState.showShapes}
                          onChange={(e) =>
                            setDraftState({ ...draftState, showShapes: e.target.checked })
                          }
                          className="w-5 h-5 accent-[#d9a520] rounded"
                        />
                        <span className="text-sm font-bold text-white">
                          إظهار أشكال شعار الهوية الهندسية
                        </span>
                      </label>
                    </div>
                    <div className="bg-[#0c1017] p-4 border border-white/10 rounded-xl">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draftState.showNinusoftBadge}
                          onChange={(e) =>
                            setDraftState({
                              ...draftState,
                              showNinusoftBadge: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-[#d9a520] rounded"
                        />
                        <span className="text-sm font-bold text-white">
                          إظهار شعار NinuSoft في الهيدر والفوتر
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div className="bg-[#0c1017] p-3 border border-white/10 rounded-xl">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        لون الخلفية الداكنة (NinuSoft Dark)
                      </label>
                      <input
                        type="color"
                        value={draftState.bgDark}
                        onChange={(e) =>
                          setDraftState({ ...draftState, bgDark: e.target.value })
                        }
                        className="w-full h-10 rounded cursor-pointer border border-white/20 bg-transparent"
                      />
                    </div>
                    <div className="bg-[#0c1017] p-3 border border-white/10 rounded-xl">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        اللون الذهبي الرئيسي (NinuSoft Gold)
                      </label>
                      <input
                        type="color"
                        value={draftState.colorGold}
                        onChange={(e) =>
                          setDraftState({ ...draftState, colorGold: e.target.value })
                        }
                        className="w-full h-10 rounded cursor-pointer border border-white/20 bg-transparent"
                      />
                    </div>
                    <div className="bg-[#0c1017] p-3 border border-white/10 rounded-xl">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        اللون الأزرق المساند (Blue)
                      </label>
                      <input
                        type="color"
                        value={draftState.colorBlue}
                        onChange={(e) =>
                          setDraftState({ ...draftState, colorBlue: e.target.value })
                        }
                        className="w-full h-10 rounded cursor-pointer border border-white/20 bg-transparent"
                      />
                    </div>
                    <div className="bg-[#0c1017] p-3 border border-white/10 rounded-xl">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        اللون الأحمر الهندسي (Red)
                      </label>
                      <input
                        type="color"
                        value={draftState.colorRed}
                        onChange={(e) =>
                          setDraftState({ ...draftState, colorRed: e.target.value })
                        }
                        className="w-full h-10 rounded cursor-pointer border border-white/20 bg-transparent"
                      />
                    </div>
                    <div className="bg-[#0c1017] p-3 border border-white/10 rounded-xl">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        لون البطاقات (Card Surface)
                      </label>
                      <input
                        type="color"
                        value={draftState.cardDark}
                        onChange={(e) =>
                          setDraftState({ ...draftState, cardDark: e.target.value })
                        }
                        className="w-full h-10 rounded cursor-pointer border border-white/20 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "json" && (
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-[#d9a520] border-b border-white/10 pb-2">
                    إدارة ملفات الـ JSON
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#0c1017] p-5 border border-white/10 rounded-2xl space-y-3">
                      <h4 className="font-bold text-sm text-white">
                        تصدير التعديلات الحالية (Export JSON)
                      </h4>
                      <button
                        onClick={exportJSONFile}
                        className="px-4 py-2 bg-[#d9a520] text-[#0c1017] text-xs font-black rounded-xl hover:brightness-110 transition"
                      >
                        تنزيل ملف التعديلات (JSON)
                      </button>
                    </div>
                    <div className="bg-[#0c1017] p-5 border border-white/10 rounded-2xl space-y-3">
                      <h4 className="font-bold text-sm text-white">
                        رفع واستيراد تعديلات JSON
                      </h4>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importJSONFile}
                        className="w-full text-xs text-slate-400 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#d9a520] file:text-[#0c1017] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="bg-[#0c1017] p-4 border border-white/10 rounded-2xl">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      أو قم بلصق كود JSON مباشرة هنا:
                    </label>
                    <textarea
                      rows={5}
                      dir="ltr"
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      className="w-full p-3 border border-white/15 rounded-xl font-mono text-xs bg-[#141b29] text-slate-200 text-left"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={importJSONFromTextarea}
                        className="px-4 py-2 bg-[#d9a520] text-[#0c1017] text-xs font-black rounded-xl hover:brightness-110 transition"
                      >
                        تطبيق البيانات من النص
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#141b29] border-t border-white/10 flex justify-between items-center">
              <button
                onClick={resetDefaults}
                className="px-4 py-2 text-red-400 text-sm font-bold hover:bg-red-500/10 rounded-xl transition"
              >
                استعادة الافتراضي
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="px-5 py-2.5 text-slate-300 text-sm font-bold hover:bg-white/5 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveAdminChanges}
                  className="px-6 py-2.5 bg-[#d9a520] text-[#0c1017] font-black text-sm rounded-xl shadow-lg hover:brightness-110 transition"
                >
                  حفظ وتطبيق كل التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
