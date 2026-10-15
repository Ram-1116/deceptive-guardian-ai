import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { BandChip } from "@/components/deceptiq/Risk";
import { useHistory } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
      { title: "Overview — DeceptIQ" },
      { name: "description", content: "DeceptIQ security overview: analyses, findings and attack chains." },
      { property: "og:title", content: "Overview — DeceptIQ" },
      { property: "og:description", content: "DeceptIQ security overview." },
    ],
  }),
  component: Overview,
});

const SAMPLE_CHART = [
  { d: "Mon", safe: 42, flagged: 3 }, { d: "Tue", safe: 51, flagged: 5 }, { d: "Wed", safe: 47, flagged: 2 },
  { d: "Thu", safe: 60, flagged: 7 }, { d: "Fri", safe: 55, flagged: 4 }, { d: "Sat", safe: 30, flagged: 6 }, { d: "Sun", safe: 36, flagged: 3 },
];

function Overview() {
  const { list } = useHistory();
  const flagged = list.filter((e) => e.result.band === "High" || e.result.band === "Critical").length;
  const chains = list.filter((e) => e.result.sampleId === "otp-scam" || e.result.sampleId === "login-clone").length;
  return (
    <>
      <PageHeader title="DeceptIQ security overview" subtitle="Web analysis/dashboard prototype by ThreatForge. Local URL rules and defined sample signals—not live browser monitoring."
        actions={<Button asChild><Link to="/analyze" search={{ sample: undefined }}><ScanSearch /> Analyze URL</Link></Button>} />
      <section className="mb-6 border-y border-border py-4"><h2 className="text-sm font-semibold">Browser extension · planned separately</h2><p className="mt-1 text-sm text-muted-foreground">The intended Chrome/Chromium Manifest V3 extension would supply page signals. This web app is not installed in your browser, does not watch open tabs, and cannot block input.</p><Button asChild variant="link" className="mt-2 px-0"><Link to="/settings">View signal coverage & privacy</Link></Button></section>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Saved assessments (includes samples)", list.length], ["High / Critical findings", flagged], ["Illustrative scenario assessments", chains]].map(([l, v]) => (
          <div key={l} className="panel p-5"><div className="text-xs text-muted-foreground">{l}</div><div className="font-display text-3xl font-semibold tabular-nums">{v}</div></div>
        ))}
      </div>
      <section className="panel mt-6 p-6">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Illustrative weekly assessments</h3><span className="text-xs text-risk-elevated">Sample data — illustrative only</span></div>
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={SAMPLE_CHART}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
              <Area dataKey="safe" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
              <Area dataKey="flagged" stroke="var(--violet)" fill="var(--violet)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel mt-6 p-6">
        <h3 className="mb-4 font-semibold">Recent analyses</h3>
        {list.length === 0 && <p className="text-sm text-muted-foreground">No saved assessments. Analyze a URL to get started.</p>}
        <ul className="divide-y divide-border">
          {list.slice(0, 5).map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="truncate font-mono">{e.result.hostname}</span>
              <span className="flex items-center gap-3"><span className="tabular-nums">{e.result.score}</span><BandChip band={e.result.band} />
                <Link to="/reports" search={{ id: e.id }} className="text-primary hover:underline">Report</Link></span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
