import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/deceptiq/AppShell";
import { BandChip, Bar } from "@/components/deceptiq/Risk";
import { bandFor } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attack-chains")({
  head: () => ({ meta: [
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
  { t: "OTP request", risk: 82, ev: "Page asks for the OTP 'sent to your mobile' within 10 minutes.", stop: "Block form submit; explain OTP is never requested by banks this way." },
  { t: "Payment redirect", risk: 94, ev: "Redirects to a card capture form to 'claim' the cashback.", stop: "Last chance — Critical warning, recommend contacting bank." },
];

function Chains() {
  const [i, setI] = useState(0);
  const s = STAGES[i];
  return (
    <>
      <PageHeader title="Attack chains" subtitle="Simulated example, not live telemetry. Step through how risk escalates and where DeceptIQ is designed to intervene." />
      <ol className="grid gap-3 md:grid-cols-5">
        {STAGES.map((x, k) => (
          <li key={x.t}>
            <button onClick={() => setI(k)} aria-current={k === i}
              className={cn("panel w-full p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", k === i && "shadow-glow border-primary", k > i && "opacity-60")}>
              <div className="font-mono text-xs text-muted-foreground">Step {k + 1}</div>
              <div className="font-medium">{x.t}</div>
              <div className="mt-2"><Bar value={x.risk} /></div>
              <div className="mt-1 text-xs tabular-nums text-muted-foreground">risk {x.risk}</div>
            </button>
          </li>
        ))}
      </ol>
      <section className="panel mt-6 space-y-4 p-6">
        <div className="flex items-center gap-3"><h3 className="text-lg font-semibold">{s.t}</h3><BandChip band={bandFor(s.risk)} /></div>
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Evidence</div><p className="text-sm">{s.ev}</p></div>
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Intervention opportunity</div><p className="text-sm text-primary">{s.stop}</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</Button>
          <Button variant="outline" disabled={i === STAGES.length - 1} onClick={() => setI(i + 1)}>Next step</Button>
          <Button asChild><Link to="/analyze" search={{ sample: "otp-scam" }}>Analyze this scam</Link></Button>
        </div>
      </section>
    </>
  );
}
