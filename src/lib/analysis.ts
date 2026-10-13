/**
 * DeceptIQ deterministic DEMO analysis engine.
 *
 * Nothing here fetches or visits a URL. Custom URLs are analyzed only as a
 * string. Seeded samples additionally carry fictional, locally defined
 * "page signals" (visible text, form fields, visual similarity) that stand in
 * for what a real content script would observe.
 *
 * Risk score methodology (0-100):
 *   technical = min(70, sum of triggered indicator weights)
 *   manipulation = mean of five factor scores (urgency, fear, authority,
 *                  reward, sensitive request), each 0-100
 *   risk = min(100, round(technical + 0.3 * manipulation))
 * Bands: 0-29 Low, 30-54 Elevated, 55-74 High, 75-100 Critical.
 */

export type Band = "Low" | "Elevated" | "High" | "Critical";
export type Intent =
  | "Credential theft"
  | "OTP harvesting"
  | "Account takeover"
  | "Payment fraud"
  | "Impersonation"
  | "Reward / scam manipulation"
  | "No clear malicious intent";

export type IndicatorGroup = "URL / domain" | "Page structure (DOM)" | "Visual similarity" | "Forms & redirects";

export interface Indicator {
  id: string;
  group: IndicatorGroup;
  label: string;
  weight: number;
  triggered: boolean;
  evidence?: string | undefined;
  available: boolean; // false when the signal cannot be observed (URL-only mode)
}

export type FactorKey = "urgency" | "fear" | "authority" | "reward" | "sensitive";
export interface Factor {
  key: FactorKey;
  label: string;
  score: number;
  matches: string[];
}

export interface PageSignals {
  visibleText: string;
  passwordFieldCrossOrigin?: string; // form action host
  otpField?: boolean;
  cardField?: boolean;
  redirectChain?: string[];
  visualSimilarity?: { brand: string; similarity: number };
  obfuscatedScript?: boolean;
}

export interface Sample {
  id: "safe" | "login-clone" | "otp-scam";
  label: string;
  url: string;
  page: PageSignals;
}

export interface AnalysisResult {
  input: string; // redacted URL
  hostname: string;
  sampleId?: Sample["id"] | undefined;
  mode: "sample-signals" | "url-only";
  score: number;
  band: Band;
  technical: number;
  manipulation: number;
  confidence: number;
  indicators: Indicator[];
  factors: Factor[];
  intents: { intent: Intent; strength: number }[];
  primaryIntent: Intent;
  recommendation: string;
  analyzedAt: number;
}

/** Fictional brands used by the demo (no real organisations). */
export const DEMO_BRANDS = [
  { token: "novapay", official: "novapay.example" },
  { token: "bharatunity", official: "bharatunitybank.example" },
  { token: "cloudmail", official: "cloudmail.example" },
];

export const SAMPLES: Sample[] = [
  {
    id: "safe",
    label: "Safe example",
    url: "https://library.northfield-university.example/hours",
    page: {
      visibleText:
        "Library opening hours. The main reading room is open Monday to Friday. Group study rooms can be booked at the front desk.",
    },
  },
  {
    id: "login-clone",
    label: "Suspicious login clone",
    url: "http://n0vapay-secure-verify.account-check.top/signin?session=8f2a91c",
    page: {
      visibleText:
        "Your NovaPay account has been suspended due to unusual activity. Verify your identity within 24 hours or your account will be permanently locked. NovaPay Security Team. Enter your password to continue.",
      passwordFieldCrossOrigin: "collect-form.xyz",
      redirectChain: ["link.short.example", "account-check.top"],
      visualSimilarity: { brand: "NovaPay", similarity: 0.93 },
      obfuscatedScript: true,
    },
  },
  {
    id: "otp-scam",
    label: "OTP / payment scam",
    url: "https://bharatunity-reward-kyc.claim-now.xyz/otp",
    page: {
      visibleText:
        "Congratulations! You have won a cashback reward of Rs 5,000. Your KYC is pending. Enter the OTP sent to your mobile and your card number to claim within 10 minutes, otherwise the reward expires. Authorised by the Bank Compliance Department.",
      otpField: true,
      cardField: true,
      redirectChain: ["sms-link.example", "claim-now.xyz"],
      visualSimilarity: { brand: "Bharat Unity Bank", similarity: 0.71 },
    },
  },
];

const RISKY_TLDS = ["top", "xyz", "zip", "click", "icu", "live", "rest", "cam"];
const SENSITIVE_PATH = ["login", "signin", "verify", "otp", "kyc", "password", "wallet", "secure", "account", "update"];

const FACTOR_KEYWORDS: Record<FactorKey, { label: string; words: string[] }> = {
  urgency: { label: "Urgency", words: ["within 24 hours", "within 10 minutes", "immediately", "expires", "now", "urgent", "last chance"] },
  fear: { label: "Fear", words: ["suspended", "locked", "unusual activity", "blocked", "permanently", "legal action", "otherwise"] },
  authority: { label: "Authority", words: ["security team", "compliance", "authorised", "authorized", "bank", "official", "government"] },
  reward: { label: "Reward", words: ["congratulations", "won", "cashback", "reward", "prize", "free", "gift"] },
  sensitive: { label: "Sensitive request", words: ["password", "otp", "card number", "cvv", "pin", "kyc", "verify your identity"] },
};

export function bandFor(score: number): Band {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 30) return "Elevated";
  return "Low";
}

/** Strip query/fragment/credentials; mask token-like path segments. */
export function redactUrl(raw: string): { redacted: string; hostname: string } {
  try {
    const u = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
    const path = u.pathname
      .split("/")
      .map((seg) => (seg.length > 16 || /\d{5,}/.test(seg) ? "[redacted]" : seg))
      .join("/");
    const q = u.search ? "?[query removed]" : "";
    return { redacted: `${u.protocol}//${u.hostname}${path === "/" ? "" : path}${q}`, hostname: u.hostname };
  } catch {
    const host = raw.replace(/^[a-z]+:\/\//i, "").split(/[/?#]/)[0]!.slice(0, 80);
    return { redacted: host || "[invalid url]", hostname: host || "unknown" };
  }
}

function scoreFactors(text: string): Factor[] {
  const t = text.toLowerCase();
  return (Object.keys(FACTOR_KEYWORDS) as FactorKey[]).map((key) => {
    const { label, words } = FACTOR_KEYWORDS[key];
    const matches = words.filter((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t));
    return { key, label, matches, score: Math.min(100, matches.length * 34) };
  });
}

export function analyzeUrl(raw: string, sample?: Sample, now = Date.now()): AnalysisResult {
  const trimmed = raw.trim();
  let url: URL | null = null;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    url = null;
  }
  const host = (url?.hostname ?? trimmed).toLowerCase();
  const labels = host.split(".");
  const tld = labels[labels.length - 1] ?? "";
  const registrable = labels.slice(-2).join(".");
  const path = (url?.pathname ?? "").toLowerCase();
  const deHomoglyph = host.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s");
  const brand = DEMO_BRANDS.find((b) => deHomoglyph.replace(/-/g, "").includes(b.token));
  const isOfficial = brand ? host === brand.official || host.endsWith(`.${brand.official}`) : false;
  const pathHits = SENSITIVE_PATH.filter((w) => path.includes(w) || host.includes(w));
  const page = sample?.page;
  const hasPage = !!page;

  const ind = (i: Omit<Indicator, "available"> & { available?: boolean }): Indicator => ({ available: true, ...i });

  const indicators: Indicator[] = [
    ind({ id: "no-tls", group: "URL / domain", label: "URL uses plain http://", weight: 8, triggered: url?.protocol === "http:", evidence: "Scheme is http, so data would not be encrypted in transit." }),
    ind({ id: "ip-host", group: "URL / domain", label: "Raw IP address as host", weight: 15, triggered: /^\d{1,3}(\.\d{1,3}){3}$/.test(host), evidence: `Host "${host}" is an IP address.` }),
    ind({ id: "risky-tld", group: "URL / domain", label: "Top-level domain often abused", weight: 10, triggered: RISKY_TLDS.includes(tld), evidence: `TLD ".${tld}" is on a list of TLDs frequently seen in phishing reports — a weak heuristic, not proof of malice.` }),
    ind({ id: "lookalike", group: "URL / domain", label: "Brand name on an unofficial domain", weight: 18, triggered: !!brand && !isOfficial, evidence: brand ? `Contains "${brand.token}" but registrable domain is "${registrable}", not ${brand.official}.` : undefined }),
    ind({ id: "homoglyph", group: "URL / domain", label: "Digit-for-letter substitution", weight: 12, triggered: deHomoglyph !== host && !!brand, evidence: "Characters like 0/1 replace o/l to imitate a brand." }),
    ind({ id: "punycode", group: "URL / domain", label: "Punycode (xn--) hostname", weight: 12, triggered: host.includes("xn--"), evidence: "Internationalised hostname may hide lookalike characters." }),
    ind({ id: "structure", group: "URL / domain", label: "Hyphen-heavy or deep subdomain", weight: 6, triggered: (host.match(/-/g)?.length ?? 0) >= 2 || labels.length >= 5, evidence: `Host has ${(host.match(/-/g)?.length ?? 0)} hyphens and ${labels.length} labels.` }),
    ind({ id: "at-sign", group: "URL / domain", label: "'@' credential trick in URL", weight: 15, triggered: trimmed.includes("@"), evidence: "Text before '@' is ignored by browsers and can disguise the real host." }),
    ind({ id: "sensitive-path", group: "URL / domain", label: "Sensitive keywords in URL", weight: 6, triggered: pathHits.length > 0, evidence: `Keywords: ${pathHits.join(", ")}.` }),
    ind({ id: "long-url", group: "URL / domain", label: "Unusually long URL", weight: 4, triggered: trimmed.length > 100, evidence: `${trimmed.length} characters.` }),
    ind({ id: "password-xorigin", group: "Forms & redirects", label: "Password form posts to another domain", weight: 15, triggered: !!page?.passwordFieldCrossOrigin, available: hasPage, evidence: page?.passwordFieldCrossOrigin ? `Form action targets "${page.passwordFieldCrossOrigin}".` : undefined }),
    ind({ id: "otp-field", group: "Forms & redirects", label: "One-time password requested", weight: 10, triggered: !!page?.otpField, available: hasPage, evidence: "An OTP input field is present on a non-official domain." }),
    ind({ id: "card-field", group: "Forms & redirects", label: "Payment card details requested", weight: 12, triggered: !!page?.cardField, available: hasPage, evidence: "A card number input field is present." }),
    ind({ id: "redirects", group: "Forms & redirects", label: "Multi-hop redirect chain", weight: 8, triggered: (page?.redirectChain?.length ?? 0) >= 2, available: hasPage, evidence: page?.redirectChain ? `Arrived via ${page.redirectChain.join(" → ")}.` : undefined }),
    ind({ id: "obfuscated", group: "Page structure (DOM)", label: "Obfuscated inline script", weight: 6, triggered: !!page?.obfuscatedScript, available: hasPage, evidence: "Encoded script block found in the sample DOM." }),
    ind({ id: "visual", group: "Visual similarity", label: "Rendered page resembles a known brand", weight: 14, triggered: (page?.visualSimilarity?.similarity ?? 0) >= 0.85, available: hasPage, evidence: page?.visualSimilarity ? `Sample similarity to ${page.visualSimilarity.brand} login: ${Math.round(page.visualSimilarity.similarity * 100)}% (threshold 85%).` : undefined }),
  ];

  const technical = Math.min(70, indicators.filter((i) => i.triggered).reduce((s, i) => s + i.weight, 0));
  const text = page?.visibleText ?? (url ? `${host} ${path}`.replace(/[^a-z0-9]+/gi, " ") : trimmed);
  const factors = scoreFactors(text);
  const manipulation = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);
  const score = Math.min(100, Math.round(technical + 0.3 * manipulation));
  const band = bandFor(score);

  // Illustrative confidence: more observable signals and distance from a band edge => higher.
  const edges = [30, 55, 75];
  const edgeDist = Math.min(...edges.map((e) => Math.abs(score - e)));
  const confidence = Math.min(0.92, (hasPage ? 0.72 : 0.5) + Math.min(edgeDist, 20) / 100);

  const f = Object.fromEntries(factors.map((x) => [x.key, x.score])) as Record<FactorKey, number>;
  const on = (id: string) => indicators.find((i) => i.id === id)?.triggered ?? false;
  const intents: { intent: Intent; strength: number }[] = [
    { intent: "Credential theft" as Intent, strength: (on("password-xorigin") ? 50 : 0) + (on("lookalike") ? 25 : 0) + (on("visual") ? 25 : 0) },
    { intent: "OTP harvesting" as Intent, strength: (on("otp-field") ? 70 : 0) + (f.sensitive > 0 ? 20 : 0) },
    { intent: "Account takeover" as Intent, strength: on("password-xorigin") && on("otp-field") ? 90 : on("password-xorigin") || on("otp-field") ? 40 : 0 },
    { intent: "Payment fraud" as Intent, strength: (on("card-field") ? 75 : 0) + (f.reward > 0 ? 15 : 0) },
    { intent: "Impersonation" as Intent, strength: (on("lookalike") ? 45 : 0) + Math.round(f.authority * 0.4) },
    { intent: "Reward / scam manipulation" as Intent, strength: Math.round(f.reward * 0.8) },
  ]
    .map((i) => ({ ...i, strength: Math.min(100, i.strength) }))
    .filter((i) => i.strength > 0)
    .sort((a, b) => b.strength - a.strength);

  const primaryIntent: Intent = band === "Low" || intents.length === 0 ? "No clear malicious intent" : intents[0]!.intent;

  const recommendation = {
    Low: "No strong deception signals found in this assessment. HTTPS alone does not prove a site is legitimate — Browse normally and stay alert before entering sensitive data.",
    Elevated: "Proceed with caution. Verify the domain by typing the official address yourself before signing in or paying.",
    High: "Do not enter credentials, OTPs or payment details. Leave the page and contact the organisation through an official channel.",
    Critical: "Leave this page now. Do not submit any information. Report it, and if you already entered data, change passwords and contact your bank.",
  }[band];

  const { redacted, hostname } = redactUrl(trimmed);
  return {
    input: redacted,
    hostname,
    sampleId: sample?.id,
    mode: hasPage ? "sample-signals" : "url-only",
    score,
    band,
    technical,
    manipulation,
    confidence,
    indicators,
    factors,
    intents,
    primaryIntent,
    recommendation,
    analyzedAt: now,
  };
}

export function analyzeSample(id: Sample["id"], now?: number) {
  const s = SAMPLES.find((x) => x.id === id)!;
  return analyzeUrl(s.url, s, now);
}
