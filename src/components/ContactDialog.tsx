import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@/components/Icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhoneInput, { getCountryCallingCode } from "react-phone-number-input";
import arLabels from "react-phone-number-input/locale/ar.json";
import enLabels from "react-phone-number-input/locale/en.json";
import "react-phone-number-input/style.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CountrySelect = ({
  value,
  onChange,
  options,
  iconComponent: Icon,
}: {
  value?: string;
  onChange: (value?: string) => void;
  options: { value?: string; label: string }[];
  iconComponent: React.ComponentType<{ country: string }>;
}) => {
  return (
    <Select
      value={value || "IQ"}
      onValueChange={onChange}
      dir="ltr"
    >
      <SelectTrigger className="border-0 shadow-none bg-transparent focus:ring-0 w-[42px] h-full shrink-0 px-0 hover:bg-white/5 transition-colors rounded-none flex items-center justify-center">
        <SelectValue>
          {value && <Icon country={value} />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border/50 text-white max-h-72" dir="ltr">
        {options.map(({ value: countryCode, label }: any) => {
          if (!countryCode) return null;
          return (
            <SelectItem key={countryCode} value={countryCode}>
              <span className="flex items-center gap-2">
                <Icon country={countryCode} />
                <span className="text-sm">{label || countryCode}</span>
                <span className="text-muted-foreground text-xs font-mono">+{getCountryCallingCode(countryCode)}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

interface ContactFormFieldsProps {
  t: any;
  lang: "en" | "ar";
  contactProjectType: string;
  setContactProjectType: (value: string) => void;
  phone: string | undefined;
  setPhone: (value: string | undefined) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.SyntheticEvent) => void;
}

/**
 * Form fields only (no Dialog wrapper) — the parent renders the Dialog shell
 * eagerly so it opens instantly, and lazy-loads just this component (which
 * pulls in the heavy react-phone-number-input chunk) behind a Suspense
 * boundary with a skeleton fallback.
 */
export default function ContactFormFields({
  t,
  lang,
  contactProjectType,
  setContactProjectType,
  phone,
  setPhone,
  isSubmitting,
  onSubmit,
}: ContactFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5 text-start">
        <label htmlFor="name" className="text-sm font-semibold text-muted-foreground">{t.contact.name}</label>
        <Input
          id="name"
          name="name"
          required
          placeholder={t.contact.placeholderName}
          className="bg-background border-border/50 text-white h-11 focus-visible:ring-primary"
        />
      </div>
      <div className="flex flex-col gap-1.5 text-start">
        <label htmlFor="email" className="text-sm font-semibold text-muted-foreground">{t.contact.email}</label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          dir="ltr"
          placeholder={t.contact.placeholderEmail}
          className="bg-background border-border/50 text-white h-11 focus-visible:ring-primary text-left"
        />
      </div>
      <div className="flex flex-col gap-1.5 text-start">
        <label htmlFor="phone" className="text-sm font-semibold text-muted-foreground">{t.contact.phone}</label>
        <div dir="ltr">
          <PhoneInput
            placeholder={t.contact.placeholderPhone}
            value={phone}
            onChange={setPhone}
            defaultCountry="IQ"
            labels={lang === "ar" ? arLabels : enLabels}
            countrySelectComponent={CountrySelect}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-start">
        <label htmlFor="projectType" className="text-sm font-semibold text-muted-foreground">{t.contact.projectType}</label>
        <Select
          name="projectType"
          value={contactProjectType}
          onValueChange={setContactProjectType}
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <SelectTrigger className="bg-background border-border/50 text-white h-11 focus:ring-primary">
            <SelectValue placeholder={t.contact.selectPlaceholder} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/50 text-white">
            <SelectItem value="software">{t.contact.optionSoftware}</SelectItem>
            <SelectItem value="web">{t.contact.optionWeb}</SelectItem>
            <SelectItem value="mobile">{t.contact.optionMobile}</SelectItem>
            <SelectItem value="ai">{t.contact.optionAi}</SelectItem>
            <SelectItem value="other">{t.contact.optionOther}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 text-start">
        <label htmlFor="message" className="text-sm font-semibold text-muted-foreground">{t.contact.message}</label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder={t.contact.placeholderMessage}
          rows={4}
          className="bg-background border-border/50 text-white focus-visible:ring-primary resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-lg font-bold gap-2 text-primary-foreground bg-primary hover:bg-primary/90 mt-2"
      >
        {isSubmitting ? (
          <>
            <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            {t.contact.buttonSending}
          </>
        ) : (
          <>
            {t.contact.buttonSend}
            <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
          </>
        )}
      </Button>
    </form>
  );
}
