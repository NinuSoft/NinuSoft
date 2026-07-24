export type PackageTierSetting = {
  id: string;
  name: string;
  badge?: string;
  priceUsd: number;
  description: string;
  features: string[];
  recommended?: boolean;
};

export type ProposalSettings = {
  enableDigitalSignature: boolean;
  allowDrawSignature: boolean;
  allowTypeSignature: boolean;
  allowUploadSignature: boolean;
  allowRejection: boolean;
  enablePricingCalculator: boolean;
  enableReadingTime: boolean;
  enableSidebarNav: boolean;
  enablePdfExport: boolean;
  enableCopyCode: boolean;
  enableWatermark: boolean;
  enableExpiryCountdown: boolean;
  enableInlineComments: boolean;
  enableCustomBranding: boolean;
  enableAnalyticsDashboard: boolean;
  enablePackageSwitcher: boolean;
  packageTiers: PackageTierSetting[];
};

export const defaultProposalSettings: ProposalSettings = {
  enableDigitalSignature: true,
  allowDrawSignature: true,
  allowTypeSignature: true,
  allowUploadSignature: true,
  allowRejection: true,
  enablePricingCalculator: true,
  enableReadingTime: true,
  enableSidebarNav: true,
  enablePdfExport: true,
  enableCopyCode: true,
  enableWatermark: false,
  enableExpiryCountdown: true,
  enableInlineComments: true,
  enableCustomBranding: true,
  enableAnalyticsDashboard: true,
  enablePackageSwitcher: false,
  packageTiers: [
    {
      id: "standard",
      name: "الباقة الأساسية (Standard)",
      priceUsd: 1800,
      description: "حل برمجي متكامل ومناسب لإطلاق النسخة الأولى والأسرع بالسوق.",
      features: [
        "تطوير البرمجيات والنواة الأساسية",
        "لوحة تحكم أدمن كاملة",
        "تطبيق ويب متجاوب 100%",
        "ضمان وصيانة مجانية لمدة 3 أشهر",
      ],
    },
    {
      id: "pro",
      name: "الباقة المتقدمة (Professional)",
      badge: "الأكثر طلباً 🌟",
      priceUsd: 2800,
      description: "خيار مثالي يتضمن كافة المزايا المتقدمة وأنظمة الذكاء الاصطناعي.",
      recommended: true,
      features: [
        "كافة مزايا الباقة الأساسية",
        "مساعد ذكاء اصطناعي مدمج (Workers AI)",
        "ربط بوابات الدفع الإلكتروني وتفنيات الدفع",
        "ضمان ودعم فني متقدم لمدة 6 أشهر",
        "أولوية المعالجة الفنية والتنفيذ",
      ],
    },
    {
      id: "enterprise",
      name: "باقة المؤسسات (Enterprise)",
      priceUsd: 4500,
      description: "حل سحابي فائق الأداء بمستوى مؤسساتي مع تخصيص شامل وتدريب.",
      features: [
        "كافة المزايا والمواصفات الكاملة",
        "بنية سحابية مخصصة ومستقلة",
        "دعم فني وتحديثات لمدة سنة كاملة (12 شهر)",
        "جلسات تدريب وتوثيق كامل للفريق",
        "اتفاقية مستوى الخدمة SLA 99.9%",
      ],
    },
  ],
};

const SETTINGS_KEY = "ninusoft_proposal_admin_settings";

export function getProposalSettings(): ProposalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultProposalSettings;
    return { ...defaultProposalSettings, ...JSON.parse(raw) };
  } catch {
    return defaultProposalSettings;
  }
}

export function saveProposalSettings(settings: ProposalSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("ninusoft_settings_updated"));
  } catch (err) {
    console.error("Failed to save settings:", err);
  }
}
