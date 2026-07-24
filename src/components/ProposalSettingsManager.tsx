import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getProposalSettings,
  saveProposalSettings,
  defaultProposalSettings,
  type ProposalSettings,
} from "@/lib/proposal-settings";
import { saveProposalSettingsBackendApi } from "@/lib/proposals-api";
import {
  Settings,
  PenTool,
  Keyboard,
  Upload,
  XCircle,
  Calculator,
  Clock,
  FileText,
  Download,
  Tag,
  MessageSquare,
  CheckCircle,
} from "@/components/Icons";

export function ProposalSettingsManager() {
  const [settings, setSettings] = useState<ProposalSettings>(getProposalSettings);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof ProposalSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    saveProposalSettings(settings);
    const adminKey = sessionStorage.getItem("ninusoft-proposals-admin-key");
    if (adminKey) {
      await saveProposalSettingsBackendApi(adminKey, settings).catch(() => {});
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="proposal-settings-manager space-y-6 dir-rtl text-start">
      <div className="proposal-admin-section-title">
        <div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Settings className="w-4 h-4 text-amber-400" /> تحكّم الميزات
          </span>
          <h1>إعدادات النظام وخيارات التوقيع والاعتماد</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Signature Section Controls */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-card/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5 text-lg font-bold text-amber-400">
              <PenTool className="w-5 h-5" />
              <span>إعدادات التوقيع والاعتماد الإلكتروني</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
              <span>تفعيل التوقيع الإلكتروني للعميل</span>
              <input
                type="checkbox"
                checked={settings.enableDigitalSignature}
                onChange={() => toggle("enableDigitalSignature")}
                className="w-4 h-4 accent-amber-500"
              />
            </label>
          </div>

          {settings.enableDigitalSignature && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  settings.allowDrawSignature
                    ? "border-amber-500/40 bg-muted/60"
                    : "border-border/40 bg-card/30 opacity-70"
                }`}
                onClick={() => toggle("allowDrawSignature")}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-amber-400" /> رسم التوقيع باليد / الماوس
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.allowDrawSignature}
                    onChange={() => toggle("allowDrawSignature")}
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">تفعيل لوحة التوقيع باللمس أو بالماوس.</p>
              </div>

              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  settings.allowTypeSignature
                    ? "border-amber-500/40 bg-muted/60"
                    : "border-border/40 bg-card/30 opacity-70"
                }`}
                onClick={() => toggle("allowTypeSignature")}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Keyboard className="w-4 h-4 text-amber-400" /> التوقيع بالنص المكتوب
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.allowTypeSignature}
                    onChange={() => toggle("allowTypeSignature")}
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">إتاحة كتابة اسم الموقّع بالخط الخطي.</p>
              </div>

              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  settings.allowUploadSignature
                    ? "border-amber-500/40 bg-muted/60"
                    : "border-border/40 bg-card/30 opacity-70"
                }`}
                onClick={() => toggle("allowUploadSignature")}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-400" /> رفع صورة التوقيع
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.allowUploadSignature}
                    onChange={() => toggle("allowUploadSignature")}
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">السماح برفع ملف صورة التوقيع (.png / .jpg).</p>
              </div>

              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  settings.allowRejection
                    ? "border-amber-500/40 bg-muted/60"
                    : "border-border/40 bg-card/30 opacity-70"
                }`}
                onClick={() => toggle("allowRejection")}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-destructive" /> خيار طلب التعديل / الرفض
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.allowRejection}
                    onChange={() => toggle("allowRejection")}
                    className="w-4 h-4 accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">السماح للعميل بكتابة ملاحظات التعديل أو رفض المقترح.</p>
              </div>
            </div>
          )}
        </div>

        {/* General Feature Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pricing Calculator */}
          <div
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              settings.enablePricingCalculator
                ? "border-amber-500/40 bg-card/90 shadow-md"
                : "border-border/40 bg-card/40 opacity-75"
            }`}
            onClick={() => toggle("enablePricingCalculator")}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>حاسبة الأسعار والخدمات</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePricingCalculator}
                onChange={() => toggle("enablePricingCalculator")}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تأطير وتفعيل الجداول التفاعلية للخدمات الاختيارية وحساب الميزانية الإجمالية.
            </p>
          </div>

          {/* Reading Time */}
          <div
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              settings.enableReadingTime
                ? "border-amber-500/40 bg-card/90 shadow-md"
                : "border-border/40 bg-card/40 opacity-75"
            }`}
            onClick={() => toggle("enableReadingTime")}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>زمن القراءة وشريط التقدم</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableReadingTime}
                onChange={() => toggle("enableReadingTime")}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              عرض مؤشر التمرير العلوي وحساب الوقت التقديري لقراءة الوثيقة بالدقائق.
            </p>
          </div>

          {/* Sidebar Nav */}
          <div
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              settings.enableSidebarNav
                ? "border-amber-500/40 bg-card/90 shadow-md"
                : "border-border/40 bg-card/40 opacity-75"
            }`}
            onClick={() => toggle("enableSidebarNav")}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>الشريط الجانبي للأقسام</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSidebarNav}
                onChange={() => toggle("enableSidebarNav")}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              عرض القائمة الجانبية الأيمن للتنقل السريع بين الأقسام على الشاشات الكبيرة.
            </p>
          </div>

          {/* PDF Export */}
          <div
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              settings.enablePdfExport
                ? "border-amber-500/40 bg-card/90 shadow-md"
                : "border-border/40 bg-card/40 opacity-75"
            }`}
            onClick={() => toggle("enablePdfExport")}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Download className="w-5 h-5 text-amber-400" />
                <span>إتاحة تنزيل PDF والطباعة</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePdfExport}
                onChange={() => toggle("enablePdfExport")}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              إظهار أزرار الطباعة وتنزيل نسخة PDF للعميل من الشريط العلوي.
            </p>
          </div>

          {/* Package Switcher Enable & Custom Editor */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              settings.enablePackageSwitcher
                ? "border-amber-500/40 bg-card/90 shadow-md"
                : "border-border/40 bg-card/40 opacity-75"
            }`}
          >
            <div
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => toggle("enablePackageSwitcher")}
            >
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Tag className="w-5 h-5 text-amber-400" />
                <span>إتاحة باقات التنفيذ التفاعلية (Interactive Packages)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePackageSwitcher}
                onChange={() => toggle("enablePackageSwitcher")}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              عرض خيارات الباقات التفاعلية (أساسية، متقدمة، مؤسسات) مع حساب التكلفة المباشرة للعميل.
            </p>

            {settings.enablePackageSwitcher && (
              <div className="space-y-4 pt-3 border-t border-border/50">
                <h4 className="font-bold text-xs text-amber-400">تخصيص الباقات والأسعار (USD):</h4>
                <div className="space-y-4">
                  {(settings.packageTiers || defaultProposalSettings.packageTiers).map((tier, idx) => (
                    <div key={tier.id || idx} className="p-4 rounded-xl bg-background/60 border border-border/60 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1 font-semibold">اسم الباقة</label>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => {
                              const nextTiers = [...(settings.packageTiers || defaultProposalSettings.packageTiers)];
                              nextTiers[idx] = { ...nextTiers[idx], name: e.target.value };
                              setSettings({ ...settings, packageTiers: nextTiers });
                            }}
                            className="w-full text-xs p-2 rounded-lg bg-card border border-border/60 text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1 font-semibold">السعر ($ USD)</label>
                          <input
                            type="number"
                            value={tier.priceUsd}
                            onChange={(e) => {
                              const nextTiers = [...(settings.packageTiers || defaultProposalSettings.packageTiers)];
                              nextTiers[idx] = { ...nextTiers[idx], priceUsd: Number(e.target.value) || 0 };
                              setSettings({ ...settings, packageTiers: nextTiers });
                            }}
                            className="w-full text-xs p-2 rounded-lg bg-card border border-border/60 text-foreground font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1 font-semibold">الوصف المختصر</label>
                        <input
                          type="text"
                          value={tier.description}
                          onChange={(e) => {
                            const nextTiers = [...(settings.packageTiers || defaultProposalSettings.packageTiers)];
                            nextTiers[idx] = { ...nextTiers[idx], description: e.target.value };
                            setSettings({ ...settings, packageTiers: nextTiers });
                          }}
                          className="w-full text-xs p-2 rounded-lg bg-card border border-border/60 text-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Expiry Countdown */}
          <div
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              settings.enableExpiryCountdown
                ? "border-amber-500/40 bg-card/90 shadow-md"
                : "border-border/40 bg-card/40 opacity-75"
            }`}
            onClick={() => toggle("enableExpiryCountdown")}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>عداد تنازلي لتاريخ الصلاحية</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableExpiryCountdown}
                onChange={() => toggle("enableExpiryCountdown")}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تنبيه العميل بالوقت المتبقي (بالأيام والساعات والدقائق) قبل انتهاء صلاحية العرض.
            </p>
          </div>

          {/* Inline Comments */}
          <div
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              settings.enableInlineComments
                ? "border-amber-500/40 bg-card/90 shadow-md"
                : "border-border/40 bg-card/40 opacity-75"
            }`}
            onClick={() => toggle("enableInlineComments")}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <span>التعليقات والأسئلة التفاعلية</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableInlineComments}
                onChange={() => toggle("enableInlineComments")}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              السماح للعميل بكتابة استفسارات وملاحظات مباشرة أسفل الوثيقة.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Save Actions Bar */}
      <div className="sticky bottom-4 z-30 mt-8 p-4 rounded-2xl bg-card/95 border border-amber-500/50 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} size="lg" className="px-8 font-bold text-xs shadow-xl bg-amber-500 text-black hover:bg-amber-400 border border-amber-300">
            حفظ جميع الإعدادات
          </Button>
          {saved && (
            <span className="text-xs text-emerald-400 font-bold animate-in fade-in flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> تم حفظ الإعدادات وتطبيقها بنجاح!
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
          تطبيق الإعدادات فورياً على كافة المقترحات
        </span>
      </div>
    </div>
  );
}
