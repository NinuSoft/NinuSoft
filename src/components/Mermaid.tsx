import { useEffect, useId, useState, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
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
  Loader2,
  RefreshCw,
} from "@/components/Icons";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  fontFamily: "Tahoma, Arial, system-ui, sans-serif",
  flowchart: {
    htmlLabels: true,
    useMaxWidth: true,
    wrappingWidth: 240,
  },
  themeVariables: {
    fontFamily: "Tahoma, Arial, system-ui, sans-serif",
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
    pie1: "#f59e0b",
    pie2: "#06b6d4",
    pie3: "#8b5cf6",
    pie4: "#10b981",
    pie5: "#f43f5e",
    pie6: "#3b82f6",
    pie7: "#eab308",
    pie8: "#14b8a6",
    pie9: "#d946ef",
    pie10: "#84cc16",
    pie11: "#f97316",
    pie12: "#6366f1",
  },
  securityLevel: "loose",
});

interface MermaidProps {
  chart: string;
}

const INLINE_DEFAULT_ZOOM = 1;
const MERMAID_MODULE_RECOVERY_KEY = "ninusoft-mermaid-module-recovery";

type TextDirection = "ltr" | "rtl";
type MermaidError = {
  kind: "syntax" | "module";
  message: string;
};

function isDynamicModuleError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|failed to fetch.*module|importing a module script failed|error loading.*module/i.test(
    message,
  );
}

function sortPieChartSections(chart: string): string {
  const lines = chart.split(/\r?\n/);
  const pieDeclarationIndex = lines.findIndex((line) => /^\s*pie\b/i.test(line));
  if (pieDeclarationIndex < 0) return chart;

  const sectionPattern =
    /^(\s*)(["'])(.*?)\2\s*:\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*$/;
  const sections = lines
    .map((line, index) => {
      const match = line.match(sectionPattern);
      return match && index > pieDeclarationIndex
        ? { index, line, value: Number(match[4]) }
        : null;
    })
    .filter(
      (section): section is { index: number; line: string; value: number } =>
        Boolean(section),
    );

  if (sections.length < 2) return chart;

  const sortedLines = [...sections]
    .sort((a, b) => b.value - a.value)
    .map(({ line }) => line);
  const sortedChartLines = [...lines];

  sections.forEach(({ index }, sortedIndex) => {
    sortedChartLines[index] = sortedLines[sortedIndex];
  });

  return sortedChartLines.join("\n");
}

function getTextDirection(text: string): TextDirection | null {
  const firstStrongCharacter = text.match(/[A-Za-z\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/)?.[0];
  if (!firstStrongCharacter) return null;

  return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(firstStrongCharacter)
    ? "rtl"
    : "ltr";
}

function applySvgTextDirections(root: Element) {
  const pieLegendTexts = root.querySelector(".pieTitleText")
    ? root.querySelectorAll<SVGTextElement>("g.legend text")
    : [];
  for (const textElement of pieLegendTexts) {
    const legendText = textElement.textContent || "";
    const valueMatch = legendText.match(
      /^(.*?)\s*\[([+-]?(?:\d+(?:\.\d+)?|\.\d+))\]\s*$/,
    );
    if (valueMatch) {
      const [, label] = valueMatch;
      textElement.textContent = label.trim();
    }
  }

  const textElements = Array.from(root.querySelectorAll<SVGTextElement>("text"));

  for (const textElement of textElements) {
    const direction = getTextDirection(textElement.textContent || "");
    if (!direction) continue;

    textElement.setAttribute("direction", direction);
    textElement.style.direction = direction;
    textElement.style.unicodeBidi = "plaintext";
  }

  const legendItems = Array.from(root.querySelectorAll<SVGGElement>("g.legend"))
    .map((group) => ({
      group,
      rect: group.querySelector<SVGRectElement>("rect"),
      text: group.querySelector<SVGTextElement>("text"),
    }))
    .filter(
      (item): item is {
        group: SVGGElement;
        rect: SVGRectElement;
        text: SVGTextElement;
      } => Boolean(item.rect && item.text),
    );

  if (legendItems.length === 0) return;

  const rtlItemCount = legendItems.filter(
    ({ text }) => getTextDirection(text.textContent || "") === "rtl",
  ).length;
  const titleDirection = getTextDirection(
    root.querySelector<SVGTextElement>(".pieTitleText")?.textContent || "",
  );

  if (titleDirection !== "rtl" && rtlItemCount <= legendItems.length / 2) return;

  const measurementHost = document.createElement("div");
  measurementHost.style.cssText =
    "position:fixed;inset:0 auto auto -10000px;width:1200px;visibility:hidden;pointer-events:none;";
  document.body.appendChild(measurementHost);

  try {
    measurementHost.appendChild(root);
    const longestTextWidth = Math.max(
      ...legendItems.map(({ text }) => text.getComputedTextLength()),
    );

    for (const { rect, text } of legendItems) {
      const direction = getTextDirection(text.textContent || "") || "rtl";
      const markerWidth = Number(rect.getAttribute("width")) || 18;
      const gap = 4;

      text.setAttribute("x", String(longestTextWidth));
      text.setAttribute("text-anchor", direction === "rtl" ? "start" : "end");
      rect.setAttribute("x", String(longestTextWidth + gap));
      rect.setAttribute("width", String(markerWidth));
    }
  } finally {
    measurementHost.remove();
  }
}

function prepareSvg(rawSvg: string): { markup: string; aspectRatio: number } {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(rawSvg, "image/svg+xml");
  const root = documentNode.documentElement;
  const viewBox = root.getAttribute("viewBox")?.trim().split(/\s+/).map(Number);
  let aspectRatio = 16 / 9;

  if (viewBox?.length === 4 && viewBox.every(Number.isFinite)) {
    const [x, y, width, height] = viewBox;
    const padding = Math.max(24, Math.min(width, height) * 0.035);
    aspectRatio = width / Math.max(height, 1);
    root.setAttribute(
      "viewBox",
      `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`,
    );
  }

  root.removeAttribute("width");
  root.removeAttribute("height");
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", "مخطط بياني");
  root.setAttribute(
    "style",
    "display:block;width:100%;height:auto;max-width:100%;overflow:visible;",
  );
  applySvgTextDirections(root);

  return {
    markup: new XMLSerializer().serializeToString(root),
    aspectRatio,
  };
}

function fitDiagram(
  width: number,
  height: number,
  aspectRatio: number,
  zoom: number,
  padding: number,
) {
  const availableWidth = Math.max(160, width - padding);
  const availableHeight = Math.max(160, height - padding);
  const availableRatio = availableWidth / availableHeight;
  const fittedWidth =
    aspectRatio >= availableRatio
      ? availableWidth
      : availableHeight * aspectRatio;
  const fittedHeight =
    aspectRatio >= availableRatio
      ? availableWidth / Math.max(aspectRatio, 0.1)
      : availableHeight;

  return {
    width: Math.round(fittedWidth * zoom),
    height: Math.round(fittedHeight * zoom),
  };
}

export default function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<MermaidError | null>(null);
  const [zoom, setZoom] = useState<number>(INLINE_DEFAULT_ZOOM);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [viewportWidth, setViewportWidth] = useState<number>(720);
  const [fullscreenZoom, setFullscreenZoom] = useState<number>(1);
  const [fullscreenSize, setFullscreenSize] = useState({ width: 1280, height: 720 });
  const [isDragging, setIsDragging] = useState(false);
  const [isInlineDragging, setIsInlineDragging] = useState(false);

  const rawId = useId();
  const elementId = `mermaid_${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const fullscreenViewportRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const inlineDragStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart || !chart.trim()) return;
      try {
        setError(null);
        await document.fonts?.ready;
        const preparedChart = sortPieChartSections(chart.trim());
        const { svg: rawSvg } = await mermaid.render(elementId, preparedChart);
        const preparedSvg = prepareSvg(rawSvg);

        if (isMounted) {
          setSvg(preparedSvg.markup);
          setAspectRatio(preparedSvg.aspectRatio);
          setZoom(INLINE_DEFAULT_ZOOM);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Mermaid rendering error:", err);
          const moduleError = isDynamicModuleError(err);
          if (moduleError) {
            try {
              const lastRecovery = Number(
                sessionStorage.getItem(MERMAID_MODULE_RECOVERY_KEY) || 0,
              );
              if (!lastRecovery || Date.now() - lastRecovery > 30_000) {
                sessionStorage.setItem(
                  MERMAID_MODULE_RECOVERY_KEY,
                  String(Date.now()),
                );
                window.location.reload();
                return;
              }
            } catch {
              // Continue to the recoverable error state.
            }
          }
          setError({
            kind: moduleError ? "module" : "syntax",
            message:
              err instanceof Error
                ? err.message
                : "تعذر عرض المخطط البياني (Mermaid).",
          });
        }
      }
    }

    void renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, elementId]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateSize = () => setViewportWidth(viewport.clientWidth);
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [svg]);

  useEffect(() => {
    if (!isFullscreen) return;
    const viewport = fullscreenViewportRef.current;
    if (!viewport) return;

    const updateSize = () => {
      setFullscreenSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setFullscreenZoom(1);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.4));
  const handleZoomReset = () => setZoom(INLINE_DEFAULT_ZOOM);
  const idealHeight = Math.round(
    Math.min(
      typeof window === "undefined" ? 780 : window.innerHeight * 0.8,
      840,
      Math.max(280, (viewportWidth - 48) / Math.max(aspectRatio, 0.1) + 48),
    ),
  );
  const inlineCanvas = fitDiagram(
    viewportWidth,
    idealHeight,
    aspectRatio,
    zoom,
    viewportWidth >= 768 ? 24 : 16,
  );
  const fullscreenCanvas = fitDiagram(
    fullscreenSize.width,
    fullscreenSize.height,
    aspectRatio,
    fullscreenZoom,
    fullscreenSize.width >= 768 ? 80 : 32,
  );

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

  const resetFullscreenView = () => {
    setFullscreenZoom(1);
    requestAnimationFrame(() => {
      fullscreenViewportRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  };

  const handlePanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const viewport = fullscreenViewportRef.current;
    if (!viewport) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setIsDragging(true);
  };

  const handlePanMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const viewport = fullscreenViewportRef.current;
    if (!viewport) return;

    viewport.scrollLeft =
      dragStateRef.current.scrollLeft - (event.clientX - dragStateRef.current.startX);
    viewport.scrollTop =
      dragStateRef.current.scrollTop - (event.clientY - dragStateRef.current.startY);
  };

  const handlePanEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleInlinePanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    inlineDragStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setIsInlineDragging(true);
  };

  const handleInlinePanMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!inlineDragStateRef.current.active) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollLeft =
      inlineDragStateRef.current.scrollLeft - (event.clientX - inlineDragStateRef.current.startX);
    viewport.scrollTop =
      inlineDragStateRef.current.scrollTop - (event.clientY - inlineDragStateRef.current.startY);
  };

  const handleInlinePanEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!inlineDragStateRef.current.active) return;
    inlineDragStateRef.current.active = false;
    setIsInlineDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (error) {
    return (
      <div className="mermaid-error border border-destructive/30 bg-destructive/10 text-destructive p-4 rounded-xl my-4 text-sm" dir="rtl">
        <p className="font-semibold mb-1 flex items-center gap-1.5">
          <XCircle className="w-4 h-4" />
          {error.kind === "module"
            ? "تعذر تحميل وحدة المخطط"
            : "خطأ في صياغة مخطط Mermaid"}
        </p>
        <p className="text-xs opacity-90" dir="ltr">{error.message}</p>
        {error.kind === "module" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              try {
                sessionStorage.removeItem(MERMAID_MODULE_RECOVERY_KEY);
              } catch {
                // Reload still works if storage is unavailable.
              }
              window.location.reload();
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            إعادة المحاولة
          </Button>
        ) : (
          <pre className="mt-2 text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto whitespace-pre-wrap" dir="ltr">{chart}</pre>
        )}
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        className="mermaid-loading my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017] shadow-[0_20px_55px_rgba(0,0,0,.22)]"
        dir="rtl"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-300/10 text-amber-300">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
          <div>
            <p className="text-xs font-extrabold text-white/85">جاري تجهيز المخطط</p>
            <p className="mt-1 text-[10px] text-white/35">يتم الآن ترتيب العناصر وحساب أفضل حجم للعرض</p>
          </div>
        </div>
        <div className="relative grid min-h-64 place-items-center overflow-hidden bg-black/25 p-8">
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(251,191,36,.06),transparent_48%)]" />
          <div className="relative flex flex-col items-center">
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] text-amber-300">
              <BarChart className="h-6 w-6" />
              <span className="absolute inset-0 animate-ping rounded-2xl border border-amber-300/10" />
            </div>
            <p className="mt-4 text-[11px] font-bold text-white/40">لحظات وسيظهر المخطط هنا</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mermaid-container my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0c1017] shadow-[0_20px_55px_rgba(0,0,0,.28)]">
      {/* Control Header Toolbar */}
      <div className="mermaid-toolbar flex items-center justify-between gap-2 px-4 py-3 bg-muted/50 border-b border-border/60 flex-wrap dir-rtl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <BarChart className="w-4 h-4" />
            <span>مخطط تفاعلي</span>
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
              {zoom === INLINE_DEFAULT_ZOOM ? "ملائم" : `${Math.round(zoom * 100)}%`}
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
      <div
        ref={viewportRef}
        dir="ltr"
        onPointerDown={handleInlinePanStart}
        onPointerMove={handleInlinePanMove}
        onPointerUp={handleInlinePanEnd}
        onPointerCancel={handleInlinePanEnd}
        className={`mermaid-viewport overflow-auto bg-black/30 p-4 md:p-6 ${
          isInlineDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ height: `${idealHeight}px`, touchAction: "none" }}
      >
        <div
          className="mermaid-svg-wrapper mx-auto transition-[width,height] duration-200 ease-out [&>svg]:block [&>svg]:!h-full [&>svg]:!w-full [&>svg]:!max-w-none [&>svg]:mx-auto [&>svg]:drop-shadow-lg"
          style={{
            width: `${inlineCanvas.width}px`,
            height: `${inlineCanvas.height}px`,
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {isFullscreen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col bg-[#080b11] text-white"
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-label="عرض المخطط بملء الشاشة"
          >
            <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0c1017] px-3 py-2 sm:px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-300/10 text-amber-300">
                  <BarChart className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-extrabold">المخطط البياني</h2>
                  <p className="mt-0.5 text-[10px] text-white/35">اسحب للتمرير بعد التكبير</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <div className="flex h-9 items-center rounded-xl border border-white/10 bg-white/[0.035] p-0.5">
                  <button
                    type="button"
                    onClick={() => setFullscreenZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))))}
                    className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-white/65 hover:bg-white/8 hover:text-white"
                    aria-label="تصغير المخطط"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={resetFullscreenView}
                    className="h-8 min-w-14 rounded-lg px-2 text-[10px] font-bold text-amber-300 hover:bg-white/8"
                    aria-label="ملاءمة المخطط مع الشاشة"
                  >
                    {fullscreenZoom === 1 ? "ملائم" : `${Math.round(fullscreenZoom * 100)}%`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFullscreenZoom((value) => Math.min(4, Number((value + 0.1).toFixed(2))))}
                    className="grid h-8 w-8 place-items-center rounded-lg text-white/65 hover:bg-white/8 hover:text-white"
                    aria-label="تكبير المخطط"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="hidden h-9 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-[11px] font-bold text-white/60 hover:bg-white/5 hover:text-white sm:flex"
                >
                  <Download className="h-3.5 w-3.5" />
                  SVG
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-amber-300 text-[#17130a] hover:bg-amber-200"
                  aria-label="إغلاق ملء الشاشة"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div
              ref={fullscreenViewportRef}
              dir="ltr"
              onPointerDown={handlePanStart}
              onPointerMove={handlePanMove}
              onPointerUp={handlePanEnd}
              onPointerCancel={handlePanEnd}
              className={`relative min-h-0 flex-1 select-none overflow-auto overscroll-contain bg-[radial-gradient(circle_at_center,rgba(251,191,36,.035),transparent_45%)] ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ touchAction: "none" }}
            >
              <div className="pointer-events-none fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0c1017]/90 px-3 py-1.5 text-[10px] font-bold text-white/45 shadow-xl backdrop-blur-md">
                <span className="text-sm" aria-hidden="true">✋</span>
                <span>{isDragging ? "حرّك المخطط..." : "اسحب لتحريك المخطط"}</span>
              </div>
              <div
                className="flex items-center justify-center p-4 sm:p-8"
                style={{
                  minWidth: `${Math.max(fullscreenSize.width, fullscreenCanvas.width + 64)}px`,
                  minHeight: `${Math.max(fullscreenSize.height, fullscreenCanvas.height + 64)}px`,
                }}
              >
                <div
                  className="mermaid-svg-wrapper shrink-0 transition-[width,height] duration-200 [&>svg]:block [&>svg]:!h-full [&>svg]:!w-full [&>svg]:!max-w-none [&>svg]:drop-shadow-2xl"
                  style={{
                    width: `${fullscreenCanvas.width}px`,
                    height: `${fullscreenCanvas.height}px`,
                  }}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
