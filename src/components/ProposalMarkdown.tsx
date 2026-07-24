import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "@/components/Mermaid";
import { Tag, FileText, CheckCircle, XCircle } from "@/components/Icons";

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

export function remarkAlerts() {
  return (tree: any) => {
    walkAst(tree, (node: any) => {
      if (node.type !== "blockquote" || !node.children || node.children.length === 0) return;

      const firstPara = node.children[0];
      if (!firstPara || firstPara.type !== "paragraph" || !firstPara.children || firstPara.children.length === 0) return;

      const firstTextNode = firstPara.children[0];
      if (!firstTextNode || firstTextNode.type !== "text") return;

      const match = firstTextNode.value.match(ALERT_PATTERN);
      if (match) {
        const rawType = match[1].toUpperCase();
        let alertType = "note";

        if (rawType === "INFO" || rawType === "NOTE") alertType = "note";
        else if (rawType === "TIP" || rawType === "HINT") alertType = "tip";
        else if (rawType === "IMPORTANT") alertType = "important";
        else if (rawType === "SUCCESS" || rawType === "DONE" || rawType === "CHECK") alertType = "success";
        else if (rawType === "WARNING") alertType = "warning";
        else if (rawType === "CAUTION" || rawType === "DANGER" || rawType === "ERROR") alertType = "caution";
        else if (rawType === "QUESTION" || rawType === "HELP" || rawType === "FAQ") alertType = "question";

        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties["data-alert-type"] = alertType;

        // Strip marker from the text node
        firstTextNode.value = firstTextNode.value.replace(STRIP_PATTERN, "");

        // If text node is now empty, remove it from paragraph children
        if (!firstTextNode.value && firstPara.children.length > 1) {
          firstPara.children.shift();
        }
      }
    });
  };
}

export const proposalMarkdownComponents = {
  h1(props: any) {
    const text = typeof props.children === "string" ? props.children : "";
    const id = slugify(text);
    return <h1 id={id || undefined} {...props} />;
  },
  h2(props: any) {
    const text = typeof props.children === "string" ? props.children : "";
    const id = slugify(text);
    return <h2 id={id || undefined} {...props} />;
  },
  h3(props: any) {
    const text = typeof props.children === "string" ? props.children : "";
    const id = slugify(text);
    return <h3 id={id || undefined} {...props} />;
  },
  a(props: any) {
    const { href, children, ...rest } = props;

    if (href) {
      // YouTube Embed
      const ytMatch = href.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (ytMatch && ytMatch[1]) {
        return (
          <div className="my-4 rounded-2xl overflow-hidden border border-border/60 bg-card shadow-xl aspect-video w-full max-w-3xl mx-auto">
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
