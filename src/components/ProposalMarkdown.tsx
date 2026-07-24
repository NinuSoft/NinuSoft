import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "@/components/Mermaid";
import { Tag, FileText, CheckCircle, XCircle } from "@/components/Icons";

function extractText(node: any): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node.props?.children) return extractText(node.props.children);
  return "";
}

function getTableLayoutClass(children: any): string {
  try {
    const childrenArray = React.Children.toArray(children);
    const thead = childrenArray.find((child: any) => child?.type === "thead");
    if (!thead) return "";

    const theadTr = React.Children.toArray((thead as any).props?.children).find(
      (child: any) => child?.type === "tr"
    );
    if (!theadTr) return "";

    const ths = React.Children.toArray((theadTr as any).props?.children).filter(
      (child: any) => child?.type === "th"
    );

    if (ths.length !== 2) return "";

    const tbody = childrenArray.find((child: any) => child?.type === "tbody");
    if (!tbody) return "table-col1-compact";

    const trs = React.Children.toArray((tbody as any).props?.children).filter(
      (child: any) => child?.type === "tr"
    );

    let col1Length = 0;
    let col2Length = 0;
    let rowCount = 0;

    for (const tr of trs) {
      const tds = React.Children.toArray((tr as any).props?.children).filter(
        (child: any) => child?.type === "td"
      );
      if (tds.length >= 2) {
        col1Length += extractText(tds[0]).length;
        col2Length += extractText(tds[1]).length;
        rowCount++;
      }
    }

    if (rowCount === 0) return "table-col1-compact";

    const avgCol1 = col1Length / rowCount;
    const avgCol2 = col2Length / rowCount;

    return avgCol2 >= avgCol1 ? "table-col1-compact" : "table-col2-compact";
  } catch {
    return "";
  }
}

function walkAst(node: any, visitor: (n: any) => void) {
  visitor(node);
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => walkAst(child, visitor));
  }
}

export function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-");
}

const ALERT_PATTERN = /^\s*\[!(NOTE|INFO|TIP|HINT|IMPORTANT|SUCCESS|DONE|CHECK|WARNING|CAUTION|DANGER|ERROR|QUESTION|HELP|FAQ)\]/i;
const STRIP_PATTERN = /^\s*\[!(NOTE|INFO|TIP|HINT|IMPORTANT|SUCCESS|DONE|CHECK|WARNING|CAUTION|DANGER|ERROR|QUESTION|HELP|FAQ)\]\s*\n?/;

function getAlertType(rawType: string): string {
  const t = rawType.toUpperCase();
  if (t === "INFO" || t === "NOTE") return "note";
  if (t === "TIP" || t === "HINT") return "tip";
  if (t === "IMPORTANT") return "important";
  if (t === "SUCCESS" || t === "DONE" || t === "CHECK") return "success";
  if (t === "WARNING") return "warning";
  if (t === "CAUTION" || t === "DANGER" || t === "ERROR") return "caution";
  if (t === "QUESTION" || t === "HELP" || t === "FAQ") return "question";
  return "note";
}

export function remarkAlerts() {
  return (tree: any) => {
    walkAst(tree, (node: any) => {
      // 1. Blockquote format: > [!NOTE]
      if (node.type === "blockquote" && node.children && node.children.length > 0) {
        const firstPara = node.children[0];
        if (firstPara && firstPara.type === "paragraph" && firstPara.children && firstPara.children.length > 0) {
          const firstTextNode = firstPara.children[0];
          if (firstTextNode && firstTextNode.type === "text") {
            const match = firstTextNode.value.match(ALERT_PATTERN);
            if (match) {
              const alertType = getAlertType(match[1]);
              node.data = node.data || {};
              node.data.hProperties = node.data.hProperties || {};
              node.data.hProperties["data-alert-type"] = alertType;
              firstTextNode.value = firstTextNode.value.replace(STRIP_PATTERN, "");
              if (!firstTextNode.value && firstPara.children.length > 1) {
                firstPara.children.shift();
              }
            }
          }
        }
      }

      // 2. Direct paragraph format: [!NOTE] text (without >)
      if (node.type === "paragraph" && node.children && node.children.length > 0) {
        const firstTextNode = node.children[0];
        if (firstTextNode && firstTextNode.type === "text") {
          const match = firstTextNode.value.match(ALERT_PATTERN);
          if (match) {
            const alertType = getAlertType(match[1]);
            firstTextNode.value = firstTextNode.value.replace(STRIP_PATTERN, "");

            const originalChildren = [...node.children];
            node.type = "blockquote";
            node.children = [
              {
                type: "paragraph",
                children: originalChildren,
              },
            ];
            node.data = node.data || {};
            node.data.hProperties = node.data.hProperties || {};
            node.data.hProperties["data-alert-type"] = alertType;
          }
        }
      }
    });
  };
}

export const proposalMarkdownComponents = {
  table(props: any) {
    const { children, className, ...rest } = props;
    const layoutClass = getTableLayoutClass(children);
    const combinedClassName = [layoutClass, className].filter(Boolean).join(" ");
    return (
      <div className="proposal-table-scroll">
        <table className={combinedClassName || undefined} {...rest}>
          {children}
        </table>
      </div>
    );
  },
  th(props: any) {
    const { align, children, style, ...rest } = props;
    const computedStyle = { ...style };
    if (align) computedStyle.textAlign = align;
    return (
      <th dir="auto" style={Object.keys(computedStyle).length > 0 ? computedStyle : undefined} {...rest}>
        {children}
      </th>
    );
  },
  td(props: any) {
    const { align, children, style, ...rest } = props;
    const computedStyle = { ...style };
    if (align) computedStyle.textAlign = align;
    return (
      <td dir="auto" style={Object.keys(computedStyle).length > 0 ? computedStyle : undefined} {...rest}>
        {children}
      </td>
    );
  },
  p(props: any) {
    return <p dir="auto" {...props} />;
  },
  li(props: any) {
    return <li dir="auto" {...props} />;
  },
  h1(props: any) {
    const text = typeof props.children === "string" ? props.children : "";
    const id = slugify(text);
    return <h1 id={id || undefined} dir="auto" {...props} />;
  },
  h2(props: any) {
    const text = typeof props.children === "string" ? props.children : "";
    const id = slugify(text);
    return <h2 id={id || undefined} dir="auto" {...props} />;
  },
  h3(props: any) {
    const text = typeof props.children === "string" ? props.children : "";
    const id = slugify(text);
    return <h3 id={id || undefined} dir="auto" {...props} />;
  },
  a(props: any) {
    const { href, children, ...rest } = props;

    if (href) {
      // YouTube Embed
      const ytMatch = href.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (ytMatch && ytMatch[1]) {
        return (
          <div className="my-4 rounded-2xl overflow-hidden border border-border/60 bg-card shadow-xl aspect-video w-full max-w-3xl mx-auto">
            <a className="proposal-media-print-link" href={href}>
              <FileText className="w-4 h-4" />
              <span>رابط فيديو YouTube: {href}</span>
            </a>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytMatch[1]}`}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      // Loom Embed
      const loomMatch = href.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i);
      if (loomMatch && loomMatch[1]) {
        return (
          <div className="my-4 rounded-2xl overflow-hidden border border-border/60 bg-card shadow-xl aspect-video w-full max-w-3xl mx-auto">
            <a className="proposal-media-print-link" href={href}>
              <FileText className="w-4 h-4" />
              <span>رابط فيديو Loom: {href}</span>
            </a>
            <iframe
              src={`https://www.loom.com/embed/${loomMatch[1]}`}
              title="Loom video player"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        );
      }

      // Direct MP4 Video
      if (href.endsWith(".mp4") || href.endsWith(".webm")) {
        return (
          <div className="my-4 rounded-2xl overflow-hidden border border-border/60 bg-card shadow-xl w-full max-w-3xl mx-auto">
            <a className="proposal-media-print-link" href={href}>
              <FileText className="w-4 h-4" />
              <span>رابط ملف الفيديو: {href}</span>
            </a>
            <video controls src={href} className="w-full h-auto max-h-[480px]">
              متصفحك لا يدعم تشغيل هذا الفيديو مباشرة.
            </video>
          </div>
        );
      }

      if (href.startsWith("#")) {
        const targetId = href.slice(1).trim();
        return (
          <a
            href={href}
            {...rest}
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = targetId;
              setTimeout(() => {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }
              }, 50);
            }}
          >
            {children}
          </a>
        );
      }
    }

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
  pre(props: any) {
    const { children } = props;
    if (
      children &&
      typeof children === "object" &&
      "props" in children &&
      children.props?.className?.includes("language-mermaid")
    ) {
      const code = String(children.props.children || "");
      return <Mermaid chart={code} />;
    }
    return <pre {...props}>{children}</pre>;
  },
  code(props: any) {
    const { children, className, ...rest } = props;
    if (className?.includes("language-mermaid")) {
      return <Mermaid chart={String(children || "")} />;
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
  blockquote(props: any) {
    const { children, "data-alert-type": alertType } = props;

    if (!alertType) {
      return <blockquote {...props}>{children}</blockquote>;
    }

    const alertConfigs: Record<string, { icon: React.ReactNode; label: string; class: string }> = {
      note: { icon: <Tag className="w-4 h-4" />, label: "ملاحظة", class: "proposal-alert-note" },
      tip: { icon: <FileText className="w-4 h-4" />, label: "نصيحة", class: "proposal-alert-tip" },
      important: { icon: <CheckCircle className="w-4 h-4" />, label: "هام جداً", class: "proposal-alert-important" },
      success: { icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, label: "تم الإنجاز", class: "proposal-alert-success" },
      warning: { icon: <XCircle className="w-4 h-4 text-amber-400" />, label: "تحذير", class: "proposal-alert-warning" },
      caution: { icon: <XCircle className="w-4 h-4 text-destructive" />, label: "تنبيه", class: "proposal-alert-caution" },
      question: { icon: <Tag className="w-4 h-4" />, label: "استفسار", class: "proposal-alert-question" },
    };

    const config = alertConfigs[alertType] || alertConfigs.note;

    return (
      <div className={`proposal-alert-box ${config.class}`}>
        <div className="proposal-alert-header flex items-center gap-1.5">
          <span className="proposal-alert-icon">{config.icon}</span>
          <span className="proposal-alert-title">{config.label}</span>
        </div>
        <div className="proposal-alert-body">{children}</div>
      </div>
    );
  },
};

export function ProposalMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkAlerts]}
      components={proposalMarkdownComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
