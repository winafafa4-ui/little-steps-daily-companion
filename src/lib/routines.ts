// Routine actions + logic (morning/afternoon/evening routines, routine logs).

import { todayISO } from "./dates";
import type { Routine, RoutineStep } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export function createRoutine(name: string, period: Routine["period"], steps: Omit<RoutineStep, "id">[]): Routine {
  const routine: Routine = {
    id: newId(),
    name,
    period,
    steps: steps.map((s) => ({ ...s, id: newId() })),
  };
  setState((d) => {
    d.routines.push(routine);
    d.routineLogs[routine.id] = d.routineLogs[routine.id] ?? {};
  });
  return routine;
}

export function updateRoutine(id: string, patch: Partial<Routine>) {
  setState((d) => {
    const r = d.routines.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
  });
}

export function deleteRoutine(id: string) {
  setState((d) => {
    d.routines = d.routines.filter((r) => r.id !== id);
    delete d.routineLogs[id];
  });
}

export function reorderSteps(routineId: string, from: number, to: number) {
  setState((d) => {
    const r = d.routines.find((x) => x.id === routineId);
    if (!r || from >= r.steps.length || to < 0 || to > r.steps.length) return;
    const [step] = r.steps.splice(from, 1);
    if (step) r.steps.splice(to, 0, step);
  });
}

export function toggleStep(routineId: string, stepId: string, date = todayISO()): void {
  const s = snapshot();
  const routine = s.routines.find((r) => r.id === routineId);
  if (!routine) return;
  const wasComplete = routine.steps.length > 0 && (s.routineLogs[routineId]?.[date]?.length ?? 0) >= routine.steps.length;
  setState((d) => {
    d.routineLogs[routineId] = d.routineLogs[routineId] ?? {};
    const done = d.routineLogs[routineId][date] ?? [];
    const idx = done.indexOf(stepId);
    if (idx >= 0) done.splice(idx, 1);
    else done.push(stepId);
    d.routineLogs[routineId][date] = done;
  });
  const now = snapshot();
  const nowDone = (now.routineLogs[routineId]?.[date] ?? []).length;
  if (routine.steps.length > 0 && nowDone === routine.steps.length && !wasComplete) {
    awardXp(15, `Routine complete: ${routine.name}`);
  }
}

export function completeAllSteps(routineId: string, date = todayISO()) {
  const routine = snapshot().routines.find((r) => r.id === routineId);
  if (!routine) return;
  const s = snapshot();
  const already = (s.routineLogs[routineId]?.[date] ?? []).length >= routine.steps.length;
  if (already) return;
  setState((d) => {
    d.routineLogs[routineId] = d.routineLogs[routineId] ?? {};
    d.routineLogs[routineId][date] = routine.steps.map((st) => st.id);
  });
  awardXp(15, `Routine complete: ${routine.name}`);
}

export function routineProgress(state: { routines: Routine[]; routineLogs: Record<string, Record<string, string[]>> }, routineId: string, date = todayISO()): number {
  const routine = state.routines.find((r) => r.id === routineId);
  if (!routine || routine.steps.length === 0) return 0;
  const done = state.routineLogs[routineId]?.[date]?.length ?? 0;
  return Math.min(1, done / routine.steps.length);
}

export function periodForNow(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
