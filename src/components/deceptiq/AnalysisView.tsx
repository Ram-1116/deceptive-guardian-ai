import { AlertTriangle, CheckCircle2, CircleDashed, Info, XCircle } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";
import { BAND_BG, BAND_TEXT, BandChip, Bar, DemoNote, ScoreRing } from "./Risk";
import { cn } from "@/lib/utils";



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
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Possible intent · rule-based hypothesis</div>
          <div className={cn("font-display text-xl font-semibold", BAND_TEXT[r.band])}>{r.primaryIntent}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Technical signals" value={`${r.technical} / 70`} />
          <Stat label="Manipulation score" value={`${r.manipulation} / 100`} hint="weighted ×0.3" />
          <Stat label="Assessment coverage" value={r.mode === "url-only" ? "URL only" : "Sample inputs"} hint="Indicative rule score · not a probability" />
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
      <p className="mb-4 text-xs text-muted-foreground">Defined sample text cues; 34 points per cue, capped at 100. Page text is not inspected for entered URLs.</p>
      <div className="space-y-4">
        {r.factors.map((f) => (
          <div key={f.key}>
            <div className="mb-1 flex justify-between text-sm"><span>{f.label}</span><span className="tabular-nums text-muted-foreground">{f.available ? f.score : "Not inspected"}</span></div>
            {f.available && <Bar value={f.score} />}
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
      <div className="grid gap-6 md:grid-cols-2">
        <div><h4 className="mb-3 text-sm font-medium text-primary">{r.mode === "url-only" ? "Observed signals" : "Available signals · illustrative scenario"}</h4>
          <ul className="space-y-3">{r.indicators.filter((i) => i.available).map((i) => <li key={i.id} className="flex gap-2 text-sm">
            {i.triggered ? <XCircle className="mt-0.5 size-4 shrink-0 text-risk-high" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
            <div>{i.label}<div className="text-xs text-muted-foreground">{i.group} · {i.basis === "observed" ? "Observed input" : "Heuristic"} · {i.triggered ? `matched (+${i.weight})` : "not matched (0 points)"}</div></div>
          </li>)}</ul>
          <p className="mt-3 text-xs text-muted-foreground">Not matched is not a guarantee of safety. Heuristics interpret available input; they are not verified threats.</p>
        </div>
        <div><h4 className="mb-3 text-sm font-medium text-muted-foreground">Not inspected / unavailable signals</h4>
          <ul className="space-y-3">{r.indicators.filter((i) => !i.available).map((i) => <li key={i.id} className="flex gap-2 text-sm text-muted-foreground"><CircleDashed className="mt-0.5 size-4 shrink-0" /><div>{i.label}<div className="text-xs">{i.group} · unavailable · no score contribution</div></div></li>)}
            {!r.factors.some((f) => f.available) && <li className="flex gap-2 text-sm text-muted-foreground"><CircleDashed className="mt-0.5 size-4 shrink-0" />Visible page text and manipulation cues · not inspected</li>}
            <li className="flex gap-2 text-sm text-muted-foreground"><CircleDashed className="mt-0.5 size-4 shrink-0" />External reputation, domain age and certificate verification · not connected</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function EvidencePanel({ r }: { r: AnalysisResult }) {
  const hits = r.indicators.filter((i) => i.available && i.triggered);
  return (
    <section className="panel p-6">
      <h3 className="mb-1 font-semibold">Why risky?</h3>
      <p className="mb-4 text-xs text-muted-foreground">Rule contributions below are indicative, not severity probabilities. Technical weights are capped at 70; text contribution is weighted ×0.3.</p>
      {hits.length === 0 && r.manipulation === 0 ? (
        <p className="flex items-center gap-2 text-sm text-risk-low"><CheckCircle2 className="size-4" /> No rules matched the available signals; uninspected signals remain unknown.</p>
      ) : (
        <ul className="space-y-3">
          {hits.map((i) => (
            <li key={i.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2 text-sm font-medium">
                <span>{i.label}</span><span className="font-mono text-xs text-risk-critical">+{i.weight}</span>
              </div>
              <p className="mt-1 text-xs text-primary">Source: {i.source} · {i.group} · {i.basis === "observed" ? "Observed input" : "Heuristic interpretation"}</p><p className="mt-1 break-words text-xs text-muted-foreground">{i.evidence}</p>
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
      <h3 className="mb-2 font-semibold">Possible intent categories</h3><p className="mb-4 text-xs text-muted-foreground">Relative rule strengths, not model confidence or a verified intent.</p>
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
