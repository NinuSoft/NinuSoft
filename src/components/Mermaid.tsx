import { useEffect, useId, useState, useRef } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Copy,
  Download,
  CheckCircle,
  Plus,
  Maximize2,
  XCircle,
} from "@/components/Icons";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    fontFamily: "Inter, system-ui, sans-serif",
    darkMode: true,
    background: "transparent",
    mainBkg: "#111827",
    nodeBorder: "#f59e0b",
    nodeTextColor: "#f9fafb",
    lineColor: "#f59e0b",
    textColor: "#f9fafb",
    primaryColor: "#1e293b",
    primaryTextColor: "#f9fafb",
    primaryBorderColor: "#f59e0b",
    secondaryColor: "#1e293b",
    secondaryTextColor: "#f9fafb",
    secondaryBorderColor: "#475569",
    tertiaryColor: "#0f172a",
    tertiaryTextColor: "#f9fafb",
    tertiaryBorderColor: "#475569",
    clusterBkg: "#0f172a",
    clusterBorder: "#475569",
    defaultLinkColor: "#f59e0b",
    titleColor: "#f59e0b",
    edgeLabelBackground: "#1e293b",
    actorBkg: "#111827",
    actorBorder: "#f59e0b",
    actorTextColor: "#f9fafb",
    actorLineColor: "#f59e0b",
    signalColor: "#f59e0b",
    signalTextColor: "#f9fafb",
    labelBoxBkgColor: "#111827",
    labelBoxBorderColor: "#475569",
    labelTextColor: "#f9fafb",
    loopTextColor: "#f9fafb",
    noteBorderColor: "#f59e0b",
    noteBkgColor: "#1e293b",
    noteTextColor: "#f9fafb",
  },
  securityLevel: "loose",
});

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const rawId = useId();
  const elementId = `mermaid_${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart || !chart.trim()) return;
      try {
        setError(null);
        const { svg: rawSvg } = await mermaid.render(elementId, chart.trim());
        
        // Remove restrictive inline max-width/style so SVG scales dynamically 100%
        const cleanedSvg = rawSvg
          .replace(/style="[^"]*max-width:[^"]*"/gi, 'style="width:100%; height:auto;"')
          .replace(/max-width:\s*\d+px;/gi, "width: 100%; height: auto;");

        if (isMounted) {
          setSvg(cleanedSvg);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Mermaid rendering error:", err);
          setError(err instanceof Error ? err.message : "تعذر عرض المخطط البياني (Mermaid).");
        }
      }
    }

    void renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, elementId]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.4));
  const handleZoomReset = () => setZoom(1);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="mermaid-error border border-destructive/30 bg-destructive/10 text-destructive p-4 rounded-xl my-4 text-sm font-mono dir-ltr">
        <p className="font-semibold mb-1 flex items-center gap-1.5">
          <XCircle className="w-4 h-4" /> Mermaid Syntax Error
        </p>
        <p className="text-xs opacity-90">{error}</p>
        <pre className="mt-2 text-xs bg-background/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-loading flex items-center justify-center p-8 my-4 rounded-xl bg-card/40 border border-border/40 text-muted-foreground text-sm">
        <span>جاري تحميل المخطط البياني…</span>
      </div>
    );
  }

  return (
    <div className="mermaid-container my-6 rounded-2xl border border-border/70 bg-card/90 backdrop-blur-md overflow-hidden shadow-2xl transition-all">
      {/* Control Header Toolbar */}
      <div className="mermaid-toolbar flex items-center justify-between gap-2 px-4 py-3 bg-muted/50 border-b border-border/60 flex-wrap dir-rtl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <BarChart className="w-4 h-4" />
            <span>مخطط بياني تفاعلي (Mermaid)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="inline-flex items-center gap-1 bg-background/90 p-0.5 rounded-lg border border-border/60">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold hover:bg-muted transition-colors text-foreground"
              onClick={handleZoomOut}
              title="تصغير"
            >
              -
            </button>
            <button
              type="button"
              className="px-2 h-7 flex items-center justify-center rounded-md text-[11px] font-mono hover:bg-muted transition-colors text-amber-400 font-bold"
              onClick={handleZoomReset}
              title="إعادة ضبط الحجم"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold hover:bg-muted transition-colors text-foreground"
              onClick={handleZoomIn}
              title="تكبير"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold px-2.5 flex items-center gap-1 bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
            onClick={() => setIsFullscreen(true)}
            title="تكبير ملء الشاشة"
          >
            <Maximize2 className="w-3.5 h-3.5" /> ملء الشاشة
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold px-2.5 flex items-center gap-1"
            onClick={handleDownloadSvg}
            title="تنزيل SVG"
          >
            <Download className="w-3.5 h-3.5" /> SVG
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold px-2.5 flex items-center gap-1"
            onClick={handleCopyCode}
            title="نسخ الكود"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> تم النسخ
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> الكود
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Rendered SVG Content */}
      <div className="mermaid-viewport p-4 md:p-6 overflow-x-auto overflow-y-hidden flex justify-center items-center min-h-[16rem] bg-black/30">
        <div
          className="mermaid-svg-wrapper w-full flex justify-center items-center transition-transform duration-200 ease-out origin-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:mx-auto [&>svg]:drop-shadow-lg"
          style={{ transform: `scale(${zoom})` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Fullscreen Modal View (Full Screen Dynamic Scaling) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-lg flex flex-col p-4 md:p-6 dir-rtl animate-in fade-in duration-200 overflow-hidden">
          {/* Header Controls Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <BarChart className="w-5 h-5" /> معاينة المخطط البياني (Full Screen View)
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleZoomOut} className="font-mono font-bold">-</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleZoomReset} className="font-mono text-xs">100%</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleZoomIn} className="font-mono font-bold">+</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDownloadSvg} className="flex items-center gap-1 text-xs">
                <Download className="w-3.5 h-3.5 text-amber-400" /> تنزيل SVG
              </Button>
              <Button type="button" variant="default" size="sm" onClick={() => setIsFullscreen(false)} className="flex items-center gap-1 bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs">
                <XCircle className="w-4 h-4" /> إغلاق
              </Button>
            </div>
          </div>

          {/* Fullscreen Dynamic Canvas */}
          <div className="flex-1 w-full h-full overflow-auto p-4 md:p-12 flex items-center justify-center bg-black/60 rounded-2xl my-4 border border-border/50 shadow-2xl">
            <div
              className="w-full h-full min-h-[60vh] flex items-center justify-center transition-transform duration-200 ease-out origin-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[85vh] [&>svg]:mx-auto [&>svg]:drop-shadow-2xl"
              style={{ transform: `scale(${zoom})` }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
