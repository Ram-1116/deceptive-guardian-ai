import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { FullAnalysis } from "@/components/deceptiq/AnalysisView";
import { ACTION_LABEL, useHistory } from "@/lib/store";

export const Route = createFileRoute("/reports")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s["id"] === "string" ? s["id"] : undefined }),
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { title: "Incident reports — DeceptIQ" },
    { name: "description", content: "Incident summary, evidence and risk breakdown with JSON and PDF export." },
    { property: "og:title", content: "Incident reports — DeceptIQ" },
    { property: "og:description", content: "Exportable incident reports." },
  ] }),
  component: Reports,
});

function Reports() {
  const { id } = Route.useSearch();
  const { list, ready } = useHistory();
  const e = id ? list.find((x) => x.id === id) : list.find((x) => x.result.band !== "Low") ?? list[0];

  const download = () => {
    if (!e) return;
    const data = { product: "DeceptIQ", team: "ThreatForge", disclaimer: "This assessment uses the submitted URL and sample signals available in this prototype. It has not verified the live website. No passwords, OTPs or form values collected.", incident: e };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = `deceptiq-report-${e.result.hostname}.json`;
    document.body.appendChild(a);
    a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
    toast.success("JSON report downloaded");
  };

  if (!ready) return <p role="status" className="text-muted-foreground">Loading local reports…</p>;
  if (!e) return <p className="text-muted-foreground">{id ? "This report is unavailable or was deleted." : "No saved analyses yet."} <Link to="/analyze" search={{ sample: undefined }} className="text-primary">Run an analysis</Link>.</p>;
  return (
    <>
      <PageHeader title="Incident report" subtitle={`${e.result.hostname} · ${new Date(e.result.analyzedAt).toLocaleString()}`}
        actions={<><Button variant="outline" onClick={download}><Download /> Download JSON</Button><Button onClick={() => window.print()}><Printer /> Print / Save PDF</Button></>} />
      <p className="no-print mb-4 text-xs text-muted-foreground">Choose “Save as PDF” in your browser’s print dialog. Recorded warning choices are simulations, not browser navigation or protection.</p>
      <div className="no-print mb-6 flex flex-wrap gap-2">
        {list.slice(0, 8).map((x) => (
          <Button key={x.id} size="sm" variant={x.id === e.id ? "default" : "outline"} asChild><Link to="/reports" search={{ id: x.id }}>{x.result.hostname.slice(0, 28)}</Link></Button>
        ))}
      </div>
      <section className="panel mb-6 p-6 text-sm">
        <h3 className="mb-2 font-semibold">Actions taken</h3>
        {e.actions.length === 0 ? <p className="text-muted-foreground">None recorded.</p> :
          <ul>{e.actions.map((a, k) => <li key={k}>{new Date(a.ts).toLocaleString()} — {ACTION_LABEL[a.type]}</li>)}</ul>}
      </section>
      <FullAnalysis r={e.result} />
    </>
  );
}
