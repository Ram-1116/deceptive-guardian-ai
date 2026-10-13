import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { resetDemo, useSettings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings & privacy — DeceptIQ" },
    { name: "description", content: "Prototype limitations, privacy guardrails and risk-score methodology." },
    { property: "og:title", content: "Settings & privacy — DeceptIQ" },
    { property: "og:description", content: "DeceptIQ privacy guardrails and methodology." },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, update] = useSettings();
  return (
    <>
      <PageHeader title="Settings & privacy" subtitle="DeceptIQ is a hackathon prototype by ThreatForge (Dhruv Mishra, Devisha Patel, Khushi Srivastava)." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel space-y-4 p-6">
          <h3 className="font-semibold">Preferences</h3>
          <label className="flex items-center justify-between gap-4 text-sm">Save analyses to local history<Switch checked={s.persistHistory} onCheckedChange={(v) => update({ persistHistory: v })} /></label>
          <label className="flex items-center justify-between gap-4 text-sm">Quiet mode on safe pages<Switch checked={s.quietSafeMode} onCheckedChange={(v) => update({ quietSafeMode: v })} /></label>
          <label className="flex items-center justify-between gap-4 text-sm">Show warning overlay from Elevated (default High)<Switch checked={s.overlayThreshold === "Elevated"} onCheckedChange={(v) => update({ overlayThreshold: v ? "Elevated" : "High" })} /></label>
          <Button variant="outline" onClick={() => { resetDemo(); toast.success("Local data reset to sample history"); }}>Reset local data</Button>
        </section>
        <section className="panel space-y-2 p-6 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Prototype limitations</h3>
          <p><span className="mr-1 rounded-full border border-border px-2 py-0.5 text-xs">Prototype</span>Results come from deterministic local rules and seeded fictional examples. No AI model, reputation, domain-age or certificate service is connected, and no accuracy or latency benchmark is claimed.</p>
          <p>Entered URLs are never fetched or visited. Only the URL string is analyzed; page signals exist only for the built-in samples.</p>
          <p>This hosted web app is a product preview, not yet a browser-installed extension. It does not monitor or protect your open browser tabs, and warning actions only record your choice here — they never navigate anywhere.</p>
        </section>
        <section className="panel space-y-2 p-6 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Privacy guardrails</h3>
          <p>Passwords, OTPs and form values are never collected or stored. History keeps only hostname, a redacted URL (query removed, token-like segments masked), scores and your actions — in this browser only.</p>
          <p>A real Chrome Manifest V3 build would use content scripts to inspect page DOM, visible text and forms. Its service worker handles extension events, messaging, storage and coordination, and cannot directly inspect the page DOM. It is designed for low-latency analysis and intended to warn before sensitive data is submitted.</p>
        </section>
        <section className="panel space-y-2 p-6 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Risk-score methodology</h3>
          <p className="font-mono text-xs text-foreground">technical = min(70, Σ triggered indicator weights)<br />manipulation = mean(urgency, fear, authority, reward, sensitive)<br />risk = min(100, round(technical + 0.3 × manipulation))</p>
          <p>Each factor gets 34 points per matched cue (max 100). Bands: 0–29 Low, 30–54 Elevated, 55–74 High, 75–100 Critical. Confidence is illustrative: higher when page signals are available and the score is far from a band edge.</p>
        </section>
      </div>
    </>
  );
}
