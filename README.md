# Deceptive Guardian Ai

Build a polished full-stack-ready interactive web prototype called DeceptIQ — AI-Powered Digital Deception Defense for hackathon team ThreatForge. Product name exactly DeceptIQ; team name ThreatForge. Tagline: “See beyond the link. Understand the deception. Stop the attack.” Hackathon: HACKINDIA AI & CYBERTECH HACKATHON 2026, in association with KIT Kanpur. Participant ID HI023039. Team: Dhruv Mishra (Team Lead & AI/ML Lead), Devisha Patel (Backend & Extension Interceptor Lead), Khushi Srivastava (Frontend & Dashboard Lead).

Build an actual interactive product prototype, not a static landing page. DeceptIQ is intended as a Chrome/Chromium browser extension plus web dashboard. Required concepts/features: URL/domain indicators; page structure/DOM signals; rendered visual similarity; visible text; suspicious forms/redirect signals; manipulation patterns; likely intent categories including credential theft, OTP harvesting, account takeover, payment fraud, impersonation, reward/scam manipulation; explainable Manipulation Score based on urgency, fear, authority, reward, sensitive request; attack-chain view (suspicious message → fake login → OTP request → payment request); “Why risky?” evidence; confidence/uncertainty; recommended action; active-defense actions Go Back, Close Page, Report, Continue Anyway; dashboard with risk/security summary, threat categories, evidence, manipulation factors, attack-chain view, history, incident details and reports; quiet safe browsing experience; strong warning overlay for suspicious example; privacy-first handling.

IMPORTANT HONESTY: this is a prototype/demo. Do not claim real live phishing detection, real Chrome extension installation, connected AI model, external reputation/domain-age/certificate APIs, or benchmarked accuracy/latency unless configured. Use seeded fictional examples and deterministic local demo analysis. Clearly label “Demo mode” and “Demo analysis — not a verdict about the live website.” If user enters a URL, do not fetch/visit it remotely. Analyze only the URL string/local sample signals. Do not claim zero-day prevention, sub-200ms, 90%+ accuracy, or 21-second vulnerability window. Use “designed for low-latency analysis” and “intended to warn before sensitive data is submitted.” Evidence must match displayed risk score.

DESIGN: premium judge-ready cybersecurity SaaS. Dark navy/near-black canvas with restrained cyan/violet accents, strong typography, crisp grid, subtle security/DOM/network motifs, accessible contrast, responsive. Avoid generic templates and emoji. Use CSS/SVG shield-style logo.

APP ROUTES: / dashboard/overview as default; /analyze; /history; /attack-chains; /reports; /settings. Sidebar/topbar navigation.

OVERVIEW: demo stats for sessions analyzed, elevated/critical findings, active demo attack chains; illustrative chart clearly marked sample data; recent analyses; Analyze URL CTA.

ANALYZE: URL input + quick-select buttons Safe example, Suspicious login clone, OTP/payment scam. Analyze button with loading state. Show 0–100 risk score and band Low/Elevated/High/Critical, illustrative confidence, manipulation sub-scores urgency/fear/authority/reward/sensitive-request, indicator checklist, likely intent, evidence, recommendation. Include polished mock active-defense warning with Go Back to Safety, Close Page, Report, Continue Anyway. Buttons must change UI/toasts/status; never navigate to submitted site. Go Back/Close may return to dashboard; Report records locally; Continue Anyway records a demo override and says no real browser navigation occurred. Include score calculation logic in source.

HISTORY: persistent session/localStorage demo history with search/filter, date/score/band, detail/re-run. Store sanitized hostname/redacted URL, not secrets.

ATTACK CHAINS: interactive simulated timeline/graph showing suspicious message → lookalike page → credential prompt → OTP request → payment redirect, risk escalation, evidence and intervention opportunity. Clearly say simulated example, not live telemetry.

REPORTS: incident summary, evidence, risk breakdown, action/recommendations. Functional Download JSON report and Print/Save PDF via browser print layout. Exclude secrets.

SETTINGS/PRIVACY: explain prototype limitations and privacy guardrails. Explain that a real Chrome Manifest V3 extension would use content scripts for DOM inspection; service worker handles extension events/messaging/storage/coordination and cannot directly inspect page DOM. No passwords/OTPs/form values should be collected/stored. No arbitrary URLs fetched by this demo. Include risk-score methodology.

TECH: TypeScript React + Tailwind + shadcn/ui, modular components, responsive, keyboard accessible. Use seeded fictitious data and local persistence. Make every visible button functional. First-time dashboard can be populated with clearly labelled sample/demo metrics. A judge should be able to demo Safe, Suspicious login clone, and OTP/payment scam, then inspect matching evidence, risk breakdown, attack chain, history and action recording. Prioritize correctness and consistency over exaggerated claims. Do not ask questions; implement with reasonable defaults.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://deceptive-guardian-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2a307603-dfcf-48f6-a85d-c8132f95b37a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
