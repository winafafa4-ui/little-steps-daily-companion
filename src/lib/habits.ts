// Habit actions + pure habit logic (schedules, streaks, due/done checks).

import { addDaysISO, daysBetween, todayISO, weekdayOf } from "./dates";
import type { AppState, Habit } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export const DIFFICULTY_XP: Record<Habit["difficulty"], number> = {
  minimum: 8,
  standard: 12,
  advanced: 18,
};

export function createHabit(input: Partial<Habit> & { name: string }): Habit {
  const habit: Habit = {
    id: newId(),
    name: input.name,
    description: input.description ?? "",
    category: input.category ?? "lifestyle",
    icon: input.icon ?? "✅",
    colorIndex: input.colorIndex ?? 1,
    schedule: input.schedule ?? { type: "daily" },
    target: input.target ?? { type: "check" },
    difficulty: input.difficulty ?? "standard",
    reminder: input.reminder ?? null,
    startDate: input.startDate ?? todayISO(),
    archived: false,
    stackAfterId: input.stackAfterId ?? null,
    ifThenPlan: input.ifThenPlan ?? "",
    goalId: input.goalId ?? null,
    createdAt: Date.now(),
  };
  setState((d) => {
    d.habits.push(habit);
    d.habitLogs[habit.id] = d.habitLogs[habit.id] ?? {};
  });
  return habit;
}

export function updateHabit(id: string, patch: Partial<Habit>) {
  setState((d) => {
    const h = d.habits.find((x) => x.id === id);
    if (h) Object.assign(h, patch);
  });
}

export function archiveHabit(id: string, archived = true) {
  updateHabit(id, { archived });
}

export function deleteHabit(id: string) {
  setState((d) => {
    d.habits = d.habits.filter((h) => h.id !== id);
    delete d.habitLogs[id];
    d.routines.forEach((r) => (r.steps = r.steps));
    d.goals.forEach((g) => (g.habitIds = g.habitIds.filter((x) => x !== id)));
    d.habits.forEach((h) => {
      if (h.stackAfterId === id) h.stackAfterId = null;
    });
  });
}

/** Set the completion count for a habit on a date. Returns the resulting done state. */
export function setHabitProgress(habitId: string, date: string, count: number): boolean {
  const s = snapshot();
  const habit = s.habits.find((h) => h.id === habitId);
  if (!habit) return false;
  const targetValue = habit.target.type === "count" ? habit.target.value : 1;
  const clamped = Math.max(0, Math.min(count, targetValue));
  let wasDone = false;
  let nowDone = false;
  setState((d) => {
    d.habitLogs[habitId] = d.habitLogs[habitId] ?? {};
    wasDone = (d.habitLogs[habitId][date] ?? 0) >= targetValue;
    d.habitLogs[habitId][date] = clamped;
    nowDone = clamped >= targetValue;
  });
  if (!wasDone && nowDone) {
    awardXp(DIFFICULTY_XP[habit.difficulty], `Habit: ${habit.name}`);
  }
  return nowDone;
}

export function toggleHabit(habitId: string, date: string): boolean {
  const s = snapshot();
  const habit = s.habits.find((h) => h.id === habitId);
  if (!habit) return false;
  const current = s.habitLogs[habitId]?.[date] ?? 0;
  const targetValue = habit.target.type === "count" ? habit.target.value : 1;
  return setHabitProgress(habitId, date, current >= targetValue ? 0 : targetValue);
}

// ---- Pure logic ----

export function isDueOn(habit: Habit, date: string): boolean {
  if (daysBetween(habit.startDate, date) < 0) return false;
  const s = habit.schedule;
  if (s.type === "daily") return true;
  if (s.type === "weekly") return s.days.includes(weekdayOf(date));
  return daysBetween(habit.startDate, date) % Math.max(1, s.intervalDays) === 0;
}

export function targetValue(habit: Habit): number {
  return habit.target.type === "count" ? habit.target.value : 1;
}

export function isDone(habit: Habit, log: Record<string, number> | undefined, date: string): boolean {
  return (log?.[date] ?? 0) >= targetValue(habit);
}

/**
 * Current streak: consecutive due days completed, counting back from today.
 * Today being incomplete does not break the streak — the day isn't over.
 */
export function currentStreak(habit: Habit, log: Record<string, number> | undefined, today = todayISO()): number {
  let streak = 0;
  let cursor = today;
  // skip today if not yet done
  if (!isDone(habit, log, today)) cursor = addDaysISO(today, -1);
  let guard = 0;
  while (guard++ < 400) {
    if (daysBetween(habit.startDate, cursor) < 0) break;
    if (!isDueOn(habit, cursor)) {
      cursor = addDaysISO(cursor, -1);
      continue;
    }
    if (isDone(habit, log, cursor)) {
      streak++;
      cursor = addDaysISO(cursor, -1);
    } else break;
  }
  return streak;
}

export function bestStreak(habit: Habit, log: Record<string, number> | undefined, today = todayISO()): number {
  if (!log) return 0;
  const dates = Object.keys(log).sort();
  if (dates.length === 0) return 0;
  let best = 0;
  let streak = 0;
  let cursor = habit.startDate;
  const end = today;
  let guard = 0;
  while (daysBetween(cursor, end) >= 0 && guard++ < 2000) {
    if (isDueOn(habit, cursor)) {
      if (isDone(habit, log, cursor)) {
        streak++;
        best = Math.max(best, streak);
      } else if (cursor !== today) {
        streak = 0;
      }
    }
    cursor = addDaysISO(cursor, 1);
  }
  return best;
}

export function totalCompletions(habit: Habit, log: Record<string, number> | undefined): number {
  if (!log) return 0;
  return Object.keys(log).filter((date) => isDone(habit, log, date)).length;
}

export function completionRate(habit: Habit, log: Record<string, number> | undefined, days = 30, today = todayISO()): number {
  let due = 0;
  let done = 0;
  for (let i = 0; i < days; i++) {
    const date = addDaysISO(today, -i);
    if (daysBetween(habit.startDate, date) < 0) continue;
    if (isDueOn(habit, date)) {
      due++;
      if (isDone(habit, log, date)) done++;
    }
  }
  return due === 0 ? 0 : done / due;
}

export function habitsDueOn(state: AppState, date: string): Habit[] {
  return state.habits.filter((h) => !h.archived && isDueOn(h, date));
}
