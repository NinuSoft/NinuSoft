import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Mermaid from "@/components/Mermaid";

const markdownComponents = {
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
};
import { useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ApiError,
  getProposal,
  type Proposal,
  recordProposalEvent,
  unlockProposal,
} from "@/lib/proposals-api";

function Brand() {
  return (
    <a className="proposal-brand" href="/" aria-label="العودة إلى NinuSoft">
      <img src="/logo.png" alt="" />
      <span>NinuSoft</span>
    </a>
  );
}

function CenteredState({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="proposal-state" dir="rtl">
      <Brand />
      <section className="proposal-state-card">
        <span className="proposal-state-icon" aria-hidden="true">{icon}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </section>
      <p className="proposal-security-note">مشاركة خاصة ومشفّرة عبر NinuSoft</p>
    </main>
  );
}

export default function ProposalView() {
  const { token = "" } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [status, setStatus] = useState<"loading" | "locked" | "ready" | "expired" | "missing" | "error">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const readRecorded = useRef(false);
  const accessStorageKey = `ninusoft-proposal-access:${token}`;
  const accessToken = useRef(sessionStorage.getItem(accessStorageKey) || "");
  const sessionId = useMemo(() => {
    const key = `ninusoft-proposal-session:${token}`;
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
    return value;
  }, [token]);

  const load = async () => {
    setStatus("loading");
    try {
      const result = await getProposal(token, sessionId, accessToken.current);
      if (result.locked) {
        accessToken.current = "";
        sessionStorage.removeItem(accessStorageKey);
        setStatus("locked");
      } else {
        setProposal(result.proposal);
        document.title = `${result.proposal.title} | NinuSoft`;
        setStatus("ready");
      }
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        if (requestError.status === 410) setStatus("expired");
        else if (requestError.status === 404) setStatus("missing");
        else setStatus("error");
      } else {
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    void load();
    return () => {
      document.title = "NinuSoft";
    };
    // token identifies the complete load lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (status !== "ready" || readRecorded.current) return;
    const timer = window.setTimeout(() => {
      readRecorded.current = true;
      void recordProposalEvent(
        token,
        "read",
        sessionId,
        accessToken.current,
      ).catch(() => undefined);
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [sessionId, status, token]);

  const unlock = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setUnlocking(true);
    try {
      const result = await unlockProposal(token, password);
      accessToken.current = result.accessToken;
      sessionStorage.setItem(accessStorageKey, result.accessToken);
      setPassword("");
      await load();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 429) {
        setError("محاولات كثيرة. يرجى الانتظار قليلاً ثم المحاولة مجدداً.");
      } else {
        setError("كلمة السر غير صحيحة. تحقق منها وحاول مجدداً.");
      }
    } finally {
      setUnlocking(false);
    }
  };

  const print = (type: "print" | "pdf") => {
    void recordProposalEvent(
      token,
      type,
      sessionId,
      accessToken.current,
    ).catch(() => undefined);
    window.print();
  };

  if (status === "loading") {
    return (
      <CenteredState icon="…" title="جاري تجهيز العرض" description="لحظات ونفتح لك الوثيقة بأمان." />
    );
  }

  if (status === "locked") {
    return (
      <CenteredState
        icon="⌁"
        title="هذا العرض محمي"
        description="أدخل كلمة السر التي أرسلها لك فريق NinuSoft للوصول إلى العرض."
      >
        <form className="proposal-password-form" onSubmit={unlock}>
          <label htmlFor="proposal-password">كلمة السر</label>
          <Input
            id="proposal-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
          {error && <p className="proposal-form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={unlocking}>
            {unlocking ? "جاري التحقق…" : "فتح العرض"}
          </Button>
        </form>
      </CenteredState>
    );
  }

  if (status === "expired") {
    return <CenteredState icon="⌛" title="انتهت صلاحية الرابط" description="تواصل مع فريق NinuSoft للحصول على رابط محدّث لهذا العرض." />;
  }

  if (status === "missing") {
    return <CenteredState icon="404" title="العرض غير موجود" description="تأكد من نسخ الرابط كاملاً، أو اطلب رابطاً جديداً من فريق NinuSoft." />;
  }

  if (status === "error" || !proposal) {
    return (
      <CenteredState icon="!" title="تعذر فتح العرض" description="حدث عطل مؤقت في الاتصال. أعد المحاولة بعد قليل.">
        <Button type="button" onClick={() => void load()}>إعادة المحاولة</Button>
      </CenteredState>
    );
  }

  return (
    <div className="proposal-page" dir="rtl">
      <header className="proposal-toolbar">
        <Brand />
        <div className="proposal-actions">
          <Button variant="outline" onClick={() => print("print")}>
            <span aria-hidden="true">⌁</span> طباعة
          </Button>
          <Button onClick={() => print("pdf")}>
            <span aria-hidden="true">↓</span> تنزيل PDF
          </Button>
        </div>
      </header>

      <main className="proposal-shell">
        <div className="proposal-meta">
          <div>
            <span>عرض خاص إلى</span>
            <strong>{proposal.clientName}</strong>
          </div>
          <div className="proposal-meta-date">
            <span>آخر تحديث</span>
            <strong>{new Intl.DateTimeFormat("ar-IQ", { dateStyle: "medium" }).format(new Date(proposal.updatedAt))}</strong>
          </div>
        </div>
        <article className="proposal-document">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {proposal.markdown}
          </ReactMarkdown>
        </article>
        <footer className="proposal-footer">
          <Brand />
          <p>هذه الوثيقة خاصة ومعدّة للقراءة فقط.</p>
        </footer>
      </main>
    </div>
  );
}
