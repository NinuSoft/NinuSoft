interface ProposalWatermarkProps {
  clientName?: string;
}

export function ProposalWatermark({ clientName = "NinuSoft Client" }: ProposalWatermarkProps) {
  return (
    <div className="proposal-watermark-overlay pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.035] select-none">
      <div className="rotate-[-25deg] text-center font-bold tracking-widest text-foreground text-7xl md:text-9xl uppercase space-y-4">
        <div>NINUSOFT</div>
        <div className="text-4xl md:text-6xl text-amber-500 font-sans">{clientName}</div>
        <div className="text-xl md:text-3xl tracking-normal text-muted-foreground font-mono">CONFIDENTIAL & PROPRIETARY</div>
      </div>
    </div>
  );
}
