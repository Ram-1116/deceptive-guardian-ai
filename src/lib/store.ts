import { useEffect, useState } from "react";
import { analyzeSample, analyzeUrl, redactUrl, type AnalysisResult } from "./analysis";

export type ActionType = "go-back" | "close-page" | "report" | "continue-anyway";
export interface HistoryEntry {
  id: string;
  result: AnalysisResult;
  actions: { type: ActionType; ts: number }[];
  seeded?: boolean;
}

const KEY = "deceptiq.history.v1";
const EVT = "deceptiq:history";

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    // No auto-seeding: a fresh store starts empty. Samples only enter
    // history after the user explicitly runs a sample scenario.
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries = parsed.flatMap((entry): HistoryEntry[] => {
      if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !entry.result || typeof entry.result.input !== "string" || !Array.isArray(entry.result.indicators) || !Array.isArray(entry.result.factors) || !Array.isArray(entry.result.intents) || !Number.isFinite(entry.result.analyzedAt)) return [];
      // Migrate legacy installs: drop auto-seeded entries, keep genuine ones.
      if (entry.seeded === true || /^seed-\d+$/.test(entry.id)) return [];
      const { confidence: _confidence, ...result } = entry.result;
      const sanitized = redactUrl(result.input);
      const refreshed = result.sampleId ? analyzeSample(result.sampleId, result.analyzedAt) : {
        ...result, input: sanitized.redacted, hostname: sanitized.hostname,
        indicators: result.indicators.map((i: AnalysisResult["indicators"][number]) => ({ ...i, source: i.group === "URL / domain" ? "URL string" : "Defined sample signal", basis: i.basis ?? "heuristic" })),
        factors: result.factors.map((f: AnalysisResult["factors"][number]) => ({ ...f, available: false, score: 0, matches: [] })),
        manipulation: 0, score: Math.min(70, Math.max(0, result.technical)),
      };
      // Re-assess sanitized URL-only legacy entries under current rules.
      const safeResult = result.sampleId ? refreshed : analyzeUrl(sanitized.redacted, undefined, result.analyzedAt);
      return [{ id: entry.id, result: safeResult, seeded: !!entry.seeded, actions: Array.isArray(entry.actions) ? entry.actions.filter((a: {type: string; ts: number}) => ["go-back", "close-page", "report", "continue-anyway"].includes(a?.type) && Number.isFinite(a.ts)) : [] }];
    }).filter((e) => getSettings().retentionDays === 0 || e.result.analyzedAt >= Date.now() - getSettings().retentionDays * 86400_000).slice(0, 100);
    localStorage.setItem(KEY, JSON.stringify(entries));
    return entries;
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); }
  catch { throw new Error("Browser storage is unavailable or full. Your analysis is still visible, but could not be saved."); }
  window.dispatchEvent(new Event(EVT));
}

export function addEntry(result: AnalysisResult): HistoryEntry {
  const entry: HistoryEntry = { id: `a-${crypto.randomUUID()}`, result, actions: [] };
  if (getSettings().persistHistory) write([entry, ...read()].slice(0, 100));
  return entry;
}

export function recordAction(id: string, type: ActionType) {
  if (!getSettings().persistHistory) return;
  write(read().map((e) => (e.id === id ? { ...e, actions: [...e.actions, { type, ts: Date.now() }] } : e)));
}

export function deleteEntry(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory() {
  localStorage.setItem(KEY, "[]");
  window.dispatchEvent(new Event(EVT));
}

export function resetDemo() {
  localStorage.setItem(KEY, "[]");
  localStorage.removeItem(SKEY);
  window.dispatchEvent(new Event(EVT));
}

export function useHistory() {
  const [list, setList] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = () => {
      setList(read());
      setReady(true);
    };
    load();
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVT, load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return { list, ready };
}

export interface Settings {
  persistHistory: boolean;
  quietSafeMode: boolean;
  overlayThreshold: "Elevated" | "High";
  retentionDays: 0 | 7 | 30;
}
const SKEY = "deceptiq.settings.v1";
const defaults: Settings = { persistHistory: true, quietSafeMode: true, overlayThreshold: "High", retentionDays: 30 };
export function getSettings(): Settings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SKEY) ?? "{}") ?? {};
    return { persistHistory: typeof parsed.persistHistory === "boolean" ? parsed.persistHistory : defaults.persistHistory, quietSafeMode: typeof parsed.quietSafeMode === "boolean" ? parsed.quietSafeMode : defaults.quietSafeMode, overlayThreshold: parsed.overlayThreshold === "Elevated" ? "Elevated" : "High", retentionDays: [0, 7, 30].includes(parsed.retentionDays) ? parsed.retentionDays : 30 };
  } catch {
    return defaults;
  }
}
export function useSettings() {
  const [s, setS] = useState<Settings>(defaults);
  useEffect(() => {
    const load = () => setS(getSettings());
    load(); window.addEventListener(EVT, load); window.addEventListener("storage", load);
    return () => { window.removeEventListener(EVT, load); window.removeEventListener("storage", load); };
  }, []);
  const update = (patch: Partial<Settings>) => {
    const next = { ...getSettings(), ...patch };
    localStorage.setItem(SKEY, JSON.stringify(next));
    setS(next);
    window.dispatchEvent(new Event(EVT));
  };
  return [s, update] as const;
}

export const ACTION_LABEL: Record<ActionType, string> = {
  "go-back": "Go Back recorded (simulation)",
  "close-page": "Close Page recorded (simulation)",
  report: "Report recorded locally",
  "continue-anyway": "Continued anyway (override recorded)",
};
