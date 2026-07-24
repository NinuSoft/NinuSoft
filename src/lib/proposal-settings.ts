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
