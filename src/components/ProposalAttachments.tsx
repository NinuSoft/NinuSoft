import { Button } from "@/components/ui/button";
import { Download, FileText, CheckCircle, Shield } from "@/components/Icons";

interface AttachmentItem {
  name: string;
  size: string;
  type: string;
  url: string;
}

interface ProposalAttachmentsProps {
  attachments?: AttachmentItem[];
}

export function ProposalAttachments({ attachments }: ProposalAttachmentsProps) {
  const defaultAttachments: AttachmentItem[] = attachments && attachments.length > 0 ? attachments : [
    {
      name: "NinuSoft Company Profile & Tech Stack.pdf",
      size: "2.4 MB",
      type: "PDF Document",
      url: "#",
    },
    {
      name: "SLA & Technical Support Guarantee Terms.pdf",
      size: "1.1 MB",
      type: "PDF Document",
      url: "#",
    },
  ];

  return (
    <section className="proposal-attachments-section mt-10 p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-xl text-start dir-rtl">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>مركز المرفقات والملفات الرسمية ({defaultAttachments.length})</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">ملفات جاهزة للتحميل والتنزيل</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {defaultAttachments.map((file, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h4 className="font-bold text-xs text-foreground truncate">{file.name}</h4>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {file.type} • {file.size}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const a = document.createElement("a");
                a.href = file.url;
                a.download = file.name;
                a.click();
              }}
              className="text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" /> تنزيل
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
