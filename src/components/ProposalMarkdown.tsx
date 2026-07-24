import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "@/components/Mermaid";

function walkAst(node: any, visitor: (n: any) => void) {
  visitor(node);
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => walkAst(child, visitor));
  }
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

    const alertConfigs: Record<string, { icon: string; label: string; class: string }> = {
      note: { icon: "ℹ️", label: "ملاحظة", class: "proposal-alert-note" },
      tip: { icon: "💡", label: "نصيحة", class: "proposal-alert-tip" },
      important: { icon: "📌", label: "هام جداً", class: "proposal-alert-important" },
      success: { icon: "✅", label: "تم الإنجاز", class: "proposal-alert-success" },
      warning: { icon: "⚠️", label: "تحذير", class: "proposal-alert-warning" },
      caution: { icon: "🚨", label: "تنبيه", class: "proposal-alert-caution" },
      question: { icon: "❓", label: "استفسار", class: "proposal-alert-question" },
    };

    const config = alertConfigs[alertType] || alertConfigs.note;

    return (
      <div className={`proposal-alert-box ${config.class}`}>
        <div className="proposal-alert-header">
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
