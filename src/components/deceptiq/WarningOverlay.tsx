import { useState } from "react";
import { ArrowLeft, Flag, ShieldAlert, ShieldCheck, X } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";
import type { ActionType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { BandChip } from "./Risk";

/** Mock browser frame showing what the extension's overlay would look like. */
export function WarningOverlay({ r, onAction, lastAction, showOverlay }: {
  r: AnalysisResult;
  onAction: (a: ActionType) => void;
  lastAction?: ActionType;
  showOverlay: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const top = r.indicators.filter((i) => i.triggered).slice(0, 3);

  return (
    <section className="panel overflow-hidden" aria-label="Active defense preview">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-risk-critical/70" /><span className="size-2.5 rounded-full bg-risk-elevated/70" /><span className="size-2.5 rounded-full bg-risk-low/70" />
        <div className="ml-3 flex-1 truncate rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">{r.input}</div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Mock browser</span>
      </div>
      <div className="relative min-h-[340px] grid-bg p-6">
        <div className="mx-auto max-w-sm space-y-3 opacity-40" aria-hidden="true">
          <div className="h-6 w-32 rounded bg-muted" /><div className="h-9 rounded bg-muted" /><div className="h-9 rounded bg-muted" /><div className="h-9 w-24 rounded bg-muted" />
          <p className="text-center text-xs text-muted-foreground">Simulated page placeholder — the real site is never loaded.</p>
        </div>

        {!showOverlay ? (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-risk-low/40 bg-card px-3 py-1.5 text-xs text-risk-low shadow-glow">
            <ShieldCheck className="size-4" /> DeceptIQ: quiet mode — no interruption
          </div>
        ) : lastAction && lastAction !== "report" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-6 text-center">
            <div>
              <p className="font-display text-lg font-semibold">
                {lastAction === "continue-anyway" ? "Override recorded" : lastAction === "go-back" ? "Returned to safety" : "Page closed"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Interactive warning simulation — recorded in the product preview, no real browser was navigated.</p>
            </div>
          </div>
        ) : (
          <div role="alertdialog" aria-labelledby="dq-warn-title" className="absolute inset-0 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border border-risk-critical/50 bg-card p-6 shadow-glow">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-risk-critical/15 text-risk-critical"><ShieldAlert className="size-5" /></div>
                <div>
                  <h3 id="dq-warn-title" className="font-display text-lg font-semibold">Deceptive page likely — {r.score}/100</h3>
                  <p className="text-sm text-muted-foreground">{r.primaryIntent}. Stop before entering any information.</p>
                </div>
                <BandChip band={r.band} className="ml-auto" />
              </div>
              <ul className="mt-4 space-y-1 text-sm">
                {top.map((i) => <li key={i.id} className="text-muted-foreground">• {i.label}</li>)}
              </ul>
              {confirming ? (
                <div className="mt-5 rounded-lg border border-risk-elevated/40 bg-risk-elevated/10 p-3 text-sm">
                  <p>Continue anyway? This override is recorded in the product preview only.</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => { setConfirming(false); onAction("continue-anyway"); }}>Yes, record override</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button onClick={() => onAction("go-back")} autoFocus><ArrowLeft /> Go Back to Safety</Button>
                  <Button variant="secondary" onClick={() => onAction("close-page")}><X /> Close Page</Button>
                  <Button variant="outline" onClick={() => onAction("report")} disabled={lastAction === "report"}><Flag /> {lastAction === "report" ? "Reported" : "Report"}</Button>
                  <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirming(true)}>Continue Anyway</Button>
                </div>
              )}
              <p className="mt-4 text-[11px] text-muted-foreground">Interactive warning simulation · not a verdict about the live website.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
