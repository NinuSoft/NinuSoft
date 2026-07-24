import { useEffect, useId, useState } from "react";
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
    mainBkg: "#141c28",
    nodeBorder: "#e5c158",
    nodeTextColor: "#f1f5f9",
    lineColor: "#e5c158",
    textColor: "#f1f5f9",
    primaryColor: "#1b2536",
    primaryTextColor: "#f1f5f9",
    primaryBorderColor: "#e5c158",
    secondaryColor: "#17202e",
    secondaryTextColor: "#f1f5f9",
    secondaryBorderColor: "#334155",
    tertiaryColor: "#0f172a",
    tertiaryTextColor: "#f1f5f9",
    tertiaryBorderColor: "#334155",
    clusterBkg: "#0f172a",
    clusterBorder: "#334155",
    defaultLinkColor: "#e5c158",
    titleColor: "#e5c158",
    edgeLabelBackground: "#1e293b",
    actorBkg: "#141c28",
    actorBorder: "#e5c158",
    actorTextColor: "#f1f5f9",
    actorLineColor: "#e5c158",
    signalColor: "#e5c158",
    signalTextColor: "#f1f5f9",
    labelBoxBkgColor: "#141c28",
    labelBoxBorderColor: "#334155",
    labelTextColor: "#f1f5f9",
    loopTextColor: "#f1f5f9",
    noteBorderColor: "#e5c158",
    noteBkgColor: "#1e293b",
    noteTextColor: "#f1f5f9",
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
        const { svg: renderedSvg } = await mermaid.render(elementId, chart.trim());
        if (isMounted) {
          setSvg(renderedSvg);
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

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
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
    <div className="mermaid-container my-6 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md overflow-hidden shadow-2xl transition-all">
      {/* Control Header Toolbar */}
      <div className="mermaid-toolbar flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/40 border-b border-border/50 flex-wrap dir-rtl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <BarChart className="w-4 h-4" />
            <span>مخطط تفاعلي (Mermaid Diagram)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="inline-flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/50">
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
              className="px-2 h-7 flex items-center justify-center rounded-md text-[11px] font-mono hover:bg-muted transition-colors text-muted-foreground"
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
            className="h-7 text-xs font-bold px-2.5 flex items-center gap-1"
            onClick={() => setIsFullscreen(true)}
            title="ملء الشاشة"
          >
            <Maximize2 className="w-3.5 h-3.5" /> تكبير
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
      <div className="mermaid-viewport p-4 md:p-8 overflow-x-auto flex justify-center items-center min-h-[16rem] bg-black/20">
        <div
          className="mermaid-svg-wrapper transition-transform duration-200 ease-out origin-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto [&>svg]:drop-shadow-md"
          style={{ transform: `scale(${zoom})` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Fullscreen Backdrop Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col p-4 md:p-6 dir-rtl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <BarChart className="w-4 h-4" /> معاينة كاملة للمخطط البياني
              </span>
              <span className="text-xs text-muted-foreground font-mono">({Math.round(zoom * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleZoomOut}>-</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleZoomReset}>100%</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleZoomIn}>+</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDownloadSvg} className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> تنزيل SVG
              </Button>
              <Button type="button" variant="default" size="sm" onClick={() => setIsFullscreen(false)} className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> إغلاق
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div
              className="transition-transform duration-200 ease-out origin-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto [&>svg]:drop-shadow-lg"
              style={{ transform: `scale(${zoom})` }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
