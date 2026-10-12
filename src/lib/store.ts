import { useEffect, useState } from "react";
import { analyzeSample, type AnalysisResult } from "./analysis";

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
    if (raw === null) {
      const now = Date.now();
      const seed: HistoryEntry[] = [
        { id: "seed-3", result: analyzeSample("otp-scam", now - 3600_000 * 5), actions: [{ type: "report", ts: now - 3600_000 * 5 }], seeded: true },
        { id: "seed-2", result: analyzeSample("login-clone", now - 3600_000 * 26), actions: [{ type: "go-back", ts: now - 3600_000 * 26 }], seeded: true },
        { id: "seed-1", result: analyzeSample("safe", now - 3600_000 * 50), actions: [], seeded: true },
      ];
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

export function addEntry(result: AnalysisResult): HistoryEntry {
  const entry: HistoryEntry = { id: `a-${Date.now().toString(36)}`, result, actions: [] };
  if (getSettings().persistHistory) write([entry, ...read()].slice(0, 100));
  return entry;
}

export function recordAction(id: string, type: ActionType) {
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
  localStorage.removeItem(KEY);
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
}
const SKEY = "deceptiq.settings.v1";
const defaults: Settings = { persistHistory: true, quietSafeMode: true, overlayThreshold: "High" };
export function getSettings(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SKEY) ?? "{}") };
  } catch {
    return defaults;
  }
}
export function useSettings() {
  const [s, setS] = useState<Settings>(defaults);
  useEffect(() => setS(getSettings()), []);
  const update = (patch: Partial<Settings>) => {
    const next = { ...getSettings(), ...patch };
    localStorage.setItem(SKEY, JSON.stringify(next));
    setS(next);
  };
  return [s, update] as const;
}

export const ACTION_LABEL: Record<ActionType, string> = {
  "go-back": "Went back to safety",
  "close-page": "Closed page",
  report: "Reported",
  "continue-anyway": "Continued anyway (demo override)",
};
