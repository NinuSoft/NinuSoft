import React from "react";

// Standard props that icons should support
type IconProps = React.SVGProps<SVGSVGElement>;

// Helper for Lucide icons style
const LucideIcon = ({ children, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

/* ── Lucide-equivalent Icons ────────────────────────────────────────── */

export const Star = (props: IconProps) => (
  <LucideIcon {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </LucideIcon>
);

export const Shield = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6z" />
  </LucideIcon>
);

export const Users2 = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M14 19a6 6 0 0 0-12 0" />
    <circle cx="8" cy="9" r="4" />
    <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
  </LucideIcon>
);

export const Settings = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </LucideIcon>
);

export const ArrowRight = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </LucideIcon>
);

export const X = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </LucideIcon>
);

export const ChevronLeft = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m15 18-6-6 6-6" />
  </LucideIcon>
);

export const ChevronRight = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m9 18 6-6-6-6" />
  </LucideIcon>
);

export const CheckCircle2 = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </LucideIcon>
);

export const Search = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </LucideIcon>
);

export const ClipboardList = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
    <path d="M9 8h6" />
  </LucideIcon>
);

export const PenTool = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m12 22 1-1c1.4-1.4 2.4-3.2 3-5.2L18 9l-5-5-6.8 2c-2 1-3.8 2.2-5.2 3.6L1 10Z" />
    <path d="m17 17 3-3" />
    <path d="m5 5 3-3" />
    <circle cx="11" cy="11" r="2" />
  </LucideIcon>
);

export const Code2 = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m18 16 4-4-4-4" />
    <path d="m6 8-4 4 4 4" />
    <path d="m14.5 4-5 16" />
  </LucideIcon>
);

export const Rocket = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5s3.19 1 5.5-1.5" />
    <path d="M12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    <path d="M9 15l-5.5 5.5" />
    <path d="M15 9l5.5-5.5" />
    <path d="M9 9l5.5 5.5" />
  </LucideIcon>
);

export const Target = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </LucideIcon>
);

export const TrendingUp = (props: IconProps) => (
  <LucideIcon {...props}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </LucideIcon>
);

export const Cpu = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M9 1v3" />
    <path d="M15 1v3" />
    <path d="M9 20v3" />
    <path d="M15 20v3" />
    <path d="M20 9h3" />
    <path d="M20 15h3" />
    <path d="M1 9h3" />
    <path d="M1 15h3" />
  </LucideIcon>
);

export const Lock = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </LucideIcon>
);

export const Zap = (props: IconProps) => (
  <LucideIcon {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </LucideIcon>
);

export const Headphones = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </LucideIcon>
);

export const Monitor = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </LucideIcon>
);

export const Globe = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </LucideIcon>
);

export const Smartphone = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </LucideIcon>
);

export const Bot = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </LucideIcon>
);

export const Cloud = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </LucideIcon>
);

export const Handshake = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </LucideIcon>
);

export const Mail = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
    <rect x="2" y="4" width="20" height="16" rx="2" />
  </LucideIcon>
);

export const Phone = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
  </LucideIcon>
);

export const MapPin = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </LucideIcon>
);

export const ExternalLink = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </LucideIcon>
);

export const Menu = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M4 5h16" />
    <path d="M4 12h16" />
    <path d="M4 19h16" />
  </LucideIcon>
);

export const Check = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </LucideIcon>
);

export const Circle = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="10" />
  </LucideIcon>
);

export const ArrowLeft = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </LucideIcon>
);

export const ChevronDown = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m6 9 6 6 6-6" />
  </LucideIcon>
);

export const ChevronUp = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="m18 15-6-6-6 6" />
  </LucideIcon>
);

export const PanelLeft = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </LucideIcon>
);

export const GripVertical = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </LucideIcon>
);

export const Minus = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M5 12h14" />
  </LucideIcon>
);

export const AlertCircle = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </LucideIcon>
);

export const MoreHorizontal = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </LucideIcon>
);

export const Loader2 = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </LucideIcon>
);

/* ── Component Aliases ──────────────────────────────────────────────── */
export const Loader2Icon = Loader2;
export const ChevronDownIcon = ChevronDown;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const PanelLeftIcon = PanelLeft;

/* ── Brand / Social FontAwesome-equivalent Icons ────────────────────── */

export const Facebook = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
  </svg>
);

export const Linkedin = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const Instagram = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const Github = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Telegram = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
  </svg>
);

export const WhatsApp = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.448L0 24zm6.59-4.846c1.6.95 2.51 1.442 4.415 1.443 5.485.002 9.953-4.464 9.956-9.953.002-2.661-1.029-5.163-2.906-7.042C16.177 1.721 13.68 .69 11.02.69 5.534.69 1.066 5.158 1.063 10.645c-.001 1.896.486 2.802 1.444 4.416l-.995 3.637 3.737-.98a10.87 10.87 0 0 0 2.808.436zm10.74-5.385c-.27-.136-1.602-.79-1.85-.88-.25-.09-.432-.136-.614.137-.182.273-.705.88-.863 1.058-.158.177-.317.2-.587.064a7.393 7.393 0 0 1-2.18-1.34 8.15 8.15 0 0 1-1.51-1.879c-.16-.272-.017-.42.119-.556.122-.122.27-.318.406-.477.135-.16.18-.272.271-.453.09-.182.046-.34-.022-.477-.068-.137-.614-1.477-.84-2.023-.223-.537-.468-.463-.643-.472-.166-.008-.356-.01-.546-.01-.19 0-.5.07-.762.355-.262.286-1 .977-1 2.385s1.02 2.766 1.163 2.956c.143.19 2.01 3.07 4.869 4.3.68.293 1.213.468 1.628.6a3.9 3.9 0 0 0 1.787.112c.55-.082 1.602-.654 1.828-1.285.227-.63.227-1.173.159-1.285-.068-.113-.25-.177-.52-.313z" />
  </svg>
);

export const FileText = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a1 1 0 0 0 1 1h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </LucideIcon>
);

export const BarChart = (props: IconProps) => (
  <LucideIcon {...props}>
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </LucideIcon>
);

export const Keyboard = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <path d="M6 10h.01" />
    <path d="M10 10h.01" />
    <path d="M14 10h.01" />
    <path d="M18 10h.01" />
    <path d="M6 14h12" />
  </LucideIcon>
);

export const Upload = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </LucideIcon>
);

export const Calculator = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </LucideIcon>
);

export const Clock = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </LucideIcon>
);

export const Download = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </LucideIcon>
);

export const Copy = (props: IconProps) => (
  <LucideIcon {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </LucideIcon>
);

export const Tag = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <circle cx="7" cy="7" r="1.5" />
  </LucideIcon>
);

export const MessageSquare = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </LucideIcon>
);

export const XCircle = (props: IconProps) => (
  <LucideIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </LucideIcon>
);

export const Eye = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </LucideIcon>
);

export const CheckCircle = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </LucideIcon>
);

export const RefreshCw = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </LucideIcon>
);

export const Printer = (props: IconProps) => (
  <LucideIcon {...props}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </LucideIcon>
);

export const Plus = (props: IconProps) => (
  <LucideIcon {...props}>
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </LucideIcon>
);

export const Edit = (props: IconProps) => (
  <LucideIcon {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </LucideIcon>
);

