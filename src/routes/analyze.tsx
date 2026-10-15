import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { FullAnalysis } from "@/components/deceptiq/AnalysisView";
import { SignalGuide } from "@/components/deceptiq/SignalGuide";
import { WarningOverlay } from "@/components/deceptiq/WarningOverlay";
import { analyzeUrl, isValidUrl, redactUrl, SAMPLES, type AnalysisResult, type Sample } from "@/lib/analysis";
import { addEntry, getSettings, recordAction, useSettings, type ActionType } from "@/lib/store";

export const Route = createFileRoute("/analyze")({
  validateSearch: (s: Record<string, unknown>) => ({ sample: typeof s["sample"] === "string" ? s["sample"] : undefined }),
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { title: "Analyze a URL — DeceptIQ" },
    { name: "description", content: "Assess a URL for phishing and deception signals with explainable scoring." },
    { property: "og:title", content: "Analyze a URL — DeceptIQ" },
    { property: "og:description", content: "Explainable deception risk assessment." },
  ] }),
  component: Analyze,
});

function Analyze() {
  const { sample: initial } = Route.useSearch();
  const [settings] = useSettings();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [sample, setSample] = useState<Sample | undefined>();
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<{ r: AnalysisResult; id: string } | null>(null);
  const [last, setLast] = useState<ActionType>();

  const run = (u: string, s?: Sample) => {
    clearTimeout(timer.current);
    if (!isValidUrl(u)) { setError("Enter a valid http:// or https:// URL with a hostname."); setLoading(false); return; }
    setError("");
    setUrl(redactUrl(u).redacted);
    setLoading(true); setLast(undefined);
    timer.current = setTimeout(() => {
      try {
        const r = analyzeUrl(u, s);
        let id = "session-only";
        try { id = addEntry(r).id; } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save this analysis"); }
        setRes({ r, id });
      } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed. Try again."); }
      finally { setLoading(false); }
    }, 350);
  };
  useEffect(() => {
    const s = SAMPLES.find((x) => x.id === initial);
    if (s) { setUrl(s.url); setSample(s); run(s.url, s); }
    return () => clearTimeout(timer.current);
  }, [initial]);

  const act = (a: ActionType) => {
    if (!res) return;
    try { recordAction(res.id, a); } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save action"); }
    setLast(a);
    const msg = { "go-back": "Go Back recorded in the product preview — no real page was changed", "close-page": "Close Page recorded in the product preview", report: getSettings().persistHistory ? "Report saved to local history in this preview" : "Report recorded for this session (history saving is off)", "continue-anyway": "Override recorded in the product preview — no real browser navigation occurred" }[a];
    toast.success(msg);
  };
  const threshold = settings.overlayThreshold === "Elevated" ? 30 : 55;

  return (
    <>
      <PageHeader title="Analyze" subtitle="Assess a link without opening it. DeceptIQ never fetches or visits the URL you enter." />
      <form className="panel space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); run(url, sample?.url === url ? sample : undefined); }}>
        <label htmlFor="url" className="text-sm font-medium">URL to analyze</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id="url" value={url} onChange={(e) => { setUrl(e.target.value); setSample(undefined); }} placeholder="https://example.com/login" aria-invalid={!!error} aria-describedby={error ? "url-error" : undefined} className="font-mono" />
          <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Analyzing</> : "Analyze"}</Button>
        </div>
        {error && <p id="url-error" role="alert" className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">Built-in illustrative scenarios</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <Button key={s.id} type="button" variant="outline" size="sm" onClick={() => { setUrl(s.url); setSample(s); run(s.url, s); }}>{s.label}</Button>
          ))}
        </div>
      </form>
      <SignalGuide />
      {loading && <p role="status" className="text-sm text-muted-foreground">Assessing available inputs…</p>}
      {res && !loading && (
        <div className="mt-6 space-y-6">
          {!(res.r.band === "Low" && settings.quietSafeMode) && <WarningOverlay key={res.id} r={res.r} onAction={act} lastAction={last} showOverlay={res.r.score >= threshold} />}
          <FullAnalysis r={res.r} />
        </div>
      )}
    </>
  );
}
