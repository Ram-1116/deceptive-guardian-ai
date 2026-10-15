import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { SignalGuide } from "@/components/deceptiq/SignalGuide";
import { clearHistory, resetDemo, useSettings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
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
      <SignalGuide />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel space-y-4 p-6">
          <h3 className="font-semibold">Preferences</h3>
          <label className="flex items-center justify-between gap-4 text-sm">Save analyses to local history<Switch checked={s.persistHistory} onCheckedChange={(v) => (() => { try { update({ persistHistory: v }); } catch { toast.error("Browser storage is unavailable"); } })()} /></label>
          <label className="flex items-center justify-between gap-4 text-sm">Quiet mode on safe pages<Switch checked={s.quietSafeMode} onCheckedChange={(v) => update({ quietSafeMode: v })} /></label>
          <label className="flex items-center justify-between gap-4 text-sm">Show warning overlay from Elevated (default High)<Switch checked={s.overlayThreshold === "Elevated"} onCheckedChange={(v) => update({ overlayThreshold: v ? "Elevated" : "High" })} /></label>
          <div className="space-y-2"><p className="text-sm">History retention</p><div className="flex flex-wrap gap-2">{([7, 30, 0] as const).map((days) => <Button key={days} size="sm" variant={s.retentionDays === days ? "default" : "outline"} onClick={() => { if (window.confirm("Change retention? Older entries will be permanently removed when a shorter period is selected.")) { try { update({ retentionDays: days }); toast.success("Retention updated"); } catch { toast.error("Could not save preference"); } } }}>{days === 0 ? "Until deleted" : `${days} days`}</Button>)}</div></div>
          <p className="text-xs text-muted-foreground">Up to 100 entries in this browser; older entries expire when history is read. Turning saving off stops new entries and actions, but does not erase existing history.</p>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { if (window.confirm("Permanently delete all saved analyses? Preferences will be kept.")) { try { clearHistory(); toast.success("History cleared"); } catch { toast.error("Could not clear history"); } } }}>Clear saved history</Button>
          <Button variant="destructive" onClick={() => { if (window.confirm("Reset all local data? All analyses and preferences will be permanently removed. This cannot be undone.")) { try { resetDemo(); toast.success("Local history cleared and preferences reset"); } catch { toast.error("Could not reset local data"); } } }}>Reset local data</Button></div>
        </section>
        <section className="panel space-y-2 p-6 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Prototype limitations</h3>
          <p><span className="mr-1 rounded-full border border-border px-2 py-0.5 text-xs">Prototype</span>Results come from deterministic local rules and seeded fictional examples. No AI model, reputation, domain-age or certificate service is connected, and no accuracy or latency benchmark is claimed.</p>
          <p>Entered URLs are never fetched or visited. Only the URL string is analyzed; page signals exist only for the built-in samples.</p>
          <p>This hosted web app is a product preview, not yet a browser-installed extension. It does not monitor or protect your open browser tabs, and warning actions only record your choice here — they never navigate anywhere.</p>
        </section>
        <section className="panel space-y-2 p-6 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Privacy guardrails</h3>
          <p>Passwords, OTPs and form values are never collected or stored. History keeps a sanitized URL and hostname, rule evidence, scores and recorded choices in this browser. Queries, fragments, URL credentials and token-like path segments are removed; sample evidence is fictional. Local data is not encrypted and can be read by anyone with access to this browser profile.</p>
          <p>A real Chrome Manifest V3 build would use content scripts to inspect page DOM, visible text and forms. Its service worker handles extension events, messaging, storage and coordination, and cannot directly inspect the page DOM. It is designed for low-latency analysis and intended to warn before sensitive data is submitted.</p>
        </section>
        <section className="panel space-y-2 p-6 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Risk-score methodology</h3>
          <p className="font-mono text-xs text-foreground">technical = min(70, Σ triggered indicator weights)<br />manipulation = mean(urgency, fear, authority, reward, sensitive)<br />risk = min(100, round(technical + 0.3 × manipulation))</p>
          <p>Each factor gets 34 points per matched cue (max 100). Bands: 0–29 Low, 30–54 Elevated, 55–74 High, 75–100 Critical. These are indicative rule scores, not model confidence, calibrated probabilities or live-site verdicts. URL-only runs have zero page-text contribution. HTTPS alone is not a safety guarantee.</p>
        </section>
      </div>
    </>
  );
}
