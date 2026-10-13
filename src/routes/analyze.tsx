import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { FullAnalysis } from "@/components/deceptiq/AnalysisView";
import { WarningOverlay } from "@/components/deceptiq/WarningOverlay";
import { analyzeUrl, SAMPLES, type AnalysisResult, type Sample } from "@/lib/analysis";
import { addEntry, getSettings, recordAction, type ActionType } from "@/lib/store";

export const Route = createFileRoute("/analyze")({
  validateSearch: (s: Record<string, unknown>) => ({ sample: typeof s["sample"] === "string" ? s["sample"] : undefined }),
  head: () => ({ meta: [
    { title: "Analyze a URL — DeceptIQ" },
    { name: "description", content: "Assess a URL for phishing and deception signals with explainable scoring." },
    { property: "og:title", content: "Analyze a URL — DeceptIQ" },
    { property: "og:description", content: "Explainable deception risk assessment." },
  ] }),
  component: Analyze,
});

function Analyze() {
  const { sample: initial } = Route.useSearch();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [sample, setSample] = useState<Sample | undefined>();
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<{ r: AnalysisResult; id: string } | null>(null);
  const [last, setLast] = useState<ActionType>();

  const run = (u: string, s?: Sample) => {
    if (!u.trim()) { toast.error("Enter a URL or pick an example"); return; }
    setLoading(true); setLast(undefined);
    setTimeout(() => {
      const r = analyzeUrl(u, s);
      const e = addEntry(r);
      setRes({ r, id: e.id }); setLoading(false);
    }, 650);
  };
  useEffect(() => {
    const s = SAMPLES.find((x) => x.id === initial);
    if (s) { setUrl(s.url); setSample(s); run(s.url, s); }
  }, [initial]);

  const act = (a: ActionType) => {
    if (!res) return;
    recordAction(res.id, a); setLast(a);
    const msg = { "go-back": "Go Back recorded in the product preview — no real page was changed", "close-page": "Close Page recorded in the product preview", report: getSettings().persistHistory ? "Report saved to local history in this preview" : "Report recorded for this session (history saving is off)", "continue-anyway": "Override recorded in the product preview — no real browser navigation occurred" }[a];
    toast.success(msg);
  };
  const threshold = getSettings().overlayThreshold === "Elevated" ? 30 : 55;

  return (
    <>
      <PageHeader title="Analyze" subtitle="Assess a link without opening it. DeceptIQ never fetches or visits the URL you enter." />
      <form className="panel space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); run(url, sample?.url === url ? sample : undefined); }}>
        <label htmlFor="url" className="text-sm font-medium">URL to analyze</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id="url" value={url} onChange={(e) => { setUrl(e.target.value); setSample(undefined); }} placeholder="https://example.com/login" className="font-mono" />
          <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Analyzing</> : "Analyze"}</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <Button key={s.id} type="button" variant="outline" size="sm" onClick={() => { setUrl(s.url); setSample(s); run(s.url, s); }}>{s.label}</Button>
          ))}
        </div>
      </form>
      {res && !loading && (
        <div className="mt-6 space-y-6">
          <WarningOverlay r={res.r} onAction={act} lastAction={last} showOverlay={res.r.score >= threshold} />
          <FullAnalysis r={res.r} />
        </div>
      )}
    </>
  );
}
