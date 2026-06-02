import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Headphones, Settings, Shield, Users2, Monitor, Globe, Smartphone, Bot, Cloud, Target, TrendingUp, Cpu, Lock, Zap, Handshake, Search, ClipboardList, PenTool, Code2, Rocket, Mail, Phone, MapPin, ExternalLink, Menu } from "lucide-react";
import { FaFacebook as Facebook, FaLinkedin as Linkedin, FaInstagram as Instagram, FaGithub as Github, FaTelegram as Telegram } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PROJECTS_DATA from "@/data/projects.json";

interface Project {
  id: number;
  category: string;
  title: string;
  desc: string;
  img: string;
  details: string;
  tech: string[];
  features: string[];
}

const PROJECTS = PROJECTS_DATA as Project[];

const logoLarge = "/logo.png";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Solutions", href: "#solutions" },
  { label: "Projects", href: "#projects" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<typeof PROJECTS[0] | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const { toast } = useToast();

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleContactSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsContactOpen(false);
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We will get back to you shortly.",
    });
  };

  const filteredProjects = selectedCategory === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === selectedCategory);

  const itemsPerPage = width < 768 ? 1 : width < 1024 ? 2 : 3;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  React.useEffect(() => {
    setActiveSlide(0);
  }, [selectedCategory, itemsPerPage]);

  const visibleProjects = filteredProjects.slice(
    activeSlide * itemsPerPage,
    (activeSlide + 1) * itemsPerPage
  );

  React.useEffect(() => {
    const ids = ["home", "services", "solutions", "projects", "about", "contact"];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3, rootMargin: "-60px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground selection:bg-primary/30 font-sans relative">
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
          <span className="text-xl font-bold tracking-tight text-white">NinuSoft</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ label, href }) => {
            const id = href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={label}
                href={href}
                data-testid={`nav-link-${id}`}
                className={`transition-colors relative pb-0.5 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </a>
            );
          })}
        </div>

        <Button
          onClick={() => setIsContactOpen(true)}
          className="hidden md:flex gap-2 rounded-full font-semibold px-6 shadow-lg shadow-primary/20"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Mobile Navigation Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white" aria-label="Toggle menu">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 backdrop-blur border-border/50 p-6 flex flex-col justify-between w-[300px]">
            <div className="flex flex-col gap-8 mt-8">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="NinuSoft Logo" className="h-9 w-auto object-contain" />
                <span className="text-xl font-bold tracking-tight text-white">Ninu<span className="text-primary">Soft</span></span>
              </div>
              <div className="flex flex-col gap-4 text-base font-medium">
                {NAV_LINKS.map(({ label, href }) => {
                  const id = href.replace("#", "");
                  const isActive = activeSection === id;
                  return (
                    <SheetClose asChild key={label}>
                      <a
                        href={href}
                        className={`transition-colors py-2 border-b border-border/10 ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {label}
                      </a>
                    </SheetClose>
                  );
                })}
              </div>
            </div>
            <SheetClose asChild>
              <Button
                onClick={() => setIsContactOpen(true)}
                className="w-full gap-2 rounded-full font-semibold px-6 py-5 shadow-lg shadow-primary/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </nav>

      {/* 2. HERO SECTION */}
      <main id="home" className="flex-1 w-full relative overflow-hidden min-h-[calc(100vh-73px)] flex">

        {/* LEFT — content area, solid dark background */}
        <div className="relative z-10 w-full lg:w-[55%] flex items-center bg-background px-6 lg:px-16 py-16 md:py-24 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-start w-full max-w-xl"
          >
            {/* Logo + Name side by side */}
            <div className="flex items-center gap-5 mb-6">
              <img
                src={logoLarge}
                alt="NinuSoft Logo"
                className="h-[110px] md:h-[130px] w-auto object-contain drop-shadow-[0_0_20px_rgba(201,163,58,0.25)]"
              />
              <h1 className="text-6xl md:text-7xl lg:text-7xl font-extrabold tracking-tight leading-none">
                <span className="text-white">Ninu</span><span className="text-primary">Soft</span>
              </h1>
            </div>

            <h2 className="text-sm md:text-base font-bold tracking-[0.3em] text-muted-foreground mb-6 uppercase">
              Software Solutions From Nineveh
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-[480px] leading-relaxed">
              We build powerful, scalable and intelligent software solutions that help businesses grow, automate and succeed in the digital world.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Button
                onClick={() => setIsContactOpen(true)}
                size="lg"
                className="rounded-full font-semibold px-8 h-14 shadow-xl shadow-primary/30 gap-2"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => {
                  const el = document.getElementById("services");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                size="lg"
                variant="outline"
                className="rounded-full font-semibold px-8 h-14 border-white/30 text-white hover:bg-white/10 gap-2"
                data-testid="button-view-services"
              >
                View Services
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium bg-secondary/50 py-3 px-5 rounded-full border border-border/50">
              <Shield className="w-5 h-5 text-primary" />
              Trusted by businesses across Iraq and beyond
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Ishtar Gate image, right side only */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="hidden lg:block lg:w-[45%] relative shrink-0"
        >
          {/* Gradient fade on left edge to blend with content */}
          <div className="absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
          {/* Gradient fade on bottom edge */}
          <div className="absolute inset-x-0 bottom-0 h-32 z-10 bg-gradient-to-t from-background to-transparent" />
          <img
            src="/hero-gate.webp"
            alt="Ishtar Gate — Ancient Nineveh"
            className="w-full h-full object-cover object-left"
          />
        </motion.div>

      </main>

      {/* 3. STATS BAR */}
      <div className="w-full border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-border/50">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-muted-foreground" />
                <span className="text-3xl font-bold text-primary">50+</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Projects Completed</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="flex items-center gap-3 mb-2">
                <Users2 className="w-6 h-6 text-muted-foreground" />
                <span className="text-3xl font-bold text-primary">30+</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Happy Clients</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-6 h-6 text-muted-foreground" />
                <span className="text-3xl font-bold text-primary">5+</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Years Experience</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="flex items-center gap-3 mb-2">
                <Headphones className="w-6 h-6 text-muted-foreground" />
                <span className="text-3xl font-bold text-primary">24/7</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Support Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OUR SERVICES */}
      <section id="services" className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top Area */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Our Services</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Complete Software Solutions For Your Business
              </h2>
            </div>
            <div className="max-w-md flex flex-col items-start lg:items-end">
              <p className="text-muted-foreground text-lg mb-6 lg:text-right">
                We offer end-to-end software services to help you build, scale and transform your business.
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 gap-2 rounded-full h-12 px-6">
                Explore All Services
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Monitor, title: "Custom Software Development", desc: "Tailored software solutions built to your unique business needs and requirements." },
              { icon: Globe, title: "Web Applications", desc: "Modern, responsive and high performance web applications." },
              { icon: Smartphone, title: "Mobile App Development", desc: "Native and cross-platform apps for iOS and Android." },
              { icon: Bot, title: "AI Solutions & Automation", desc: "Robust AI tools and automation to supercharge your business." },
              { icon: Cloud, title: "Cloud & System Integration", desc: "Cloud solutions, architecture, and enterprise system integrations." }
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card border border-border/50 hover:border-primary/50 transition-colors p-6 rounded-xl flex flex-col group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary/10 transition-colors">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-6">{service.desc}</p>
                <ArrowRight className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity mt-auto" />
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
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-border/50"
            >
              <img src="/office-why.png" alt="NinuSoft Office" className="w-full h-full object-cover" />
            </motion.div>

            {/* Right Content */}
            <div className="lg:col-span-7">
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Why Choose NinuSoft?</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                We Build Solutions That Drive Real Results
              </h2>
              <div className="w-20 h-1 bg-primary mb-12 rounded-full"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {[
                  { icon: Target, title: "Business Focused", desc: "We align our technology strategy with your business goals." },
                  { icon: TrendingUp, title: "Scalable Solutions", desc: "Built to grow seamlessly alongside your enterprise." },
                  { icon: Cpu, title: "Modern Technology", desc: "Using the latest frameworks and proven architectures." },
                  { icon: Lock, title: "Secure & Reliable", desc: "Enterprise-grade security and robust infrastructure." },
                  { icon: Zap, title: "Fast Delivery", desc: "Agile methodologies ensuring rapid time-to-market." },
                  { icon: Handshake, title: "Long-Term Partner", desc: "Dedicated support and continuous evolution of your product." }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex gap-4"
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

      {/* 6. OUR PROJECTS */}
      <section id="projects" className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Our Projects</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Some Of Our Recent Work
              </h2>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 gap-2 rounded-full px-6">
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {["All", "Business", "Retail", "Logistics", "AI & Automation"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveSlide(0);
                }}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-card text-muted-foreground border-border/50 hover:border-primary/50 hover:text-white"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="relative min-h-[460px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${activeSlide}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {visibleProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layoutId={`project-${project.id}`}
                    onClick={() => setSelectedProjectForModal(project)}
                    className="bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer flex flex-col h-full shadow-md hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-muted relative">
                      <img src={project.img} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white text-xs font-semibold bg-primary px-3 py-1 rounded-full">
                          View details
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2">{project.category}</span>
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">{project.desc}</p>
                      <div className="flex items-center text-primary font-medium text-sm mt-auto gap-2 group-hover:gap-3 transition-all">
                        View details <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, dot) => (
                <button
                  key={dot}
                  onClick={() => setActiveSlide(dot)}
                  className={`w-3 h-3 rounded-full transition-colors ${activeSlide === dot ? 'bg-primary' : 'border border-primary/40 bg-transparent hover:border-primary'}`}
                  aria-label={`Go to slide ${dot + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. OUR PROCESS */}
      <section id="about" className="w-full bg-background py-20 lg:py-28 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Top */}
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Our Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              How We Work
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full"></div>
          </div>

          {/* Steps */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 lg:gap-2">
            {[
              { icon: Search, num: "01", title: "Discover", desc: "We analyze your situation and understand your business needs." },
              { icon: ClipboardList, num: "02", title: "Plan", desc: "We develop a clear roadmap and strategy for your project." },
              { icon: PenTool, num: "03", title: "Design", desc: "We design modern and user-friendly experiences." },
              { icon: Code2, num: "04", title: "Develop", desc: "We build your solution with best-in-class skills." },
              { icon: Rocket, num: "05", title: "Deliver", desc: "We test, deliver and support your finished product." }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center max-w-[200px] group">
                  <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/10 transition-colors">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="text-primary font-bold text-sm mb-2">{step.num}</span>
                  <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden lg:flex flex-col items-center mt-8 text-primary/40 text-lg">
                    →→
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA BANNER */}
      <section id="contact" className="w-full bg-background pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full rounded-2xl bg-gradient-to-r from-card to-card/60 border border-primary/20 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12"
          >
            {/* Left */}
            <div className="md:w-[55%] flex flex-col items-start text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                Ready To Start Your Project?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Let's build something amazing together.
              </p>
              <Button
                onClick={() => setIsContactOpen(true)}
                size="lg"
                className="rounded-lg font-bold px-8 h-14 gap-2 text-primary-foreground bg-primary hover:bg-primary/90"
              >
                Get In Touch
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Right */}
            <div className="md:w-[45%] flex justify-center md:justify-end">
              <img
                src="/cta-gate.png"
                alt="Nineveh Gate CTA"
                className="max-h-[350px] object-contain drop-shadow-[0_0_15px_rgba(201,163,58,0.2)]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-border/50 bg-card/60 backdrop-blur-sm">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img src={logoLarge} alt="NinuSoft Logo" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold text-white">Ninu<span className="text-primary">Soft</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Software solutions from Nineveh. We help businesses transform and grow with technology.
            </p>
            <div className="flex items-center gap-4 mt-1">
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
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold text-base">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              {["Home", "Services", "Solutions", "Projects", "About Us", "Contact"].map((item) => (
                <a key={item} href="#" data-testid={`footer-link-${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Col 3: Services */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold text-base">Services</h4>
            <nav className="flex flex-col gap-3">
              {["Custom Software", "Web Applications", "Mobile Apps", "AI Solutions", "Cloud & Integration"].map((item) => (
                <a key={item} href="#" data-testid={`footer-service-${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Col 4: Contact Us */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold text-base">Contact Us</h4>
            <div className="flex flex-col gap-4">
              <a href="mailto:info@ninusoft.com" data-testid="footer-contact-email"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                info@ninusoft.com
              </a>
              <a href="tel:+9647750977509" data-testid="footer-contact-phone"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                +964 77 509 77 509
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                Mosul, Iraq
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
              © 2026 NinuSoft. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" data-testid="footer-privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" data-testid="footer-terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Form Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-lg bg-card border border-border/50 text-white rounded-2xl p-6 md:p-8">
          <DialogTitle className="text-2xl font-extrabold text-white mb-2">
            Let's build something amazing
          </DialogTitle>
          <p className="text-muted-foreground text-sm mb-6">
            Fill out the form below and our team will get back to you within 24 hours.
          </p>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-muted-foreground">Full Name</label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter your name"
                className="bg-background border-border/50 text-white h-11 focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-muted-foreground">Email Address</label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="bg-background border-border/50 text-white h-11 focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="projectType" className="text-sm font-semibold text-muted-foreground">Project Type</label>
              <Select name="projectType" defaultValue="web">
                <SelectTrigger className="bg-background border-border/50 text-white h-11 focus:ring-primary">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 text-white">
                  <SelectItem value="software">Custom Software</SelectItem>
                  <SelectItem value="web">Web Application</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="ai">AI Solutions & Automation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-semibold text-muted-foreground">Message</label>
              <Textarea
                id="message"
                name="message"
                required
                placeholder="Tell us about your project..."
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
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}