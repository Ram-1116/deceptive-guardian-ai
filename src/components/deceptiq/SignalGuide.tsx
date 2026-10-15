import { Globe, FileCode2, MessageSquareText, ScanEye } from "lucide-react";

export function SignalGuide() {
  return (
    <details className="my-6 border-y border-border py-4">
      <summary className="cursor-pointer font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">How DeceptIQ analyzes a page</summary>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {[
          { icon: Globe, title: "URL / domain", status: "Inspected", text: "Local rules inspect the entered hostname, scheme and path. No website visit, reputation, certificate or domain-age lookup occurs." },
          { icon: FileCode2, title: "DOM / forms / redirects", status: "Not inspected for entered URLs", text: "Only explicitly defined sample fields are available here. Real page inspection requires a separate browser extension, which is planned." },
          { icon: MessageSquareText, title: "Visible text", status: "Sample scenarios only", text: "Defined sample wording is checked for urgency, fear, authority, reward and sensitive requests. URL tokens are not treated as page text." },
          { icon: ScanEye, title: "Visual / layout", status: "Optional / planned", text: "No screenshot or visual matching engine is connected. A sample may define an illustrative similarity value; missing values are unavailable, not clear." },
        ].map(({ icon: Icon, title, status, text }) => <div key={title} className="flex gap-3"><Icon className="mt-1 size-5 shrink-0 text-muted-foreground" /><div><h3 className="text-sm font-medium">{title}</h3><p className="my-1 text-xs text-primary">{status}</p><p className="text-xs text-muted-foreground">{text}</p></div></div>)}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Inspected describes available input, not a verified live-site verdict. All risk and intent scores are indicative rule outputs, not probabilities.</p>
    </details>
  );
}