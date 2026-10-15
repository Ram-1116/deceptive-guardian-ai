import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { BandChip } from "@/components/deceptiq/Risk";
import { ACTION_LABEL, clearHistory, deleteEntry, useHistory } from "@/lib/store";
import type { Band } from "@/lib/analysis";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { title: "History — DeceptIQ" },
    { name: "description", content: "Local analysis history with sanitized URLs." },
    { property: "og:title", content: "History — DeceptIQ" },
    { property: "og:description", content: "Local analysis history." },
  ] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { list } = useHistory();
  const [q, setQ] = useState("");
  const [band, setBand] = useState<Band | "All">("All");
  const rows = list.filter((e) => (band === "All" || e.result.band === band) && e.result.input.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="History" subtitle="Stored only in this browser. Query strings, fragments, credentials and token-like path segments are removed before saving."
        actions={<Button variant="outline" onClick={() => { if (window.confirm("Clear all saved analyses from this browser?")) { clearHistory(); toast.success("History cleared"); } }}>Clear history</Button>} />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search URL or hostname" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search history" />
        <div className="flex flex-wrap gap-1">
          {(["All", "Low", "Elevated", "High", "Critical"] as const).map((b) => (
            <Button key={b} size="sm" variant={band === b ? "default" : "outline"} onClick={() => setBand(b)}>{b}</Button>
          ))}
        </div>
      </div>
      <div className="panel divide-y divide-border">
        {rows.length === 0 && <p className="p-6 text-sm text-muted-foreground">No entries.</p>}
        {rows.map((e) => (
          <div key={e.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="truncate font-mono text-sm">{e.result.input}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(e.result.analyzedAt).toLocaleString()} · {e.result.primaryIntent}{e.result.mode === "sample-signals" && " · illustrative sample"}
                {e.actions.length > 0 && ` · ${e.actions.map((a) => ACTION_LABEL[a.type]).join(", ")}`}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums">{e.result.score}</span><BandChip band={e.result.band} />
              <Button size="sm" variant="outline" asChild><Link to="/reports" search={{ id: e.id }}>Details</Link></Button>
              {e.result.sampleId && <Button size="sm" variant="outline" asChild><Link to="/analyze" search={{ sample: e.result.sampleId }}>Re-run</Link></Button>}
              <Button size="sm" variant="ghost" onClick={() => { if (window.confirm("Permanently delete this saved analysis?")) { try { deleteEntry(e.id); toast("Entry deleted"); } catch { toast.error("Could not delete entry"); } } }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
