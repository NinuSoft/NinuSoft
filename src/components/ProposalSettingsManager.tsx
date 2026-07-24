import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getProposalSettings,
  saveProposalSettings,
  type ProposalSettings,
} from "@/lib/proposal-settings";

export function ProposalSettingsManager() {
  const [settings, setSettings] = useState<ProposalSettings>(getProposalSettings);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof ProposalSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    saveProposalSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="proposal-settings-manager space-y-6 dir-rtl text-start">
      <div className="proposal-admin-section-title">
        <div>
          <span>⚙️ تحكّم الميزات</span>
          <h1>إعدادات النظام وخيارات التوقيع والاعتماد</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Signature Section Controls */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-card/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5 text-lg font-bold text-amber-400">
              <span>✍️</span> إعدادات التوقيع والاعتماد الإلكتروني (Documenso Engine)
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
                  <span className="font-bold text-xs text-foreground">✍️ رسم التوقيع باليد / الماوس</span>
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
                  <span className="font-bold text-xs text-foreground">⌨️ التوقيع بالنص المكتوب</span>
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
                  <span className="font-bold text-xs text-foreground">📁 رفع صورة التوقيع</span>
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
                  <span className="font-bold text-xs text-foreground">❌ خيار طلب التعديل / الرفض</span>
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
                <span>🧮</span> حاسبة الأسعار والخدمات
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
                <span>⏱️</span> زمن القراءة وشريط التقدم
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
                <span>📑</span> الشريط الجانبي للأقسام
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
                <span>📥</span> إتاحة تنزيل PDF والطباعة
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
        </div>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Button type="button" onClick={handleSave} className="px-8 font-bold">
          حفظ الإعدادات
        </Button>
        {saved && (
          <span className="text-xs text-emerald-400 font-bold animate-in fade-in">
            ✓ تم حفظ الإعدادات وتطبيقها على النظام بنجاح!
          </span>
        )}
      </div>
    </div>
  );
}
