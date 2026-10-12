export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="dq-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <path d="M16 2 L28 7 V15 C28 22.5 22.8 28 16 30 C9.2 28 4 22.5 4 15 V7 Z" fill="none" stroke="url(#dq-g)" strokeWidth="2" />
      <path d="M9 16 C11.5 12 20.5 12 23 16 C20.5 20 11.5 20 9 16 Z" fill="none" stroke="var(--foreground)" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="2.4" fill="url(#dq-g)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo />
      <div className="leading-tight">
        <div className="font-display text-base font-semibold tracking-tight">DeceptIQ</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">by ThreatForge</div>
      </div>
    </div>
  );
}
