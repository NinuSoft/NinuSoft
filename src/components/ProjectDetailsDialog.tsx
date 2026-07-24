import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, ExternalLink, CheckCircle2 } from "@/components/Icons";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Project } from "@/pages/Home";

interface ProjectDetailsDialogProps {
  t: any;
  lang: "en" | "ar";
  project: Project | null;
  onClose: () => void;
  onInquire: (project: Project) => void;
}

export default function ProjectDetailsDialog({ t, lang, project, onClose, onInquire }: ProjectDetailsDialogProps) {
  return (
    <Dialog open={project !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto bg-card border border-border/50 text-white rounded-2xl p-0">
        {project && (
          <div className="flex flex-col">

            {/* ── Hero image strip ───────────────────────────────────── */}
            <div className="w-full aspect-[16/9] overflow-hidden bg-muted/40 border-b border-border/40 relative rounded-t-2xl flex items-center justify-center">
              <img
                src={project.img}
                alt={project.title}
                className="w-full h-full object-contain p-6"
                loading="lazy"
              />
              {/* Category badge pinned top-right */}
              {project.category && (
                <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  {project.category}
                </span>
              )}
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 p-6 md:p-8">

              {/* Title + meta badges row */}
              <div className="flex flex-col gap-3 text-start">
                <DialogTitle className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {project.title}
                </DialogTitle>
                {project.org && (
                  <span className="text-xs font-semibold text-muted-foreground">{project.org}</span>
                )}
                {/* Tech stack chips */}
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                      style={{
                        background: "hsl(43 75% 49% / 0.08)",
                        borderColor: "hsl(43 75% 49% / 0.25)",
                        color: "hsl(43 75% 60%)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Challenge / Solution / Impact */}
              {(project.challenge || project.solution || project.impact) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {project.challenge && (
                    <div className="text-start">
                      <span className="text-primary text-[11px] font-bold uppercase tracking-wider block mb-1.5">{t.projectDetails.challenge}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{project.challenge}</p>
                    </div>
                  )}
                  {project.solution && (
                    <div className="text-start">
                      <span className="text-primary text-[11px] font-bold uppercase tracking-wider block mb-1.5">{t.projectDetails.solution}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{project.solution}</p>
                    </div>
                  )}
                  {project.impact && (
                    <div className="text-start">
                      <span className="text-primary text-[11px] font-bold uppercase tracking-wider block mb-1.5">{t.projectDetails.impact}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{project.impact}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <DialogDescription className="text-muted-foreground text-sm md:text-base leading-relaxed text-start">
                {project.details || project.desc}
              </DialogDescription>

              {/* Key Deliverables / Features grid */}
              {project.features && project.features.length > 0 && (
                <div className="rounded-xl border border-border/40 overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2"
                    style={{ background: "hsl(43 75% 49% / 0.06)" }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(43 75% 49%)" }} />
                    <span className="text-sm font-bold text-white">{t.projectDetails.features}</span>
                  </div>
                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {project.features.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 px-5 py-3.5 text-start text-sm text-muted-foreground border-b border-border/20 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
                        style={{ borderRight: idx % 2 === 0 ? "1px solid hsl(215 25% 18% / 0.6)" : undefined }}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                          style={{
                            background: "hsl(43 75% 49% / 0.12)",
                            color: "hsl(43 75% 49%)",
                            border: "1px solid hsl(43 75% 49% / 0.3)",
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex justify-end gap-3 pt-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-lg border-white/10 text-white hover:bg-white/10"
                >
                  {t.projectDetails.close}
                </Button>
                {project.websiteLink && (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-lg border-primary text-primary hover:bg-primary/10 gap-2"
                  >
                    <a href={project.websiteLink} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4" />
                      {t.projectDetails.visitWebsite}
                    </a>
                  </Button>
                )}
                {project.storeLink && (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-lg border-primary text-primary hover:bg-primary/10 gap-2"
                  >
                    <a href={project.storeLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      {t.projectDetails.viewStore}
                    </a>
                  </Button>
                )}
                {project.links?.map((link) => (
                  <Button
                    key={link.url}
                    asChild
                    variant="outline"
                    className="rounded-lg border-primary text-primary hover:bg-primary/10 gap-2"
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      {link.label}
                    </a>
                  </Button>
                ))}
                <Button
                  onClick={() => onInquire(project)}
                  className="rounded-lg font-bold gap-2 text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  {t.projectDetails.inquire}
                  <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
