import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    fontFamily: "Inter, sans-serif",
    darkMode: true,
    background: "transparent",
    mainBkg: "hsl(220, 28%, 10%)",
    nodeBorder: "hsl(43, 75%, 49%)",
    nodeTextColor: "hsl(210, 40%, 95%)",
    lineColor: "hsl(43, 75%, 60%)",
    textColor: "hsl(210, 40%, 95%)",
    primaryColor: "hsl(220, 25%, 15%)",
    primaryTextColor: "hsl(210, 40%, 95%)",
    primaryBorderColor: "hsl(43, 75%, 49%)",
    secondaryColor: "hsl(220, 30%, 12%)",
    secondaryTextColor: "hsl(210, 40%, 95%)",
    secondaryBorderColor: "hsl(215, 25%, 25%)",
    tertiaryColor: "hsl(220, 30%, 8%)",
    tertiaryTextColor: "hsl(210, 40%, 95%)",
    tertiaryBorderColor: "hsl(215, 25%, 25%)",
    clusterBkg: "hsl(220, 30%, 8%)",
    clusterBorder: "hsl(215, 25%, 25%)",
    defaultLinkColor: "hsl(43, 75%, 60%)",
    titleColor: "hsl(43, 75%, 60%)",
    edgeLabelBackground: "hsl(220, 25%, 12%)",
    actorBkg: "hsl(220, 28%, 10%)",
    actorBorder: "hsl(43, 75%, 49%)",
    actorTextColor: "hsl(210, 40%, 95%)",
    actorLineColor: "hsl(43, 75%, 60%)",
    signalColor: "hsl(43, 75%, 60%)",
    signalTextColor: "hsl(210, 40%, 95%)",
    labelBoxBkgColor: "hsl(220, 28%, 10%)",
    labelBoxBorderColor: "hsl(215, 25%, 25%)",
    labelTextColor: "hsl(210, 40%, 95%)",
    loopTextColor: "hsl(210, 40%, 95%)",
    noteBorderColor: "hsl(43, 75%, 49%)",
    noteBkgColor: "hsl(220, 25%, 15%)",
    noteTextColor: "hsl(210, 40%, 95%)",
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
        <p className="font-semibold mb-1">Mermaid Syntax Error</p>
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
    <div className="mermaid-container my-6 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden shadow-lg">
      {/* Control Header Toolbar */}
      <div className="mermaid-toolbar flex items-center justify-between gap-2 px-4 py-2 bg-card/80 border-b border-border/40 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span>📊</span> مخطط تفاعلي
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom Controls */}
          <div className="inline-flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold hover:bg-background transition-colors text-foreground"
              onClick={handleZoomOut}
              title="تصغير"
            >
              -
            </button>
            <button
              type="button"
              className="px-2 h-7 flex items-center justify-center rounded-md text-[11px] font-mono hover:bg-background transition-colors text-muted-foreground"
              onClick={handleZoomReset}
              title="إعادة ضبط الحجم"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold hover:bg-background transition-colors text-foreground"
              onClick={handleZoomIn}
              title="تكبير"
            >
              +
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold px-2.5"
            onClick={() => setIsFullscreen(true)}
            title="ملء الشاشة"
          >
            ⛶ تكبير
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold px-2.5"
            onClick={handleDownloadSvg}
            title="تنزيل SVG"
          >
            📥 SVG
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-bold px-2.5"
            onClick={handleCopyCode}
            title="نسخ الكود"
          >
            {copied ? "✓ تم النسخ" : "📋 الكود"}
          </Button>
        </div>
      </div>

      {/* Rendered SVG Content */}
      <div className="mermaid-viewport p-4 md:p-6 overflow-x-auto flex justify-center items-center min-h-[14rem]">
        <div
          className="mermaid-svg-wrapper transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Fullscreen Backdrop Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col p-4 md:p-6 dir-rtl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">📊 معاينة كاملة للمخطط البياني</span>
              <span className="text-xs text-muted-foreground font-mono">({Math.round(zoom * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleZoomOut}>-</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleZoomReset}>100%</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleZoomIn}>+</Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDownloadSvg}>📥 تنزيل SVG</Button>
              <Button type="button" variant="default" size="sm" onClick={() => setIsFullscreen(false)}>إغلاق ✕</Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div
              className="transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${zoom})` }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
