interface ProposalWatermarkProps {
  clientName?: string;
}

export function ProposalWatermark({ clientName = "NinuSoft Client" }: ProposalWatermarkProps) {
  const watermarkText = `NINUSOFT PROPOSAL — CONFIDENTIAL FOR ${clientName.toUpperCase()} — `;

  return (
    <div className="proposal-watermark-overlay pointer-events-none fixed inset-0 z-10 flex flex-col justify-between overflow-hidden opacity-10 select-none dir-ltr">
      <div className="rotate-[-25deg] scale-125 flex flex-col gap-16 py-20 items-center justify-center min-h-screen text-foreground font-black font-mono tracking-widest text-sm md:text-xl uppercase">
        <div className="whitespace-nowrap text-amber-400 opacity-90">
          {watermarkText.repeat(4)}
        </div>
        <div className="whitespace-nowrap opacity-75">
          {watermarkText.repeat(4)}
        </div>
        <div className="whitespace-nowrap text-amber-400 opacity-90 text-2xl md:text-5xl font-black">
          NINUSOFT PROPOSAL • {clientName.toUpperCase()}
        </div>
        <div className="whitespace-nowrap opacity-75">
          {watermarkText.repeat(4)}
        </div>
        <div className="whitespace-nowrap text-amber-400 opacity-90">
          {watermarkText.repeat(4)}
        </div>
      </div>
    </div>
  );
}
