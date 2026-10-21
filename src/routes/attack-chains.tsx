import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { BandChip, Bar } from "@/components/deceptiq/Risk";
import { bandFor } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attack-chains")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { title: "Attack chains — DeceptIQ" },
    { name: "description", content: "Simulated multi-step deception attack chain with intervention points." },
    { property: "og:title", content: "Attack chains — DeceptIQ" },
    { property: "og:description", content: "Simulated attack chain view." },
  ] }),
  component: Chains,
});

const STAGES = [
  { t: "Suspicious message", risk: 22, ev: "SMS claims a pending reward and includes a shortened link.", stop: "Flag shortened link and reward language before click." },
  { t: "Lookalike page", risk: 48, ev: "Lands on bharatunity-reward-kyc.claim-now.xyz — brand on unofficial .xyz domain.", stop: "Warn on lookalike domain on page load." },
  { t: "Credential prompt", risk: 66, ev: "Login form styled like the bank; visual similarity 71% in sample.", stop: "Overlay before the password field is submitted." },
  { t: "OTP request", risk: 82, ev: "Page asks for the OTP 'sent to your mobile' within 10 minutes.", stop: "Planned: warn before submission and explain why this reward-related OTP request is suspicious. No form is blocked here." },
  { t: "Payment redirect", risk: 94, ev: "Redirects to a card capture form to 'claim' the cashback.", stop: "Last chance — Critical warning, recommend contacting bank." },
];

function Chains() {
  const [i, setI] = useState(0);
  const s = STAGES[i];
  if (!s) return null;
  return (
    <>
      <PageHeader title="Attack chains" subtitle="Illustrative sample chain—not a detected campaign or recorded browsing session. Stage scores are narrative examples, not outputs from an assessed sequence. All interventions below are planned for a separate extension." />
      <ol className="grid gap-3 md:grid-cols-5">
        {STAGES.map((x, k) => (
          <li key={x.t}>
            <Button variant="outline" onClick={() => setI(k)} aria-current={k === i ? "step" : undefined}
              className={cn("h-auto min-h-32 w-full flex-col items-start whitespace-normal p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", k === i && "shadow-glow border-primary", k > i && "opacity-60")}>
              <div className="font-mono text-xs text-muted-foreground">Step {k + 1}</div>
              <div className="font-medium">{x.t}</div>
              <div className="mt-2"><Bar value={x.risk} /></div>
              <div className="mt-1 text-xs tabular-nums text-muted-foreground">risk {x.risk}</div>
            </Button>
          </li>
        ))}
      </ol>
      <section className="panel mt-6 space-y-4 p-6">
        <div className="flex items-center gap-3"><h3 className="text-lg font-semibold">{s.t}</h3><BandChip band={bandFor(s.risk)} /></div>
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Evidence</div><p className="text-sm">{s.ev}</p></div>
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Planned intervention · not implemented here</div><p className="text-sm text-primary">{s.stop}</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</Button>
          <Button variant="outline" disabled={i === STAGES.length - 1} onClick={() => setI(i + 1)}>Next step</Button>
          <Button asChild><Link to="/analyze" search={{ sample: "otp-scam", url: undefined }}>Analyze this scam</Link></Button>
        </div>
      </section>
    </>
  );
}
