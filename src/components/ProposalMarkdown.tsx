import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Mermaid from "@/components/Mermaid";

function parseAlertBlockquote(children: React.ReactNode): {
  type: "note" | "tip" | "important" | "warning" | "caution" | null;
  content: React.ReactNode;
} {
  if (!children) return { type: null, content: children };

  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0) return { type: null, content: children };

  const firstChild: any = childrenArray[0];

  if (firstChild && typeof firstChild === "object" && firstChild.props) {
    const pChildren = React.Children.toArray(firstChild.props.children);
    if (pChildren.length > 0) {
      const firstText = String(pChildren[0] || "");
      const match = firstText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

      if (match) {
        const alertType = match[1].toLowerCase() as
          | "note"
          | "tip"
          | "important"
          | "warning"
          | "caution";

        const remainingText = firstText.replace(
          /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
          "",
        );

        const newPChildren = remainingText
          ? [remainingText, ...pChildren.slice(1)]
          : pChildren.slice(1);

        const newFirstChild = React.cloneElement(
          firstChild,
          firstChild.props,
          newPChildren,
        );

        const newChildren = [newFirstChild, ...childrenArray.slice(1)];

        return {
          type: alertType,
          content: newChildren,
        };
      }
    }
  }

  return { type: null, content: children };
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
    const { children } = props;
    const { type, content } = parseAlertBlockquote(children);

    if (!type) {
      return <blockquote {...props}>{children}</blockquote>;
    }

    const alertConfigs = {
      note: { icon: "ℹ️", label: "ملاحظة", class: "proposal-alert-note" },
      tip: { icon: "💡", label: "نصيحة", class: "proposal-alert-tip" },
      important: { icon: "📌", label: "هام جداً", class: "proposal-alert-important" },
      warning: { icon: "⚠️", label: "تحذير", class: "proposal-alert-warning" },
      caution: { icon: "🚨", label: "تنبيه", class: "proposal-alert-caution" },
    };

    const config = alertConfigs[type];

    return (
      <div className={`proposal-alert-box ${config.class}`}>
        <div className="proposal-alert-header">
          <span className="proposal-alert-icon">{config.icon}</span>
          <span className="proposal-alert-title">{config.label}</span>
        </div>
        <div className="proposal-alert-body">{content}</div>
      </div>
    );
  },
};

export function ProposalMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={proposalMarkdownComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
