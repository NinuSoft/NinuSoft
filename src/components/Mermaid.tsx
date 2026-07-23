import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

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
  const rawId = useId();
  // Safe DOM id without colons
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
    <div
      className="mermaid-wrapper my-6 p-4 md:p-6 rounded-xl bg-card/60 border border-border/60 shadow-lg overflow-x-auto flex justify-center items-center backdrop-blur-sm"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
