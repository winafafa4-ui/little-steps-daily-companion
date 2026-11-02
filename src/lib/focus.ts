// Focus module: Pomodoro / deep work sessions, Just Start mode, distraction log.

import type { FocusSession } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export function saveFocusSession(session: Omit<FocusSession, "id">): FocusSession {
  const full: FocusSession = { ...session, id: newId() };
  setState((d) => {
    d.focusSessions.push(full);
  });
  awardXp(Math.max(5, Math.round(session.minutes / 5) * 3), `Focus: ${session.label || session.type}`);
  return full;
}

export function addDistraction(sessionId: string, note: string) {
  setState((d) => {
    const s = d.focusSessions.find((x) => x.id === sessionId);
    if (s) s.distractions.push({ at: Date.now(), note });
  });
}

export function focusMinutesByDay(state: { focusSessions: FocusSession[] }, dates: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const date of dates) out[date] = 0;
  for (const s of state.focusSessions) {
    const day = new Date(s.startedAt);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    if (key in out) out[key] += s.minutes;
  }
  return out;
}

export function totalFocusMinutes(state: { focusSessions: FocusSession[] }): number {
  return state.focusSessions.reduce((sum, s) => sum + s.minutes, 0);
}
