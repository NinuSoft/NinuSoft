import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings, Shield, Users2, Monitor, Globe, Smartphone, Bot, Cloud, Target, TrendingUp, Cpu, Lock, Zap, Handshake, Search, ClipboardList, PenTool, Code2, Rocket, Mail, Phone, MapPin, ExternalLink, Menu, ChevronLeft, ChevronRight, Star, CheckCircle2 } from "@/components/Icons";
import { Facebook, Linkedin, Instagram, Github, Telegram, WhatsApp } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from "embla-carousel-react";
import en from "@/data/locales/en.json";
import ar from "@/data/locales/ar.json";
import IntroScreen from "@/components/IntroScreen";
import stats from "@/data/stats.json";

// Form fields only (no Dialog wrapper) — the Dialog shell below is eager so
// it opens instantly; only the heavy phone-input form fields are lazy-loaded.
const ContactFormFields = React.lazy(() => import("@/components/ContactDialog"));
const ProjectDetailsDialog = React.lazy(() => import("@/components/ProjectDetailsDialog"));

const translations = { en, ar };

const STAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Users2,
  Code2,
  Settings,
};

export interface Project {
  id: number;
  group: "product" | "experience" | "enterprise" | "opensource";
  category: string;
  title: string;
  desc: string;
  img: string;
  org: string;
  details: string;
  challenge?: string;
  solution?: string;
  impact?: string;
  tech: string[];
  features: string[];
  storeLink?: string;
  websiteLink?: string;
  links?: { label: string; url: string }[];
}

const logoLarge = "/logo.png";

const PROJECT_GROUP_PRIORITY: Record<string, number> = {
  product: 0,
  enterprise: 1,
  experience: 2,
  opensource: 3,
};

const NAV_LINKS = [
  { key: "home", href: "#home" },
  { key: "services", href: "#services" },
  { key: "solutions", href: "#solutions" },
  { key: "about", href: "#about" },
  { key: "projects", href: "#projects" },
  { key: "contact", href: "#contact" },
];

const SERVICES_LIST = [
  { key: "customSoftware", href: "#services" },
  { key: "webApps", href: "#services" },
  { key: "mobileApps", href: "#services" },
  { key: "aiSolutions", href: "#services" },
  { key: "cloud", href: "#services" }
];

// Shown briefly while the phone-input-heavy form fields chunk downloads,
// so the dialog never looks blank/frozen after opening.
const ContactFormSkeleton = () => (
  <div className="space-y-4 animate-pulse" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="space-y-1.5">
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="h-11 rounded-lg bg-white/5 border border-border/50" />
      </div>
    ))}
    <div className="h-24 rounded-lg bg-white/5 border border-border/50" />
    <div className="h-12 rounded-lg bg-primary/20 mt-2" />
  </div>
);

export default function Home() {
  const [lang, setLang] = useState<"en" | "ar">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_lang");
      if (saved === "ar" || saved === "en") return saved;
    }
    return "en";
  });
  const t = translations[lang];
  const PROJECTS = [...(t.projects as Project[])].sort(
    (a, b) => (PROJECT_GROUP_PRIORITY[a.group] ?? 99) - (PROJECT_GROUP_PRIORITY[b.group] ?? 99)
  );

  // Intro screen visibility state
  const [showIntro, setShowIntro] = useState(() => {
    return !!document.getElementById("ns-intro");
  });

  const handleIntroDone = () => {
    sessionStorage.setItem("intro_seen", "1");
    setShowIntro(false);
  };

  const [activeSection, setActiveSection] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const { toast } = useToast();

  const [contactProjectType, setContactProjectType] = useState("web");
  const [phone, setPhone] = useState<string | undefined>("");

  // Gate the lazy-loaded dialog chunks so they aren't fetched until the user
  // actually interacts, instead of on initial page load.
  const [contactDialogMounted, setContactDialogMounted] = useState(false);
  const [projectDialogMounted, setProjectDialogMounted] = useState(false);

  const openContactWithService = (serviceType: string = "web") => {
    setContactProjectType(serviceType);
    setIsContactOpen(true);
    setContactDialogMounted(true);
  };

  const openContactWithProject = (project: Project) => {
    let type = "web";
    if (project.group === "product" || project.group === "experience") type = "mobile";
    else if (project.group === "enterprise") type = "software";
    else if (project.group === "opensource") type = "other";
    openContactWithService(type);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_lang", lang);
    }
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    document.title = t.meta.title;
    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', t.meta.description);
    setMeta('meta[property="og:title"]', t.meta.title);
    setMeta('meta[property="og:description"]', t.meta.description);
    setMeta('meta[property="og:locale"]', lang === "ar" ? "ar_IQ" : "en_US");
    setMeta('meta[name="twitter:title"]', t.meta.title);
    setMeta('meta[name="twitter:description"]', t.meta.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prefetch the lazy dialog chunks once the browser is idle after first
  // paint, so they're already cached by the time a user actually clicks a
  // CTA — keeps the initial bundle small without a click-to-open delay.
  React.useEffect(() => {
    const prefetch = () => {
      import("@/components/ContactDialog");
      import("@/components/ProjectDetailsDialog");
    };
    const ric = (window as any).requestIdleCallback as ((cb: () => void) => number) | undefined;
    if (ric) {
      const id = ric(prefetch);
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(prefetch, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleContactSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    const endpoint = "https://contact-api.ninusoft.workers.dev/";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || "",
          projectType: contactProjectType,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: t.contact.successTitle,
          description: t.contact.successDesc,
        });
        form.reset();
        setPhone("");
        setIsContactOpen(false);
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: lang === "ar"
          ? "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى."
          : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const GROUP_ORDER = ["All", "product", "experience", "enterprise", "opensource"] as const;
  const categories = GROUP_ORDER.filter((g) => g === "All" || PROJECTS.some((p) => p.group === g));

  const getCategoryLabel = (cat: string) => {
    return t.projectGroups[cat === "All" ? "all" : (cat as keyof typeof t.projectGroups)];
  };

  const filteredProjects = selectedCategory === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.group === selectedCategory);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    direction: lang === "ar" ? "rtl" : "ltr"
  });

  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [selectedSnap, setSelectedSnap] = useState(0);

  const scrollPrev = React.useCallback(() => { if (emblaApi) emblaApi.scrollPrev(); }, [emblaApi]);
  const scrollNext = React.useCallback(() => { if (emblaApi) emblaApi.scrollNext(); }, [emblaApi]);
  const scrollToSnap = React.useCallback((index: number) => { if (emblaApi) emblaApi.scrollTo(index); }, [emblaApi]);

  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({ direction: lang === "ar" ? "rtl" : "ltr" });
      emblaApi.scrollTo(0, false);
    }
  }, [emblaApi, selectedCategory, lang]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedSnap(emblaApi.selectedScrollSnap());
    const onReInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedSnap(emblaApi.selectedScrollSnap());
    };
    onReInit();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    const ids = ["home", "services", "solutions", "about", "projects", "contact"];
    const observers: IntersectionObserver[] = [];
    // Give the browser (and any incoming #anchor deep link) time to finish its
    // initial scroll before we start rewriting the hash on our own.
    let hashSyncEnabled = false;
    const enableTimer = window.setTimeout(() => { hashSyncEnabled = true; }, 1200);

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
            if (!hashSyncEnabled) return;
            const newHash = id === "home" ? "" : `#${id}`;
            const newUrl = `${window.location.pathname}${window.location.search}${newHash}`;
            if (window.location.hash !== newHash) {
              window.history.replaceState(null, "", newUrl);
            }
          }
        },
        { threshold: 0.3, rootMargin: "-60px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => {
      window.clearTimeout(enableTimer);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground selection:bg-primary/30 font-sans relative">
      {/* Animated Intro Screen */}
      <IntroScreen onComplete={handleIntroDone} />
      {/* Premium Background Visuals - Wrapped to isolate layout bounds and prevent horizontal scroll */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[150px] animate-pulse duration-[8000ms]" />
      </div>

      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="NinuSoft Logo" className="h-9 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-white">
            {lang === "en" ? (
              <>Ninu<span className="text-primary">Soft</span></>
            ) : (
              <>نينو<span className="text-primary">سوفت</span></>
            )}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ key, href }) => {
            const id = href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={key}
                href={href}
                data-testid={`nav-link-${id}`}
                className={`transition-colors relative pb-0.5 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.nav[key as keyof typeof t.nav]}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </a>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="text-white border border-white/10 hover:bg-white/10 rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            {lang === "en" ? "العربية" : "English"}
          </Button>
          <Button
            onClick={() => openContactWithService("web")}
            className="gap-2 rounded-full font-semibold px-6 shadow-lg shadow-primary/20"
          >
            {t.nav.getStarted}
            <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white" aria-label="Toggle menu">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side={lang === "ar" ? "left" : "right"} className="bg-background/95 backdrop-blur border-border/50 p-6 flex flex-col justify-between w-[300px]">
            <div className="flex flex-col gap-8 mt-8">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="NinuSoft Logo" className="h-9 w-auto object-contain" />
                <span className="text-xl font-bold tracking-tight text-white">
                  {lang === "en" ? (
                    <>Ninu<span className="text-primary">Soft</span></>
                  ) : (
                    <>نينو<span className="text-primary">سوفت</span></>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-4 text-base font-medium">
                {NAV_LINKS.map(({ key, href }) => {
                  const id = href.replace("#", "");
                  const isActive = activeSection === id;
                  return (
                    <SheetClose asChild key={key}>
                      <a
                        href={href}
                        className={`transition-colors py-2 border-b border-border/10 ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {t.nav[key as keyof typeof t.nav]}
                      </a>
                    </SheetClose>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-2">
                <span className="text-sm font-medium text-muted-foreground">{lang === "en" ? "Language" : "اللغة"}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLang(lang === "en" ? "ar" : "en")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {lang === "en" ? "العربية" : "English"}
                </Button>
              </div>
            </div>

            <SheetClose asChild>
              <Button
                onClick={() => openContactWithService("web")}
                className="w-full gap-2 rounded-full font-semibold px-6 py-5 shadow-lg shadow-primary/20"
              >
                {t.nav.getStarted}
                <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </nav>

      {/* 2. HERO SECTION */}
      <main id="home" className="flex-1 w-full relative overflow-hidden min-h-[calc(100vh-73px)] flex flex-col lg:flex-row">

        {/* LEFT — content area, solid dark background */}
        <div className="relative z-10 w-full lg:w-[55%] flex items-center bg-background px-6 lg:px-16 py-12 sm:py-16 md:py-24 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-start w-full max-w-xl text-start"
          >
            {/* Logo + Name side by side */}
            <div className="flex items-center gap-4 sm:gap-5 mb-6">
              <img
                src={logoLarge}
                alt="NinuSoft Logo"
                className="h-[70px] sm:h-[100px] md:h-[130px] w-auto object-contain drop-shadow-[0_0_20px_rgba(201,163,58,0.25)]"
              />
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-extrabold tracking-tight leading-none">
                {lang === "en" ? (
                  <><span className="text-white">Ninu</span><span className="text-primary">Soft</span></>
                ) : (
                  <><span className="text-white">نينو</span><span className="text-primary">سوفت</span></>
                )}
              </h1>
            </div>

            <h2 className="text-xs sm:text-sm md:text-base font-bold tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-6 uppercase">
              {t.hero.sub}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-[480px] leading-relaxed">
              {t.hero.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10 w-full sm:w-auto">
              <Button
                onClick={() => openContactWithService("web")}
                size="lg"
                className="w-full sm:w-auto rounded-full font-semibold px-8 h-12 sm:h-14 shadow-xl shadow-primary/30 gap-2"
                data-testid="button-get-started"
              >
                {t.nav.getStarted}
                <ArrowRight className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
              </Button>
              <Button
                onClick={() => {
                  const el = document.getElementById("services");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full font-semibold px-8 h-12 sm:h-14 border-white/30 text-white hover:bg-white/10 gap-2"
                data-testid="button-view-services"
              >
                {t.hero.viewServices}
                <ArrowRight className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
              </Button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm font-medium bg-secondary/50 py-2.5 px-4 sm:py-3 sm:px-5 rounded-full border border-border/50 max-w-full">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <span className="truncate sm:whitespace-normal">{t.stats.hero}</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Ishtar Gate image, right side on desktop, stacked on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="w-full lg:w-[45%] h-[300px] sm:h-[450px] lg:h-auto relative shrink-0 overflow-hidden"
        >
          {/* Gradient fade on top/left (or top/right in Arabic) edge to blend with content */}
          <div className={`absolute inset-x-0 top-0 h-24 lg:inset-y-0 lg:w-32 lg:h-auto z-10 bg-gradient-to-b from-background to-transparent ${lang === "ar" ? "lg:right-0 lg:bg-gradient-to-l" : "lg:left-0 lg:bg-gradient-to-r"
            }`} />
          {/* Gradient fade on bottom edge */}
          <div className="absolute inset-x-0 bottom-0 h-24 lg:h-32 z-10 bg-gradient-to-t from-background to-transparent" />
          <img
            src="/hero-gate.webp"
            alt="Ishtar Gate — Ancient Nineveh"
            className={`w-full h-full object-cover ${lang === "ar" ? "scale-x-[-1] object-right" : "object-left"
              }`}
          />
        </motion.div>

      </main>

      {/* 3. STATS BAR */}
      <div className="w-full border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-x-0 md:divide-x divide-border/50">
            {stats.map((stat) => {
              const Icon = STAT_ICONS[stat.icon];
              return (
                <div key={stat.key} className="flex flex-col items-center justify-center text-center px-2 sm:px-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />}
                    <span className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t.stats[stat.key as keyof typeof t.stats]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3b. TRUSTED EXPERIENCE */}
      <section className="w-full bg-background py-16 lg:py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
              {t.trusted.title}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5 max-w-2xl">
              {t.trusted.subtitle}
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              {t.trusted.disclaimer}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.trusted.orgs.map((org: any, i: number) => (
              <motion.div
                key={org.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 rounded-xl p-6 flex flex-col text-start"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-white font-bold text-base leading-snug">{org.name}</h3>
                  <span className="text-[11px] font-mono text-muted-foreground shrink-0 whitespace-nowrap">{org.period}</span>
                </div>
                <span className="text-primary text-xs font-bold uppercase tracking-wider mb-3">{org.role}</span>
                <ul className="space-y-1.5">
                  {org.highlights.map((h: string) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                      <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES */}
      <section id="services" className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top Area */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <div className="max-w-2xl text-start">
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">{t.services.title}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {t.services.subtitle}
              </h2>
            </div>
            <div className="max-w-md flex flex-col items-start lg:items-end text-start lg:text-end">
              <p className="text-muted-foreground text-lg mb-6">
                {t.services.desc}
              </p>
              <Button
                onClick={() => openContactWithService("web")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 gap-2 rounded-full h-12 px-6"
              >
                {t.services.exploreServices}
                <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>

          <p className="text-primary/90 font-semibold text-base sm:text-lg mb-8 text-start">
            {t.services.tagline}
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              { icon: Monitor, title: t.services.customSoftware, desc: t.services.customSoftwareDesc, type: "software" },
              { icon: Globe, title: t.services.webApps, desc: t.services.webAppsDesc, type: "web" },
              { icon: Smartphone, title: t.services.mobileApps, desc: t.services.mobileAppsDesc, type: "mobile" },
              { icon: Bot, title: t.services.aiSolutions, desc: t.services.aiSolutionsDesc, type: "ai" },
              { icon: Cloud, title: t.services.cloud, desc: t.services.cloudDesc, type: "other" }
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => openContactWithService(service.type)}
                className="bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 p-6 rounded-xl flex flex-col group cursor-pointer text-start"
              >
                <div className="w-12 h-12 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary/10 transition-colors">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-6">{service.desc}</p>
                <ArrowRight className={`w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-all mt-auto ${lang === "ar" ? "rotate-180" : ""}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE NINUSOFT */}
      <section id="solutions" className="w-full bg-card/30 py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 w-full aspect-[16/10] sm:aspect-[4/3] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-border/50"
            >
              <img src="/office-why.webp" alt="NinuSoft Office" width={1024} height={1024} className="w-full h-full object-cover" loading="lazy" />
            </motion.div>

            {/* Right Content */}
            <div className="lg:col-span-7 text-start">
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">{t.why.title}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                {t.why.subtitle}
              </h2>
              <div className="w-20 h-1 bg-primary mb-12 rounded-full"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {[
                  { icon: Target, title: t.why.features.businessFocused, desc: t.why.features.businessFocusedDesc },
                  { icon: TrendingUp, title: t.why.features.scalable, desc: t.why.features.scalableDesc },
                  { icon: Cpu, title: t.why.features.modernTech, desc: t.why.features.modernTechDesc },
                  { icon: Lock, title: t.why.features.secure, desc: t.why.features.secureDesc },
                  { icon: Zap, title: t.why.features.fastDelivery, desc: t.why.features.fastDeliveryDesc },
                  { icon: Handshake, title: t.why.features.longTerm, desc: t.why.features.longTermDesc }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex gap-4 text-start"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5b. ABOUT / FOUNDER */}
      <section id="about" className="w-full bg-card/30 py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center mb-14 max-w-3xl mx-auto">
            <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">{t.about.kicker}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">{t.about.title}</h2>
            <div className="w-16 h-1 bg-primary rounded-full mb-8"></div>
            <h3 className="text-white font-bold text-lg mb-3">{t.about.storyTitle}</h3>
            <p className="text-muted-foreground leading-relaxed">{t.about.story}</p>
          </div>

          {/* Founder Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full bg-card border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl shadow-black/20"
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="shrink-0">
                <img
                  src="/founder-ahmed-mones.webp"
                  alt={t.about.founder.name}
                  loading="lazy"
                  width={1012}
                  height={1350}
                  className="w-48 sm:w-56 aspect-[3/4] rounded-2xl object-cover border-2 border-primary/30 shadow-xl shadow-primary/10 drop-shadow-[0_0_24px_rgba(201,163,58,0.2)]"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = "none";
                    const fallback = img.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="w-48 sm:w-56 aspect-[3/4] rounded-2xl border-2 border-primary/30 bg-primary/10 items-center justify-center text-primary font-extrabold text-3xl font-mono shadow-xl shadow-primary/10"
                  style={{ display: "none" }}
                >
                  AM
                </div>
              </div>
              <div className="text-center sm:text-start flex-1">
                <h3 className="text-white font-extrabold text-2xl mb-1">{t.about.founder.name}</h3>
                <span className="text-primary text-sm font-bold uppercase tracking-wider block mb-4">{t.about.founder.role}</span>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">{t.about.founder.bio}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                <a
                  href={t.about.founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <a
                  href={t.about.founder.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                {t.about.founder.instagram && (
                  <a
                    href={t.about.founder.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5c. ENGINEERING STANDARDS / TRUST */}
      <section className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center mb-14">
            <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">{t.trust.title}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">{t.trust.subtitle}</h2>
            <div className="w-16 h-1 bg-primary rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {t.trust.items.map((item: any, i: number) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="bg-card border border-border/50 rounded-xl p-5 flex items-start gap-3 text-start"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR PROJECTS */}
      <section id="projects" className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                {t.projectsSection.title}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                {t.projectsSection.subtitle}
              </h2>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                }}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-card text-muted-foreground border-border/50 hover:border-primary/50 hover:text-white"
                  }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Embla Carousel Viewport */}
          <div className="relative w-full">
            <div className="overflow-hidden cursor-grab active:cursor-grabbing rounded-xl" ref={emblaRef}>
              <div className="flex -ml-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex-[0_0_100%] min-w-0 pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                  >
                    <motion.div
                      layoutId={`project-${project.id}`}
                      onClick={() => { setSelectedProjectForModal(project); setProjectDialogMounted(true); }}
                      className="bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer flex flex-col h-full shadow-md hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div className="w-full aspect-[16/10] overflow-hidden bg-muted/40 flex items-center justify-center relative">
                        <img
                          src={project.img}
                          alt={project.title}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white text-xs font-semibold bg-primary px-3 py-1 rounded-full">
                            {t.projectsSection.viewDetails}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        {project.category && (
                          <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2">
                            {project.category}
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                        {project.org && project.group !== "product" && (
                          <span className="text-[11px] text-muted-foreground font-medium mb-2 block">{project.org}</span>
                        )}
                        <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">{project.desc}</p>
                        <div className="flex items-center text-primary font-medium text-sm mt-auto gap-2 group-hover:gap-3 transition-all">
                          {t.projectsSection.viewDetails}{" "}
                          <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Navigation - Only show if there are items to scroll */}
            {filteredProjects.length > 1 && (
              <div className="flex items-center justify-between mt-8">
                {/* Page dot indicators */}
                <div className="flex items-center gap-2">
                  {scrollSnaps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToSnap(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${i === selectedSnap
                        ? "w-6 bg-primary"
                        : "w-2 bg-border/70 hover:bg-primary/50"
                        }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    className="rounded-full border-border/50 text-white hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    className="rounded-full border-border/50 text-white hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    aria-label="Next slide"
                  >
                    <ChevronRight className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. OUR PROCESS */}
      <section id="process" className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top */}
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">{t.process.title}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              {t.process.subtitle}
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full"></div>
          </div>

          {/* Steps */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 lg:gap-2">
            {[
              { icon: Search, num: "01", title: t.process.steps.discover, desc: t.process.steps.discoverDesc },
              { icon: ClipboardList, num: "02", title: t.process.steps.plan, desc: t.process.steps.planDesc },
              { icon: PenTool, num: "03", title: t.process.steps.design, desc: t.process.steps.designDesc },
              { icon: Code2, num: "04", title: t.process.steps.develop, desc: t.process.steps.developDesc },
              { icon: Rocket, num: "05", title: t.process.steps.deliver, desc: t.process.steps.deliverDesc }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center w-full max-w-[280px] lg:max-w-[200px] group">
                  <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/10 transition-colors">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="text-primary font-bold text-sm mb-2">{step.num}</span>
                  <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden lg:flex flex-col items-center mt-8 text-primary/40 text-lg">
                    {lang === "ar" ? "←←" : "→→"}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      {t.testimonials.list.length > 0 && (
        <section className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            {/* Section Top */}
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                {t.testimonials.title}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                {t.testimonials.subtitle}
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full"></div>
            </div>

            {/* Testimonial Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {t.testimonials.list.map((review: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: idx * 0.15 }}
                  className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 shadow-md relative"
                >
                  {/* Gold Quote Mark Deco */}
                  <span className={`absolute top-4 ${lang === "ar" ? "left-6" : "right-6"} text-primary/10 text-6xl font-serif select-none pointer-events-none`}>
                    “
                  </span>

                  <div className="space-y-4">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    {/* Quote text */}
                    <p className="text-muted-foreground text-sm sm:text-base italic leading-relaxed text-start">
                      “{review.quote}”
                    </p>
                  </div>

                  {/* Reviewer Details */}
                  <div className="flex items-center gap-3.5 mt-8 pt-4 border-t border-border/20">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold uppercase font-mono text-sm shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div className="text-start">
                      <span className="text-sm font-bold text-white block">{review.name}</span>
                      <span className="text-xs text-muted-foreground block">
                        {review.role}{review.company ? `, ${review.company}` : ""}
                      </span>
                      {review.industry && (
                        <span className="text-[11px] text-primary/70 font-semibold uppercase tracking-wide block mt-0.5">{review.industry}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CTA BANNER */}
      <section id="contact" className="w-full bg-background pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full rounded-2xl bg-gradient-to-r from-card to-card/60 border border-primary/20 p-6 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12"
          >
            {/* Left */}
            <div className="w-full md:w-[45%] flex flex-col items-center md:items-start text-center md:text-start">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                {t.cta.title}
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8">
                {t.cta.subtitle}
              </p>
              <Button
                onClick={() => openContactWithService("web")}
                size="lg"
                className="w-full sm:w-auto rounded-lg font-bold px-8 h-12 sm:h-14 gap-2 text-primary-foreground bg-primary hover:bg-primary/90"
              >
                {t.cta.button}
                <ArrowRight className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {/* Right */}
            <div className="w-full md:w-[55%] flex justify-center md:justify-end">
              <img
                src="/cta-gate.webp"
                alt="Nineveh Gate CTA"
                width={1865}
                height={822}
                className="w-full h-auto max-w-[480px] md:max-w-none object-contain drop-shadow-[0_0_20px_rgba(201,163,58,0.25)]"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-border/50 bg-card/60 backdrop-blur-sm">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-5 items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="NinuSoft Logo" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold text-white">
                {lang === "en" ? (
                  <>Ninu<span className="text-primary">Soft</span></>
                ) : (
                  <>نينو<span className="text-primary">سوفت</span></>
                )}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.footer.brandDesc}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1">
              <a href="https://facebook.com/ninusoft" target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-testid="link-facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/ninusoft" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-testid="link-linkedin" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/ninusoft" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="link-instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://t.me/ninusoft" target="_blank" rel="noopener noreferrer" aria-label="Telegram" data-testid="link-telegram" className="text-muted-foreground hover:text-primary transition-colors">
                <Telegram className="w-5 h-5" />
              </a>
              <a href="https://github.com/ninusoft" target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-testid="link-github" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col gap-4 items-center sm:items-start text-center sm:text-start">
            <h4 className="text-white font-semibold text-base">{t.footer.quickLinks}</h4>
            <nav className="flex flex-col gap-3 items-center sm:items-start">
              {NAV_LINKS.map(({ key, href }) => (
                <a key={key} href={href} data-testid={`footer-link-${key}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                  {t.nav[key as keyof typeof t.nav]}
                </a>
              ))}
            </nav>
          </div>

          {/* Col 3: Services */}
          <div className="flex flex-col gap-4 items-center sm:items-start text-center sm:text-start">
            <h4 className="text-white font-semibold text-base">{t.footer.services}</h4>
            <nav className="flex flex-col gap-3 items-center sm:items-start">
              {SERVICES_LIST.map(({ key, href }) => (
                <a key={key} href={href} data-testid={`footer-service-${key}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                  {t.services[key as keyof typeof t.services]}
                </a>
              ))}
            </nav>
          </div>

          {/* Col 4: Contact Us */}
          <div className="flex flex-col gap-4 items-center sm:items-start text-center sm:text-start">
            <h4 className="text-white font-semibold text-base">{t.footer.contactUs}</h4>
            <div className="flex flex-col gap-4 items-center sm:items-start">
              <a href="mailto:info@ninusoft.com" data-testid="footer-contact-email"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                info@ninusoft.com
              </a>
              <a href="tel:+9647750977509" data-testid="footer-contact-phone"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span dir="ltr">+964 77 509 77 509</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                {t.footer.location}
              </div>
              <a href="https://ninusoft.com" target="_blank" rel="noopener noreferrer" data-testid="footer-contact-website"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                ninusoft.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Floating Button ─────────────────────────────────── */}
      <AnimatePresence>
        {!showIntro && (
          <motion.a
            key="whatsapp-fab"
            href="https://wa.me/9647750977509"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #25d366 0%, #128c4e 100%)",
              boxShadow: "0 4px 24px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: "#25d366" }}
            />
            <WhatsApp className="w-7 h-7 text-white relative z-10" />
          </motion.a>
        )}
      </AnimatePresence>

      {/* Contact Form Dialog — shell is eager so it opens instantly; only the
          heavy phone-input form fields are code-split and lazy-loaded. */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto bg-card border border-border/50 text-white rounded-2xl p-6 md:p-8">
          <DialogTitle className="text-2xl font-extrabold text-white mb-2 text-start">
            {t.contact.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mb-6 text-start">
            {t.contact.subtitle}
          </DialogDescription>
          {contactDialogMounted && (
            <React.Suspense fallback={<ContactFormSkeleton />}>
              <ContactFormFields
                t={t}
                lang={lang}
                contactProjectType={contactProjectType}
                setContactProjectType={setContactProjectType}
                phone={phone}
                setPhone={setPhone}
                isSubmitting={isSubmitting}
                onSubmit={handleContactSubmit}
              />
            </React.Suspense>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog (code-split: only loads once a project card is opened) */}
      {projectDialogMounted && (
        <React.Suspense fallback={null}>
          <ProjectDetailsDialog
            t={t}
            lang={lang}
            project={selectedProjectForModal}
            onClose={() => setSelectedProjectForModal(null)}
            onInquire={(project) => {
              openContactWithProject(project);
              setSelectedProjectForModal(null);
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
}