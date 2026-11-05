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

export interface TipItem {
  title: string;
  desc: string;
  icon: string;
}

export interface PartnerItem {
  name: string;
  shortCode: string;
  role: string;
  icon: string;
}

export interface AgendaSession {
  from: string;
  to: string;
  title: string;
  details: string[];
}

export interface AgendaDay {
  id: string;
  label: string;
  dateLabel: string;
  title: string;
  sessions: AgendaSession[];
}

export interface SponsorItem {
  tier: "diamond" | "gold" | "silver";
  nameAr: string;
  nameEn: string;
  logoUrl: string;
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
  officialSiteUrl: string;
  officialSiteBtnText: string;
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
  tips: TipItem[];
  partners: string[];
}

const STORAGE_KEY = "ninusoft_baghdad_fair_state_v3";

const OFFICIAL_PARTNER_CARDS: PartnerItem[] = [
  {
    name: "وزارة الشباب والرياضة العراقية",
    shortCode: "MoY&S",
    role: "الجهة الحكومية المنظمة والمستضيفة",
    icon: "ministry",
  },
  {
    name: "الوزارة الاتحادية الألمانية للتعاون الاقتصادي والتنمية BMZ",
    shortCode: "BMZ",
    role: "الجهة الممولة والداعمة دولياً",
    icon: "bmz",
  },
  {
    name: "الوكالة الألمانية للتعاون الدولي GIZ",
    shortCode: "GIZ",
    role: "الجهة المنفذة لبرامج التنمية والتأهيل",
    icon: "giz",
  },
  {
    name: "مشروع تعزيز التحول الاقتصادي في العراق SET",
    shortCode: "SET Iraq",
    role: "الشريك الاستراتيجي لتمكين الشباب",
    icon: "set",
  },
];

const OFFICIAL_AGENDA: AgendaDay[] = [
  {
    id: "day-1",
    label: "اليوم الأول",
    dateLabel: "الثلاثاء | 17/11/2026 | 9:00 ص – 12:00 ظ",
    title: "حفل الافتتاح الرسمي وجولة أجنحة الشركات",
    sessions: [
      {
        from: "10:00",
        to: "10:05",
        title: "الافتتاح الرسمي والنشيد الوطني",
        details: ["تلاوة آيات من القرآن الكريم وقراءة سورة الفاتحة على أرواح شهداء العراق ثم النشيد الوطني."],
      },
      {
        from: "10:05",
        to: "10:15",
        title: "كلمة معالي وزير الشباب والرياضة والوكالة الألمانية",
        details: [
          "كلمة معالي وزير الشباب والرياضة الدكتور صفاء الكناني.",
          "كلمة مديرة الشرق الأوسط للوكالة الألمانية للتعاون الدولي السيدة أنيا جوم.",
        ],
      },
      {
        from: "10:15",
        to: "10:40",
        title: "عرض مشروع SET وقصص النجاح",
        details: [
          "عرض تقديمي حول تعاون وزارة الشباب والرياضة مع GIZ – مشروع SET يقدمه د. أحمد سعد عليوي.",
          "فيديو قصص نجاح لباحثين عن عمل حصلوا على وظائف عبر النسخة السابقة من المعرض.",
        ],
      },
      {
        from: "10:40",
        to: "12:00",
        title: "جولة الوفود وافتتاح أجنحة التوظيف المباشر",
        details: ["جولة الضيوف في أجنحة الشركات المشاركة وبدء استقبال السير الذاتية والمقابلات."],
      },
    ],
  },
  {
    id: "day-2",
    label: "اليوم الثاني",
    dateLabel: "الأربعاء | 18/11/2026 | 9:30 ص – 11:30 ص",
    title: "يوم المرأة والاقتصاد وتمكين الكفاءات",
    sessions: [
      {
        from: "09:36",
        to: "09:55",
        title: "الكلمة الافتتاحية وفيلم «لن أنحني»",
        details: [
          "كلمة د. فاطمة الزهراء نفعت – مدير قسم شؤون المرأة في وزارة الشباب والرياضة.",
          "عرض فيلم قصير عن دور المرأة في الاقتصاد العراقي.",
        ],
      },
      {
        from: "09:55",
        to: "10:05",
        title: "عرض قصص نجاح المبدعات",
        details: ["استعراض تجارب مهنية ملهمة لرائدات أعمال وشابات في سوق العمل (حنان باقر، نورا مهدي)."],
      },
      {
        from: "10:05",
        to: "10:45",
        title: "الجلسة الحوارية: المرأة والاقتصاد في سوق العمل العراقي",
        details: [
          "بمشاركة مؤسِّسات ومسؤولات من شركة Master Minds للتوظيف، شركة Green Gold، منصة The Mind للتدريب، والجامعة المستنصرية.",
        ],
      },
      {
        from: "10:45",
        to: "11:30",
        title: "تكريم المشاركات وجولة أجنحة الشركات",
        details: ["توزيع الشهادات واستمرار التقديم المباشر في أجنحة الشركات طيلة اليوم."],
      },
    ],
  },
  {
    id: "day-3",
    label: "اليوم الثالث",
    dateLabel: "الخميس | 19/11/2026 | 10:30 ص – 3:00 م",
    title: "يوم الشركات الكبرى والبرامج التدريبية",
    sessions: [
      {
        from: "10:30",
        to: "11:00",
        title: "عرض شركة كوكا كولا (Coca-Cola)",
        details: ["عرض تقديمي حول الشركة وأنشطتها وبرامج استقطاب المواهب الشابة."],
      },
      {
        from: "11:00",
        to: "11:30",
        title: "عرض مؤسسة أسوار للتدريب والتطوير (Aswar Academy)",
        details: ["عرض تقديمي حول برامج التدريب المهني وتطوير المهارات المطلوبة في السوق."],
      },
      {
        from: "11:30",
        to: "12:00",
        title: "عرض شركة زين العراق (Zain Iraq)",
        details: ["عرض تدريبي حول نشاطات الشركة والبرامج التدريبية وفرص العمل المتاحة للخريجين."],
      },
      {
        from: "14:00",
        to: "15:00",
        title: "جلسة دائرة الرعاية العلمية الحوارية",
        details: ["جلسة حوارية مشتركة لبناء الجسور بين القطاعين العام والخاص."],
      },
    ],
  },
  {
    id: "day-4",
    label: "اليوم الرابع",
    dateLabel: "الجمعة | 20/11/2026 | 4:00 م – 6:00 م",
    title: "يوم المعماريين وريادة الأعمال وأسرار المقابلات",
    sessions: [
      {
        from: "16:10",
        to: "16:50",
        title: "المحور الأول: قصص نجاح ملهمة وتجارب ريادية واعدة",
        details: [
          "عرض تجربة شركة شناوة كروب في ريادة الأعمال وبناء المشاريع الناشئة.",
          "عرض تجربة مكتب ماس للعمارة في الابتكار والتصميم المعماري.",
        ],
      },
      {
        from: "16:50",
        to: "17:30",
        title: "جلسة حوارية: إدارة وتطوير الأعمال وتمويل الشركات الناشئة",
        details: [
          "مناقشة تحديات التأسيس وخطوات الانطلاق بمشاركة د. ماجد الساعدي، م. حسين صباح، وم. زهراء شناوة.",
        ],
      },
      {
        from: "17:30",
        to: "18:00",
        title: "الجلسة المفتوحة: أسرار التوظيف وتقنيات المقابلة المهنية",
        details: [
          "جلسة تفاعلية مع شركة Master Minds حول معايير التوظيف واجتياز المقابلات وإبراز القيمة المضافة مع استشارات مباشرة للحضور.",
        ],
      },
    ],
  },
];

const OFFICIAL_SPONSORS: SponsorItem[] = [
  {
    tier: "diamond",
    nameAr: "زين العراق",
    nameEn: "Zain Iraq",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/diamond-03.png",
  },
  {
    tier: "diamond",
    nameAr: "شركة الجزيرة لخدمات الإنترنت والاتصالات",
    nameEn: "Jazeera Telecom",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/diamond-01.png",
  },
  {
    tier: "diamond",
    nameAr: "مؤسسة أسوار للتدريب والتطوير",
    nameEn: "Aswar Academy",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/diamond-02.jpg",
  },
  {
    tier: "diamond",
    nameAr: "شركة السليمانية لإنتاج الألبان والمواد الغذائية",
    nameEn: "Al-Sulaymanyia Co",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/diamond-04.jpg",
  },
  {
    tier: "gold",
    nameAr: "مصرف أبو ظبي الإسلامي - العراق",
    nameEn: "Abu Dhabi Islamic Bank",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/17iPDlp6sweUyMI-MtiU63OnHRzlha8IJ.jpg",
  },
  {
    tier: "gold",
    nameAr: "معهد غوته الألماني",
    nameEn: "GOETHE INSTITUT",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/1O0dVE75xikXZDfM7QKNI3w8lEdtaWSFl.jpg",
  },
  {
    tier: "gold",
    nameAr: "شركة ارلَ للتجارة العامة (Arla)",
    nameEn: "Arla Foods Company",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/gold-05.png",
  },
  {
    tier: "gold",
    nameAr: "الأكاديمية البريطانية للأعمال",
    nameEn: "British Business Academy",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/gold-07.png",
  },
  {
    tier: "gold",
    nameAr: "معهد CIS",
    nameEn: "CIS College",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/1Hn31z3-4Kr3KXmYuyJouuFBFYE0iYPM-.jpg",
  },
  {
    tier: "gold",
    nameAr: "شركة الخط الرمادي لإدارة علاقات العمل",
    nameEn: "Greyline Company",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/gold-06.png",
  },
  {
    tier: "silver",
    nameAr: "كوركس لحلول الأعمال والذكاء الاصطناعي",
    nameEn: "CoreX AI Solutions",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/silver-20.png",
  },
  {
    tier: "silver",
    nameAr: "شركة الأموال لخدمات الصيرفة الإلكترونية",
    nameEn: "AMWAL FinTech",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/silver-18.png",
  },
  {
    tier: "silver",
    nameAr: "شركة رواد الحلول لتكنولوجيا المعلومات",
    nameEn: "Rowad AlHelool IT",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/silver-24.jpg",
  },
  {
    tier: "silver",
    nameAr: "المحور لحلول الموارد البشرية",
    nameEn: "Axis HR Solutions",
    logoUrl: "https://www.baghdadjobfair.net/assets/sponsors-2026/silver-15.png",
  },
];

const IMPACT_2025 = [
  { val: "3,500", lbl: "فرصة عمل شاغرة أُعلن عنها في النسخة السابقة" },
  { val: "1,800+", lbl: "باحث عن عمل أجروا مقابلات مباشرة" },
  { val: "1,000+", lbl: "شاب وشابة حصلوا على وظائف فعلية" },
  { val: "+100", lbl: "فرصة تدريب عملي (Internships) في 2026" },
];

const DEFAULT_STATE: JobFairState = {
  siteTitle: "معرض بغداد للتوظيف 2026",
  siteSubtitle: "وزارة الشباب والرياضة",
  heroTitle: "معرض بغداد للتوظيف",
  heroYear: "2026",
  heroSubtitle: "من البحث عن فرصة إلى صناعة الفرصة",
  heroBadge: "فرصتك تبدأ بخطوة",
  heroDate: "17 - 20 تشرين الثاني 2026",
  heroLocation: "مقر وزارة الشباب والرياضة - بغداد",
  heroLocationUrl: "https://maps.app.goo.gl/cfdPqkMUqFTqPRNFA?g_st=aw",
  heroDesc:
    "تعلن وزارة الشباب والرياضة عن إقامة معرض بغداد للتوظيف 2026، بمشاركة أكثر من 90 شركة، وبما يوفر أكثر من 2000 فرصة عمل و100 فرصة تدريب عملي بالتعاون وبالشراكة مع مشروع تعزيز التحول الاقتصادي في العراق (SET)، المموّل من قبل BMZ والمنفّذ من قبل GIZ.",
  locDateDesc: "من 17 إلى 20 تشرين الثاني 2026 (على مدى أربعة أيام)",
  locTimeDesc: "من 10 صباحاً وحتى 5 مساءً يومياً (بتوقيت بغداد)",
  locAddressDesc: "بغداد - زيونة - مقر وزارة الشباب والرياضة / دائرة شؤون الأقاليم والمحافظات",
  registerUrl: "https://forms.gle/k7EBYEjJF9tkR5aT6",
  registerBtnText: "سجّل الآن",
  officialSiteUrl: "https://www.baghdadjobfair.net/",
  officialSiteBtnText: "الموقع الرسمي للمعرض",
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
    "التقنية والاتصالات",
    "المصرفية والمالية",
    "الصحية والطبية",
    "الإعلامية والتسويق",
    "الصناعية والإنتاج",
    "الهندسية والمقاولات",
    "التجارية والتجزئة",
    "التعليم والتدريب",
    "الخدمات اللوجستية",
  ],
  categories: [
    {
      title: "خدمة السيرة الذاتية (CV)",
      desc: "تقدم دائرة الرعاية العلمية خدمة طباعة وتجهيز السيرة الذاتية بشكل مجاني لجميع الباحثين عن عمل.",
      icon: "file-text",
    },
    {
      title: "ورش وجلسات حوارية",
      desc: "لقاءات مباشرة وجلسات تطوير مهارات يقدمها نخبة من الخبراء والاستشاريين لتأهيل الشباب لسوق العمل، مع إتاحة 100 فرصة تدريب عملي (Internship).",
      icon: "users",
    },
    {
      title: "البازارات والبيع المباشر",
      desc: "عروض متميزة للمشاريع الشبابية الناشئة والأعمال الريادية مع إمكانية الشراء المباشر لدعم الطاقة المحلية.",
      icon: "shopping-bag",
    },
  ],
  tips: [
    {
      title: "البحث المسبق عن الشركات المشاركة",
      desc: "البحث عن الشركات المشاركة بشكل مفصل ومعرفة مجالات عملها وطبيعة الشواغر لديها مسبقاً، ليتسنى لك إعطاء انطباع احترافي قوي وإبراز كيف تتوافق مهاراتك مع احتياجاتهم.",
      icon: "search",
    },
    {
      title: "تجهيز وتخصيص السيرة الذاتية (CV)",
      desc: "احرص على تجهيز نسخ واضحة ومحدثة من سيرتك الذاتية تبرز مهاراتك العملية ومشاريعك، واستفد من خدمة المراجعة والطباعة المجانية المتوفرة طيلة أيام المعرض.",
      icon: "file-text",
    },
    {
      title: "تحضير تعريف مهني موجز (Elevator Pitch)",
      desc: "جهّز نبذة سريعة وواثقة خلال 60 ثانية تعرّف فيها عن تخصصك، خبراتك، والقيمة التي يمكنك إضافتها للشركة عند التحدث المباشر مع مسؤولي الموارد البشرية.",
      icon: "sparkles",
    },
    {
      title: "الاستفادة من الورش وبناء العلاقات",
      desc: "شارك بفعالية في الجلسات الحوارية وورش تطوير المهارات، واحرص على طرح أسئلة ذكية وتوثيق قنوات التواصل المهني (مثل LinkedIn) مع ممثلي الشركات.",
      icon: "briefcase",
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
  | "tips"
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
    case "search":
      return (
        <svg {...baseProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
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
    case "globe":
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
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

function PartnerEmblem({
  partnerName,
  idx,
  colorGold,
}: {
  partnerName: string;
  idx: number;
  colorGold: string;
}) {
  const lower = partnerName.toLowerCase();

  // 1. Ministry of Youth & Sports Iraq Emblem
  if (lower.includes("الشباب") || idx === 0) {
    return (
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${colorGold}35, rgba(12,16,23,0.9))`,
          borderColor: `${colorGold}55`,
          color: colorGold,
        }}
      >
        <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none">
          {/* Dome & Arch of Iraqi Ministry + Youth Torch */}
          <path
            d="M12 52H52M16 52V32C16 22 23 15 32 12C41 15 48 22 48 32V52"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 52V36C24 31.5 27.5 28 32 28C36.5 28 40 31.5 40 36V52"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="32" cy="20" r="3" fill="currentColor" />
          <path
            d="M8 28C8 20 12 13 18 9M56 28C56 20 52 13 46 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
    );
  }

  // 2. BMZ — German Federal Ministry
  if (lower.includes("bmz") || lower.includes("الاتحادية") || idx === 1) {
    return (
      <div
        className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border relative overflow-hidden"
        style={{
          backgroundColor: "#141b29",
          borderColor: "rgba(255,255,255,0.18)",
        }}
      >
        {/* German Colors Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 flex">
          <span className="flex-1 bg-black" />
          <span className="flex-1 bg-[#e63926]" />
          <span className="flex-1 bg-[#f59e0b]" />
        </div>
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#d9a520] mb-0.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3Z" />
          <path d="M9 12h6" />
          <path d="M12 9v6" />
        </svg>
        <span className="text-[10px] font-black tracking-widest text-white font-mono leading-none">
          BMZ
        </span>
      </div>
    );
  }

  // 3. GIZ — German International Cooperation
  if (lower.includes("giz") || lower.includes("الوكالة") || idx === 2) {
    return (
      <div
        className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(230,57,38,0.2), rgba(18,23,34,0.95))",
          borderColor: "rgba(230,57,38,0.45)",
        }}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#f87171] mb-0.5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8" />
          <path d="M3.6 15h16.8" />
          <path d="M11.5 3a17 17 0 0 0 0 18" />
          <path d="M12.5 3a17 17 0 0 1 0 18" />
        </svg>
        <span className="text-[11px] font-black tracking-wider text-white font-mono leading-none">
          giz
        </span>
      </div>
    );
  }

  // 4. SET Project — Strengthening Economic Transformation in Iraq
  return (
    <div
      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border"
      style={{
        background: `linear-gradient(135deg, rgba(37,99,235,0.22), ${colorGold}18)`,
        borderColor: `${colorGold}50`,
      }}
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#60a5fa] mb-0.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
        <path d="M15 9h4v4" />
      </svg>
      <span
        className="text-[10px] font-black tracking-widest font-mono leading-none"
        style={{ color: colorGold }}
      >
        SET
      </span>
    </div>
  );
}

export default function JobFair() {
  const [state, setState] = useState<JobFairState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_STATE,
            ...parsed,
            tips: parsed.tips?.length ? parsed.tips : DEFAULT_STATE.tips,
          };
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
  // NinuSoft subtle hint: secret modal unlocked after 5 clicks on the NinuSoft mark
  const [ninuClicks, setNinuClicks] = useState(0);
  const [showNinuModal, setShowNinuModal] = useState(false);
  const handleNinuMarkClick = () => {
    setNinuClicks((c) => {
      const next = c + 1;
      if (next >= 5) {
        setShowNinuModal(true);
        return 0;
      }
      return next;
    });
  };
  const [activeAgendaDay, setActiveAgendaDay] = useState(0);
  const [sponsorFilter, setSponsorFilter] = useState<"all" | "diamond" | "gold" | "silver">("all");

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

  // Open admin modal on #admin or Ctrl+Shift+A / Cmd+Shift+A
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admin") {
        setDraftState(state);
        setJsonText(JSON.stringify(state, null, 2));
        setIsAdminOpen(true);
      }
    };
    checkHash();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setDraftState(state);
        setJsonText(JSON.stringify(state, null, 2));
        setIsAdminOpen(true);
      }
    };
    window.addEventListener("hashchange", checkHash);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("keydown", handleKeyDown);
    };
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

  const filteredSponsors =
    sponsorFilter === "all"
      ? OFFICIAL_SPONSORS
      : OFFICIAL_SPONSORS.filter((s) => s.tier === sponsorFilter);

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', 'Inter', sans-serif",
        backgroundColor: state.bgDark || "#0c1017",
      }}
      className="min-h-screen flex flex-col text-slate-100 relative overflow-x-clip selection:bg-[#d9a520]/30"
    >
      {/* NinuSoft Luxury Ambient Background Grid & Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
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
            background: `linear-gradient(90deg, ${state.colorNavy}, #1c1608, ${state.colorNavy})`,
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
        className="sticky top-0 z-40 backdrop-blur-xl backdrop-saturate-150 border-b transition-colors"
        style={{
          backgroundColor: `${state.bgDark}99`,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logos: Baghdad Job Fair + NinuSoft */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/15 p-1.5 shadow-lg">
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
                <h1 className="font-black text-base sm:text-xl text-white leading-tight whitespace-nowrap">
                  {state.siteTitle}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                <p className="text-xs font-bold" style={{ color: state.colorGold }}>
                  {state.siteSubtitle}
                </p>
                {state.showNinusoftBadge && (
                  <>
                    <span className="text-white/20">•</span>
                    <a
                      href="/"
                      className="group relative inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white transition bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10"
                      aria-label="اكتشف المزيد عن نينوسوفت"
                    >
                      {/* NinuSoft subtle hint: hover tooltip */}
                      <span className="pointer-events-none absolute top-full right-0 mt-2 w-max max-w-[220px] rounded-lg border px-3 py-1.5 text-[11px] font-bold opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition z-50 shadow-xl" style={{ backgroundColor: state.cardDark, borderColor: `${state.colorGold}40`, color: state.colorGold }}>
                        اكتشف المزيد عن نينوسوفت ←
                      </span>
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
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 font-bold text-slate-300 text-sm whitespace-nowrap">
            <a href="#about" className="hover:text-[#d9a520] transition">
              عن المعرض
            </a>
            <a href="#location" className="hover:text-[#d9a520] transition">
              تفاصيل الحضور
            </a>
            <a href="#features" className="hover:text-[#d9a520] transition">
              فعاليات المعرض
            </a>
            <a href="#tips" className="hover:text-[#d9a520] transition">
              نصائح نينوسوفت
            </a>
            <a href="#agenda" className="hover:text-[#d9a520] transition">
              الأجندة
            </a>
            <a href="#sectors" className="hover:text-[#d9a520] transition">
              الشركات والشركاء
            </a>
          </nav>

          {/* CTA & Mobile Menu Button */}
          <div className="flex items-center gap-2.5">
            <a
              href={state.officialSiteUrl || "https://www.baghdadjobfair.net/"}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 2xl:px-4 py-2 rounded-full text-xs font-bold text-slate-200 hover:text-[#d9a520] bg-white/5 hover:bg-white/10 border border-white/15 transition whitespace-nowrap"
              title="زيارة الموقع الرسمي لمعرض بغداد للتوظيف"
            >
              <DynamicIcon name="globe" className="w-3.5 h-3.5 text-[#d9a520]" />
              <span className="sm:inline xl:hidden 2xl:inline">{state.officialSiteBtnText || "الموقع الرسمي"}</span>
            </a>

            <a
              href={state.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: state.colorGold,
                color: "#0c1017",
              }}
              className="px-5 py-2.5 font-black rounded-full shadow-lg shadow-[#d9a520]/20 hover:brightness-110 transition flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap shrink-0"
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
              className="xl:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition"
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
            className="xl:hidden border-t px-4 py-4 space-y-2"
            style={{
              backgroundColor: state.cardDark,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {[
              { label: "عن المعرض", href: "#about" },
              { label: "تفاصيل الحضور والتوقيت", href: "#location" },
              { label: "أقسام وفعاليات المعرض", href: "#features" },
              { label: "نصائح تيم نينوسوفت", href: "#tips" },
              { label: "أجندة الأيام الأربعة", href: "#agenda" },
              { label: "الشركات والجهات الشريكة", href: "#sectors" },
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
            <a
              href={state.officialSiteUrl || "https://www.baghdadjobfair.net/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm text-[#d9a520] bg-white/5 border border-[#d9a520]/30"
            >
              <DynamicIcon name="globe" className="w-4 h-4" />
              <span>زيارة الموقع الرسمي للمعرض (baghdadjobfair.net)</span>
            </a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {/* 3. Hero Section — NinuSoft Executive Bento Layout */}
        <section
          id="about"
          className="relative py-14 lg:py-24 overflow-hidden border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Right Column: Hero Content */}
              <div className="lg:col-span-7 space-y-7 text-right">
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border bg-white/[0.03] backdrop-blur-md"
                  style={{
                    borderColor: `${state.colorGold}45`,
                    color: state.colorGold,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: state.colorGold }}
                  />
                  <span>{state.heroBadge}</span>
                  <span className="text-white/25">|</span>
                  <span className="text-slate-300">{state.heroSubtitle}</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.2] tracking-tight">
                    {state.heroTitle}{" "}
                    <span
                      className="inline-block px-3 py-0.5 rounded-2xl border"
                      style={{
                        color: state.colorGold,
                        backgroundColor: `${state.colorGold}12`,
                        borderColor: `${state.colorGold}35`,
                      }}
                    >
                      {state.heroYear}
                    </span>
                  </h1>
                </div>

                <p
                  className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed font-medium border-r-4 pr-4"
                  style={{ borderColor: state.colorGold }}
                >
                  {state.heroDesc}
                </p>

                {/* Unified Glass Info Bar for Date & Location */}
                <div
                  className="grid sm:grid-cols-2 gap-3 p-3 rounded-2xl border backdrop-blur-md"
                  style={{
                    backgroundColor: "rgba(18, 23, 34, 0.8)",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  {/* Date Item */}
                  <div className="flex items-center gap-3.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
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
                        className="w-5 h-5"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold">موعد الانعقاد</div>
                      <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                        {state.heroDate}
                      </div>
                    </div>
                  </div>

                  {/* Location Item */}
                  <a
                    href={state.heroLocationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#d9a520]/50 transition group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition"
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
                        className="w-5 h-5"
                      >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                        <span>المكان على الخريطة</span>
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
                      <div className="text-xs sm:text-sm font-black text-white group-hover:text-[#d9a520] transition truncate">
                        {state.heroLocation}
                      </div>
                    </div>
                  </a>
                </div>

                {/* CTA Buttons Row */}
                <div className="pt-1 flex flex-wrap gap-3.5 items-center">
                  <a
                    href={state.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: state.colorGold,
                      color: "#0c1017",
                    }}
                    className="px-8 py-4 font-black text-base sm:text-lg rounded-full shadow-xl shadow-[#d9a520]/25 hover:brightness-110 hover:-translate-y-0.5 transition flex items-center gap-3"
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

                  <a
                    href={state.officialSiteUrl || "https://www.baghdadjobfair.net/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 rounded-full font-bold text-sm sm:text-base text-white bg-white/[0.06] border border-[#d9a520]/45 hover:bg-[#d9a520]/15 transition flex items-center gap-2.5"
                  >
                    <DynamicIcon name="globe" className="w-4 h-4 text-[#d9a520]" />
                    <span>للاطلاع على المزيد — الموقع الرسمي للمعرض</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-[#d9a520]"
                    >
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  </a>

                  <a
                    href="#agenda"
                    className="px-5 py-4 rounded-full font-bold text-sm text-slate-200 border border-white/15 hover:bg-white/10 transition"
                  >
                    أجندة الأيام الأربعة
                  </a>
                </div>
              </div>

              {/* Left Column: NinuSoft Architectural Visual Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  className="relative w-full max-w-md rounded-3xl p-7 sm:p-8 overflow-hidden flex flex-col justify-between border"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${state.colorGold}18, ${state.cardDark} 70%)`,
                    borderColor: `${state.colorGold}40`,
                    boxShadow: `0 25px 60px -15px rgba(0,0,0,0.75), 0 0 50px ${state.colorGold}12`,
                  }}
                >
                  {/* Top Card Header */}
                  <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                      onClick={handleNinuMarkClick}
                      title="هناك شيء مخفي هنا..."
                    >
                      <img
                        src="/logo.png"
                        alt="NinuSoft"
                        className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(217,165,32,0.5)]"
                      />
                      <span className="text-sm font-extrabold tracking-tight text-white">
                        Ninu<span style={{ color: state.colorGold }}>Soft</span>
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${state.colorGold}15`,
                        borderColor: `${state.colorGold}40`,
                        color: state.colorGold,
                      }}
                    >
                      بغداد • {state.heroYear}
                    </span>
                  </div>

                  {/* Center Arch Artwork */}
                  {state.showShapes && (
                    <div className="relative z-10 my-6 flex flex-col items-center justify-center gap-4">
                      <div className="relative p-4 rounded-3xl bg-black/25 border border-white/5">
                        <svg viewBox="0 0 200 240" className="w-40 h-52 drop-shadow-2xl">
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
                      </div>

                      <div className="text-center">
                        <div className="font-black text-white text-xl tracking-wider">
                          BAGHDAD JOB FAIR{" "}
                          <span style={{ color: state.colorGold }}>{state.heroYear}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {state.siteSubtitle}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Mini Highlights inside Hero Card */}
                  <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
                    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 text-center">
                      <span
                        className="block text-lg font-black"
                        style={{ color: state.colorGold }}
                      >
                        {state.stats[0]?.val || "+90"}
                      </span>
                      <span className="text-[11px] text-slate-300 font-bold">
                        {state.stats[0]?.lbl || "شركة مشاركة"}
                      </span>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 text-center">
                      <span className="block text-lg font-black text-white">
                        {state.stats[1]?.val || "+2000"}
                      </span>
                      <span className="text-[11px] text-slate-300 font-bold">
                        {state.stats[1]?.lbl || "فرصة عمل"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Countdown & Stats + 2025 Impact Section */}
        <section
          id="stats"
          className="py-14 border-b relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${state.colorNavy}60, transparent)`,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Countdown Box */}
            {state.showCountdown && (
              <div
                className="p-6 sm:p-8 rounded-3xl border backdrop-blur-md"
                style={{
                  backgroundColor: `${state.cardDark}cc`,
                  borderColor: `${state.colorGold}35`,
                }}
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="text-center lg:text-right">
                    <div
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1"
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
                        className="w-4 h-4"
                      >
                        <line x1="10" x2="14" y1="2" y2="2" />
                        <line x1="12" x2="15" y1="14" y2="11" />
                        <circle cx="12" cy="14" r="8" />
                      </svg>
                      <span>العد التنازلي الرسمي</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      الوقت المتبقي لانطلاق المعرض
                    </h3>
                  </div>

                  <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto max-w-xl">
                    {[
                      { val: countdown.days, label: "يوم", highlight: false },
                      { val: countdown.hours, label: "ساعة", highlight: false },
                      { val: countdown.minutes, label: "دقيقة", highlight: false },
                      { val: countdown.seconds, label: "ثانية", highlight: true },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="px-4 sm:px-6 py-3.5 rounded-2xl border text-center"
                        style={{
                          backgroundColor: "#0c1017",
                          borderColor: item.highlight
                            ? `${state.colorGold}70`
                            : "rgba(255,255,255,0.1)",
                        }}
                      >
                        <span
                          className="block text-2xl sm:text-4xl font-black font-mono"
                          style={{ color: item.highlight ? state.colorGold : "#ffffff" }}
                        >
                          {item.val}
                        </span>
                        <span className="text-xs font-bold text-slate-400 mt-1 block">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4 Main Stats Cards (2026 Targets) */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: state.colorGold }}
                  />
                  <span>أهداف وأرقام نسخة 2026</span>
                </h3>
                <span className="text-xs text-slate-400 font-bold">
                  مقابلات مباشرة مع مسؤولي التوظيف طوال أيام المعرض
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {state.stats.map((stat, idx) => {
                  const accentColors = [
                    state.colorGold,
                    "#ffffff",
                    state.colorGold,
                    "#60a5fa",
                  ];
                  return (
                    <div
                      key={idx}
                      className="relative p-6 sm:p-7 rounded-3xl text-center border overflow-hidden transition hover:-translate-y-1"
                      style={{
                        backgroundColor: state.cardDark,
                        borderColor: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1"
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? state.colorGold : state.colorBlue,
                        }}
                      />
                      <div
                        className="text-3xl sm:text-5xl font-black mb-2 tracking-tight"
                        style={{ color: accentColors[idx % accentColors.length] }}
                      >
                        {stat.val}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-300">
                        {stat.lbl}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official 2025 Impact Strip (Adopted from baghdadjobfair.net) */}
            <div
              className="p-6 sm:p-8 rounded-3xl border"
              style={{
                backgroundColor: "rgba(18, 23, 34, 0.7)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                <div>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: state.colorGold }}
                  >
                    منصة عملية للتوظيف المباشر
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    أثر صنعناه في 2025 وما نبني عليه في 2026
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                  أثبت معرض بغداد للوظائف أنه حلقة وصل حقيقية تربط الشركات مباشرة بآلاف الشباب العراقيين بنتائج ملموسة:
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {IMPACT_2025.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center"
                  >
                    <span
                      className="text-2xl sm:text-3xl font-black font-mono"
                      style={{ color: idx % 2 === 0 ? state.colorGold : "#93c5fd" }}
                      dir="ltr"
                    >
                      {item.val}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-300 mt-1">
                      {item.lbl}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 10. Location & Details Section */}
        <section id="location" className="py-16">
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

                    {/* Official Website Link Item */}
                    <li className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${state.colorGold}15`,
                          borderColor: `${state.colorGold}30`,
                          color: state.colorGold,
                        }}
                      >
                        <DynamicIcon name="globe" className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">الموقع الرسمي للمعرض</h4>
                        <a
                          href={state.officialSiteUrl || "https://www.baghdadjobfair.net/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#d9a520] hover:underline font-bold flex items-center gap-1.5 transition mt-0.5 text-sm sm:text-base"
                        >
                          <span dir="ltr">www.baghdadjobfair.net</span>
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
                    المعرض مفتوح لكافة الشباب والباحثين عن عمل للتواصل المباشر مع أصحاب الشركات، ويمكنك الاطلاع على المزيد من التفاصيل عبر المنصة الرسمية للمعرض.
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
                      className="inline-flex items-center gap-2 px-6 py-3 font-black text-sm rounded-full transition shadow-lg hover:brightness-110"
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
                      href={state.officialSiteUrl || "https://www.baghdadjobfair.net/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-full transition border border-[#d9a520]/40"
                    >
                      <DynamicIcon name="globe" className="w-4 h-4 text-[#d9a520]" />
                      <span>زيارة الموقع الرسمي</span>
                    </a>
                    <a
                      href={state.heroLocationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-full transition border border-white/15"
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

        {/* 8. Dynamic Sections & Categories Section */}
        <section
          id="features"
          className="py-16 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-2"
                style={{ color: state.colorGold }}
              >
                خدمات المعرض
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                أقسام وفعاليات المعرض
              </h2>
              <p className="text-slate-400 font-medium">
                مجموعة متنوعة من الخدمات والفعاليات المصممة لدعم الشباب والباحثين عن عمل.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-7">
              {state.categories.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: state.cardDark,
                    borderColor: "rgba(255,255,255,0.09)",
                  }}
                  className="p-8 rounded-3xl border hover:border-[#d9a520]/45 hover:-translate-y-1 transition text-right flex flex-col relative overflow-hidden group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border"
                    style={{
                      backgroundColor: `${state.colorGold}15`,
                      borderColor: `${state.colorGold}35`,
                      color: state.colorGold,
                    }}
                  >
                    <DynamicIcon name={cat.icon} className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{cat.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Recommendations & Tips for Job Seekers (#tips) */}
        <section
          id="tips"
          className="py-16 border-b relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${state.colorGold}10, transparent 70%)`,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border mb-3"
                style={{
                  backgroundColor: `${state.colorGold}15`,
                  borderColor: `${state.colorGold}35`,
                  color: state.colorGold,
                }}
              >
                <DynamicIcon name="sparkles" className="w-3.5 h-3.5" />
                <span>دليلك للنجاح في المعرض</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                نصائح تيم نينوسوفت
              </h2>
              <p className="text-slate-400 font-medium">
                خطوات عملية نوصي بها لتحقيق أقصى استفادة من مشاركتك في معرض بغداد للتوظيف وترك انطباع مميز لدى الشركات:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {state.tips.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: state.cardDark,
                    borderColor:
                      idx === 0 ? `${state.colorGold}50` : "rgba(255,255,255,0.09)",
                  }}
                  className="p-6 sm:p-7 rounded-3xl border hover:border-[#d9a520]/50 transition flex items-start gap-5 relative overflow-hidden"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${state.colorGold}18`,
                      borderColor: `${state.colorGold}35`,
                      color: state.colorGold,
                    }}
                  >
                    <DynamicIcon name={tip.icon} className="w-6 h-6" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${state.colorGold}20`,
                          color: state.colorGold,
                        }}
                      >
                        توصية {idx + 1}
                      </span>
                      <h3 className="text-lg font-black text-white">{tip.title}</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* NinuSoft subtle hint: soft credit under the tips */}
            <p className="mt-8 text-center text-xs text-slate-500">
              هذه النصائح مستوحاة من خبرة فريق نينوسوفت في بناء المنتجات الرقمية والعمل اليومي مع فرق التقنية.{" "}
              <a href="/" className="font-bold hover:underline" style={{ color: `${state.colorGold}cc` }}>
                تعرّف على الفريق
              </a>
            </p>
          </div>
        </section>

        {/* 5. NEW ADOPTED SECTION: Official 4-Day Agenda (#agenda) */}
        <section
          id="agenda"
          className="py-16 border-b relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-2"
                style={{ color: state.colorGold }}
              >
                البرنامج الرسمي الكامل
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                أجندة المعرض — الأيام الأربعة
              </h2>
              <p className="text-slate-400 font-medium text-sm sm:text-base">
                تعرّف على جدول الجلسات الحوارية، عروض الشركات، وورش التدريب اليومية من 17 إلى 20 تشرين الثاني 2026:
              </p>
            </div>

            {/* Day Selector Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {OFFICIAL_AGENDA.map((day, idx) => {
                const isActive = activeAgendaDay === idx;
                return (
                  <button
                    key={day.id}
                    onClick={() => setActiveAgendaDay(idx)}
                    style={{
                      backgroundColor: isActive ? `${state.colorGold}18` : state.cardDark,
                      borderColor: isActive
                        ? state.colorGold
                        : "rgba(255,255,255,0.08)",
                    }}
                    className="p-4 rounded-2xl border text-right transition hover:border-[#d9a520]/50 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className="text-xs font-black px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isActive ? state.colorGold : "rgba(255,255,255,0.06)",
                          color: isActive ? "#0c1017" : "#cbd5e1",
                        }}
                      >
                        {day.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                        {17 + idx}/11
                      </span>
                    </div>
                    <div className="font-black text-sm sm:text-base text-white mt-1 line-clamp-1">
                      {day.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Day Schedule Card */}
            {OFFICIAL_AGENDA[activeAgendaDay] && (
              <div
                className="rounded-3xl p-6 sm:p-8 border"
                style={{
                  backgroundColor: state.cardDark,
                  borderColor: `${state.colorGold}35`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                  <div>
                    <span
                      className="text-xs font-bold block mb-1"
                      style={{ color: state.colorGold }}
                    >
                      {OFFICIAL_AGENDA[activeAgendaDay].dateLabel}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {OFFICIAL_AGENDA[activeAgendaDay].title}
                    </h3>
                  </div>
                  <a
                    href={`${(state.officialSiteUrl || "https://www.baghdadjobfair.net").replace(/\/$/, "")}/agenda`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#d9a520] border border-[#d9a520]/30 transition self-start sm:self-auto"
                  >
                    <span>عرض الأجندة التفصيلية في الموقع الرسمي</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  </a>
                </div>

                <div className="space-y-4">
                  {OFFICIAL_AGENDA[activeAgendaDay].sessions.map((session, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-[#0c1017]/80 border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-start gap-4"
                    >
                      <div
                        className="px-3.5 py-2 rounded-xl text-xs font-black font-mono shrink-0 text-center border self-start"
                        style={{
                          backgroundColor: `${state.colorGold}15`,
                          borderColor: `${state.colorGold}35`,
                          color: state.colorGold,
                        }}
                        dir="ltr"
                      >
                        {session.from} – {session.to}
                      </div>
                      <div className="space-y-1.5 text-right flex-grow">
                        <h4 className="text-base sm:text-lg font-black text-white">
                          {session.title}
                        </h4>
                        {session.details.map((line, lIdx) => (
                          <p key={lIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. Sectors Section */}
        <section
          id="sectors"
          className="py-16 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-2"
                style={{ color: state.colorGold }}
              >
                مجالات التوظيف
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                القطاعات المشمولة بالتوظيف
              </h2>
              <p className="text-slate-400 font-medium">
                يغطي المعرض العديد من التخصصات والقطاعات الحيوية لتلبية تطلعات الكفاءات والشباب:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              {state.sectors.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: state.cardDark,
                    borderColor: "rgba(255,255,255,0.09)",
                  }}
                  className="p-4 sm:p-5 rounded-2xl border shadow-sm font-bold text-white flex items-center justify-between gap-3 hover:border-[#d9a520]/50 hover:-translate-y-0.5 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black"
                      style={{
                        backgroundColor: `${state.colorGold}18`,
                        color: state.colorGold,
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <span className="text-sm sm:text-base">القطاع {sec}</span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={state.colorGold}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 shrink-0 opacity-75 group-hover:opacity-100"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. NEW ADOPTED SECTION: Participating Companies & Sponsors (#sponsors) */}
        <section
          id="sponsors"
          className="py-16 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-2"
                style={{ color: state.colorGold }}
              >
                +90 شركة ومؤسسة مشاركة
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                أبرز الشركات المشاركة والرعاة
              </h2>
              <p className="text-slate-400 font-medium text-sm sm:text-base">
                تعرّف مسبقاً على نخبة من الشركات والمؤسسات الرائدة المشاركة في المعرض لتجهيز سيرتك الذاتية بما يتناسب مع شواغرها:
              </p>

              {/* Tier Filter Pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  { id: "all", label: "جميع الفئات" },
                  { id: "diamond", label: "الرعاة الماسيون (Diamond)" },
                  { id: "gold", label: "الرعاة الذهبيون (Gold)" },
                  { id: "silver", label: "الرعاة الفضيون (Silver)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setSponsorFilter(tab.id as "all" | "diamond" | "gold" | "silver")
                    }
                    style={{
                      backgroundColor:
                        sponsorFilter === tab.id ? state.colorGold : "rgba(255,255,255,0.04)",
                      color: sponsorFilter === tab.id ? "#0c1017" : "#e2e8f0",
                      borderColor:
                        sponsorFilter === tab.id ? state.colorGold : "rgba(255,255,255,0.1)",
                    }}
                    className="px-4 py-1.5 rounded-full text-xs font-black border transition"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSponsors.map((sp, idx) => {
                const tierBadge =
                  sp.tier === "diamond"
                    ? { label: "راعي ماسي", color: "#38bdf8" }
                    : sp.tier === "gold"
                    ? { label: "راعي ذهبي", color: state.colorGold }
                    : { label: "راعي فضي", color: "#94a3b8" };

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: state.cardDark,
                      borderColor: "rgba(255,255,255,0.09)",
                    }}
                    className="p-4 sm:p-5 rounded-2xl border hover:border-[#d9a520]/45 transition flex flex-col items-center text-center justify-between gap-3 group"
                  >
                    <div className="w-full flex justify-between items-center">
                      <span
                        className="text-[10px] font-black px-2.5 py-0.5 rounded-full border"
                        style={{
                          color: tierBadge.color,
                          borderColor: `${tierBadge.color}40`,
                          backgroundColor: `${tierBadge.color}12`,
                        }}
                      >
                        {tierBadge.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">
                        {sp.nameEn}
                      </span>
                    </div>

                    <div className="w-full h-20 rounded-xl bg-white p-2.5 flex items-center justify-center overflow-hidden shadow-inner">
                      <img
                        src={sp.logoUrl}
                        alt={sp.nameAr}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                      {sp.nameAr}
                    </h4>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <a
                href={state.officialSiteUrl || "https://www.baghdadjobfair.net/"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-[#d9a520] bg-white/[0.03] hover:bg-white/[0.08] border border-[#d9a520]/35 transition"
              >
                <DynamicIcon name="globe" className="w-4 h-4" />
                <span>استعرض القائمة الكاملة للشركات والجهات في الموقع الرسمي للمعرض</span>
              </a>
            </div>
          </div>
        </section>

        {/* 11. Partners Section WITH Official Icons & Approved Logos Strip (#partners) */}
        <section
          id="partners"
          className="py-16 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: state.colorGold }}
              >
                تنظيم مشترك وشراكة دولية
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                الشركاء والجهات المنظمة
              </h2>
            </div>

            {/* Partner Cards with Dedicated Icons/Emblems */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {state.partners.map((p, idx) => {
                const meta = OFFICIAL_PARTNER_CARDS[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: state.cardDark,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                    className="p-5 rounded-3xl border shadow-lg hover:border-[#d9a520]/50 hover:-translate-y-1 transition flex flex-col items-center text-center gap-3.5 group"
                  >
                    <PartnerEmblem
                      partnerName={p}
                      idx={idx}
                      colorGold={state.colorGold}
                    />
                    {meta?.shortCode && (
                      <span
                        className="text-[11px] font-black font-mono px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${state.colorGold}15`,
                          borderColor: `${state.colorGold}35`,
                          color: state.colorGold,
                        }}
                      >
                        {meta.shortCode}
                      </span>
                    )}
                    <h3 className="font-black text-sm sm:text-base text-white leading-snug">
                      {p}
                    </h3>
                    {meta?.role && (
                      <p className="text-xs text-slate-400 font-medium">{meta.role}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Official Organizers Vector Logos Strip from baghdadjobfair.net */}
            <div className="max-w-4xl mx-auto">
              <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-[#d9a520]/40 flex flex-col items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500">
                  الشعارات الرسمية للجهات المنظمة والشريكة
                </span>
                <img
                  src="https://www.baghdadjobfair.net/assets/organizers-approved-strip.svg"
                  alt="الشركاء والجهات المنظمة لمعرض بغداد للتوظيف 2026"
                  className="w-full max-h-24 object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 12. Footer */}
      <footer
        className="relative z-10 py-10 border-t"
        style={{
          backgroundColor: "#080b10",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-3">
              <span>© {state.heroYear} نينوسوفت. جميع الحقوق محفوظة.</span>
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

            {/* Official Website + Social Links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={state.officialSiteUrl || "https://www.baghdadjobfair.net/"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#d9a520] border border-[#d9a520]/30 transition"
              >
                <DynamicIcon name="globe" className="w-3.5 h-3.5" />
                <span>الموقع الرسمي للمعرض</span>
              </a>
              <a
                href="https://instagram.com/ninusoft"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Instagram
              </a>
              <span className="text-white/15">•</span>
              <a
                href="https://facebook.com/ninusoft"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Facebook
              </a>
              <span className="text-white/15">•</span>
              <a
                href="https://linkedin.com/company/ninusoft"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-400 hover:text-white transition"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* NinuSoft subtle hint: faint curiosity line */}
          <div className="text-center">
            <a
              href="/"
              className="text-[11px] text-slate-600 hover:text-[#d9a520] transition"
            >
              هل لاحظت التفاصيل؟ كل بكسل هنا صُنع بعناية في نينوسوفت ←
            </a>
          </div>
        </div>
      </footer>

      {/* NinuSoft subtle hint: secret modal (5 clicks on the NinuSoft mark in the hero card) */}
      {showNinuModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowNinuModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${state.colorGold}22, ${state.cardDark} 70%)`,
              borderColor: `${state.colorGold}50`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowNinuModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white text-xl leading-none"
              aria-label="إغلاق"
            >
              ×
            </button>
            <img src="/logo.png" alt="NinuSoft" className="w-16 h-16 mx-auto mb-4 object-contain drop-shadow-[0_0_14px_rgba(217,165,32,0.55)]" />
            <p className="text-xs font-bold mb-2" style={{ color: state.colorGold }}>
              🎉 وجدت الشيء المخفي!
            </p>
            <h3 className="text-2xl font-black text-white mb-3">
              مرحباً من فريق نينو<span style={{ color: state.colorGold }}>سوفت</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              الفضول هو أول مهارة نبحث عنها. نحن فريق عراقي يصمم ويبني تطبيقات ومواقع ومنتجات رقمية بمعايير عالمية —
              وهذا الموقع واحد من أعمالنا.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm hover:brightness-110 transition"
              style={{ backgroundColor: state.colorGold, color: "#0c1017" }}
            >
              تعرّف على نينوسوفت
            </a>
          </div>
        </div>
      )}

      {/* 13. HIDDEN ADMIN DASHBOARD (#admin or Ctrl+Shift+A) */}
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
                  <DynamicIcon name="sparkles" className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black">لوحة التحكم الاحترافية الشاملة — NinuSoft</h2>
                  <p className="text-xs text-slate-400">
                    تعديل الإعلانات، العداد التنازلي، التوصيات، التسجيل والـ JSON
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
              >
                ✕
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
                  { id: "tips", label: "التوصيات والنصائح" },
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
                    النصوص وروابط الخريطة والتسجيل والموقع الرسمي
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
                        رابط الموقع الرسمي للمعرض
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftState.officialSiteUrl}
                        onChange={(e) =>
                          setDraftState({ ...draftState, officialSiteUrl: e.target.value })
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
                              رمز الأيقونة (file-text, users, shopping-bag, sparkles, search)
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

              {activeTab === "tips" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="font-bold text-lg text-[#d9a520]">
                      إدارة توصيات ونصائح الباحثين عن عمل
                    </h3>
                    <button
                      onClick={() =>
                        setDraftState({
                          ...draftState,
                          tips: [
                            ...draftState.tips,
                            {
                              title: "عنوان توصية جديدة",
                              desc: "تفاصيل النصيحة هنا...",
                              icon: "sparkles",
                            },
                          ],
                        })
                      }
                      className="px-3 py-1.5 bg-[#d9a520] text-[#0c1017] text-xs font-black rounded-lg hover:brightness-110 transition"
                    >
                      + إضافة توصية جديدة
                    </button>
                  </div>
                  <div className="space-y-4">
                    {draftState.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0c1017] p-4 rounded-xl border border-white/10 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="font-bold text-xs text-[#d9a520]">
                            توصية رقم {idx + 1}
                          </span>
                          <button
                            onClick={() =>
                              setDraftState({
                                ...draftState,
                                tips: draftState.tips.filter((_, i) => i !== idx),
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
                              عنوان التوصية
                            </label>
                            <input
                              type="text"
                              value={tip.title}
                              onChange={(e) => {
                                const next = [...draftState.tips];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setDraftState({ ...draftState, tips: next });
                              }}
                              className="w-full p-2 border border-white/15 rounded-lg text-xs bg-[#141b29] text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              رمز الأيقونة (search, file-text, sparkles, briefcase, users)
                            </label>
                            <input
                              type="text"
                              value={tip.icon}
                              onChange={(e) => {
                                const next = [...draftState.tips];
                                next[idx] = { ...next[idx], icon: e.target.value };
                                setDraftState({ ...draftState, tips: next });
                              }}
                              className="w-full p-2 border border-white/15 rounded-lg text-xs bg-[#141b29] text-white font-mono"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                              نص التوصية التفصيلي
                            </label>
                            <textarea
                              rows={2}
                              value={tip.desc}
                              onChange={(e) => {
                                const next = [...draftState.tips];
                                next[idx] = { ...next[idx], desc: e.target.value };
                                setDraftState({ ...draftState, tips: next });
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
