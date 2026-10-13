import { AlertTriangle, CheckCircle2, CircleDashed, Info, XCircle } from "lucide-react";
import type { AnalysisResult, IndicatorGroup } from "@/lib/analysis";
import { BAND_BG, BAND_TEXT, BandChip, Bar, DemoNote, ScoreRing } from "./Risk";
import { cn } from "@/lib/utils";

const GROUPS: IndicatorGroup[] = ["URL / domain", "Forms & redirects", "Page structure (DOM)", "Visual similarity"];

export function ScoreSummary({ r }: { r: AnalysisResult }) {
  return (
    <section className="panel grid gap-6 p-6 md:grid-cols-[auto_1fr]">
      <ScoreRing score={r.score} band={r.band} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <BandChip band={r.band} className="text-sm" />
          <span className="font-mono text-sm text-muted-foreground break-all">{r.input}</span>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Likely intent</div>
          <div className={cn("font-display text-xl font-semibold", BAND_TEXT[r.band])}>{r.primaryIntent}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Technical signals" value={`${r.technical} / 70`} />
          <Stat label="Manipulation score" value={`${r.manipulation} / 100`} hint="weighted ×0.3" />
          <Stat label="Confidence (illustrative)" value={`${Math.round(r.confidence * 100)}%`} hint={r.mode === "url-only" ? "URL string only — page not inspected" : "URL + fictional sample page signals"} />
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          risk = min(100, {r.technical} + 0.3 × {r.manipulation}) = {r.score}
        </p>
        <DemoNote mode={r.mode} />
      </div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function FactorsPanel({ r }: { r: AnalysisResult }) {
  return (
    <section className="panel p-6">
      <h3 className="font-semibold">Manipulation factors</h3>
      <p className="mb-4 text-xs text-muted-foreground">Keyword cues in {r.mode === "url-only" ? "the URL tokens" : "the sample's visible text"}; 34 points per cue, capped at 100.</p>
      <div className="space-y-4">
        {r.factors.map((f) => (
          <div key={f.key}>
            <div className="mb-1 flex justify-between text-sm"><span>{f.label}</span><span className="tabular-nums text-muted-foreground">{f.score}</span></div>
            <Bar value={f.score} />
            {f.matches.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {f.matches.map((m) => <span key={m} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">"{m}"</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function IndicatorChecklist({ r }: { r: AnalysisResult }) {
  return (
    <section className="panel p-6">
      <h3 className="mb-1 font-semibold">Indicator checklist</h3>
      <p className="mb-4 text-xs text-muted-foreground">{r.mode === "url-only" ? "Only the URL text was assessed. Page structure, visual similarity, forms, redirects and page wording were not inspected, so they add nothing to the score." : "Page signals below come from a fictional sample scenario, not a live website."}</p>
      <div className="grid gap-5 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{g}</div>
            <ul className="space-y-1.5">
              {r.indicators.filter((i) => i.group === g).map((i) => (
                <li key={i.id} className="flex items-start gap-2 text-sm">
                  {!i.available ? <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    : i.triggered ? <XCircle className="mt-0.5 size-4 shrink-0 text-risk-critical" />
                    : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-risk-low" />}
                  <span className={cn(!i.available && "text-muted-foreground")}>
                    {i.label}
                    <span className="ml-1 font-mono text-[11px] text-muted-foreground">{!i.available ? "Not inspected in URL-only assessment" : i.triggered ? `+${i.weight}` : "clear"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EvidencePanel({ r }: { r: AnalysisResult }) {
  const hits = r.indicators.filter((i) => i.triggered);
  return (
    <section className="panel p-6">
      <h3 className="mb-1 font-semibold">Why risky?</h3>
      <p className="mb-4 text-xs text-muted-foreground">Every point in the score traces to one of these items.</p>
      {hits.length === 0 && r.manipulation === 0 ? (
        <p className="flex items-center gap-2 text-sm text-risk-low"><CheckCircle2 className="size-4" /> No deception evidence found in this assessment.</p>
      ) : (
        <ul className="space-y-3">
          {hits.map((i) => (
            <li key={i.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2 text-sm font-medium">
                <span>{i.label}</span><span className="font-mono text-xs text-risk-critical">+{i.weight}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{i.evidence}</p>
            </li>
          ))}
          {r.manipulation > 0 && (
            <li className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-center justify-between text-sm font-medium"><span>Manipulative language</span><span className="font-mono text-xs text-violet">+{Math.round(0.3 * r.manipulation)}</span></div>
              <p className="mt-1 text-xs text-muted-foreground">{r.factors.filter((f) => f.score > 0).map((f) => f.label).join(", ")} cues detected.</p>
            </li>
          )}
        </ul>
      )}
      {r.technical === 70 && <p className="mt-3 text-xs text-muted-foreground">Technical signals are capped at 70 so language cues still influence the final score.</p>}
    </section>
  );
}

export function IntentPanel({ r }: { r: AnalysisResult }) {
  return (
    <section className="panel p-6">
      <h3 className="mb-4 font-semibold">Likely intent categories</h3>
      {r.intents.length === 0 ? <p className="text-sm text-muted-foreground">No intent category matched.</p> : (
        <div className="space-y-3">
          {r.intents.map((i) => (
            <div key={i.intent}>
              <div className="mb-1 flex justify-between text-sm"><span>{i.intent}</span><span className="tabular-nums text-muted-foreground">{i.strength}</span></div>
              <Bar value={i.strength} className="bg-violet" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function RecommendationPanel({ r }: { r: AnalysisResult }) {
  const Icon = r.band === "Low" ? Info : AlertTriangle;
  return (
    <section className="panel flex gap-4 p-6">
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg text-primary-foreground", BAND_BG[r.band])}><Icon className="size-5" /></div>
      <div>
        <h3 className="font-semibold">Recommended action</h3>
        <p className="mt-1 text-sm text-muted-foreground">{r.recommendation}</p>
      </div>
    </section>
  );
}

export function FullAnalysis({ r }: { r: AnalysisResult }) {
  return (
    <div className="space-y-6">
      <ScoreSummary r={r} />
      <RecommendationPanel r={r} />
      <div className="grid gap-6 lg:grid-cols-2">
        <EvidencePanel r={r} />
        <FactorsPanel r={r} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <IndicatorChecklist r={r} />
        <IntentPanel r={r} />
      </div>
    </div>
  );
}
