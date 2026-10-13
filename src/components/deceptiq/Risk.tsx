import type { Band } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export const BAND_TEXT: Record<Band, string> = {
  Low: "text-risk-low",
  Elevated: "text-risk-elevated",
  High: "text-risk-high",
  Critical: "text-risk-critical",
};
export const BAND_BG: Record<Band, string> = {
  Low: "bg-risk-low",
  Elevated: "bg-risk-elevated",
  High: "bg-risk-high",
  Critical: "bg-risk-critical",
};
const BAND_CHIP: Record<Band, string> = {
  Low: "border-risk-low/40 bg-risk-low/10 text-risk-low",
  Elevated: "border-risk-elevated/40 bg-risk-elevated/10 text-risk-elevated",
  High: "border-risk-high/40 bg-risk-high/10 text-risk-high",
  Critical: "border-risk-critical/40 bg-risk-critical/10 text-risk-critical",
};

export function BandChip({ band, className }: { band: Band; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", BAND_CHIP[band], className)}>
      {band}
    </span>
  );
}

export function ScoreRing({ score, band, size = 160 }: { score: number; band: Band; size?: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={`Risk score ${score} of 100, ${band}`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
          className={cn("transition-all duration-700", BAND_TEXT[band])} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold tabular-nums">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-700", className ?? "bg-gradient-brand")} style={{ width: `${value}%` }} />
    </div>
  );
}

export function DemoNote({ mode }: { mode: "sample-signals" | "url-only" }) {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <span className="inline-flex rounded-full border border-border px-2 py-0.5 font-medium text-foreground">
        {mode === "url-only" ? "URL-only assessment · page content not inspected" : "Illustrative sample · fictional website"}
      </span>
      <p>This assessment uses the URL you entered and the sample signals available in this prototype. It has not verified the live website.</p>
    </div>
  );
}
