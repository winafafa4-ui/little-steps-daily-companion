// Central state store. LocalStorage-backed, SSR-safe.
// The storage driver is isolated here so it can be swapped for
// IndexedDB or SQLite (Capacitor) without touching feature code.

import { useSyncExternalStore } from "react";
import type { AppState } from "./model";

const STORAGE_KEY = "dhb-state-v1";
const STATE_VERSION = 1;

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const emptyState = (): AppState => ({
  version: STATE_VERSION,
  profile: {
    name: "",
    identity: "",
    priorities: [],
    assessment: {},
    onboardedAt: null,
    reminders: { enabled: false, morning: "07:00", evening: "21:30" },
    theme: "system",
    pomodoro: { focusMin: 25, breakMin: 5 },
    balance: null,
  },
  habits: [],
  habitLogs: {},
  routines: [],
  routineLogs: {},
  tasks: [],
  focusSessions: [],
  badHabits: [],
  challengeInstances: [],
  journal: [],
  goals: [],
  lessonProgress: {},
  screenFree: [],
  xp: 0,
  unlockedAchievements: {},
  levelHistory: [],
  timeline: [],
});

function loadClient(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.habits)) return emptyState();
    // Merge over defaults so missing keys from older versions never crash.
    return { ...emptyState(), ...parsed, profile: { ...emptyState().profile, ...parsed.profile } };
  } catch {
    return emptyState();
  }
}

let state: AppState = typeof window === "undefined" ? emptyState() : loadClient();
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable (private mode) — keep running in memory.
    }
  }, 150);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Replace state via a mutator. Persists (debounced) and notifies subscribers. */
export function setState(mutator: (draft: AppState) => void) {
  const draft = structuredClone(state);
  mutator(draft);
  draft.version = STATE_VERSION;
  state = draft;
  persist();
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return state;
}

const EMPTY = emptyState();
const clientSnapshot = () => state;
const serverSnapshot = () => EMPTY;

/** Subscribe to the whole state object (stable reference between mutations). */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}

/** Read state without subscribing (event handlers, non-React code). */
export function snapshot(): AppState {
  return state;
}

// ---- Backup ----

export function exportJSON(): string {
  return JSON.stringify({ app: "Discipline Habit Builder", exportedAt: new Date().toISOString(), state }, null, 2);
}

export function importJSON(raw: string): { ok: boolean; error?: string } {
  try {
    const parsed = JSON.parse(raw);
    const next = parsed?.state ?? parsed;
    if (!next || typeof next !== "object" || !Array.isArray(next.habits) || !next.profile) {
      return { ok: false, error: "This file doesn't look like a Discipline Habit Builder backup." };
    }
    setState((draft) => {
      Object.assign(draft, { ...emptyState(), ...next, profile: { ...emptyState().profile, ...next.profile } });
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "The file could not be read as JSON." };
  }
}

export function clearAllData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  state = emptyState();
  listeners.forEach((l) => l());
}

// Backfill: after import or first load, make sure counters stay consistent.
if (typeof window !== "undefined") window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    state = loadClient();
    listeners.forEach((l) => l());
  }
});
