// XP, levels and achievements. XP and unlocked badges are lifetime values —
// missing a day never erases them.

import { levelFor, type AppState, type DisciplineCategory } from "./model";
import { addDaysISO, todayISO, weekStartISO, daysBetween } from "./dates";
import { newId, setState, snapshot } from "./store";
import { habitsDueOn, isDone, currentStreak } from "./habits";

export function awardXp(points: number, reason: string) {
  const before = snapshot().xp;
  const beforeLevel = levelFor(before).index;
  setState((d) => {
    d.xp = Math.max(0, d.xp + points);
  });
  const after = snapshot();
  const afterLevel = levelFor(after.xp).index;
  if (afterLevel > beforeLevel) {
    setState((d) => {
      d.levelHistory.push({ level: afterLevel, at: Date.now() });
      d.timeline.push({ id: newId(), at: Date.now(), kind: "level", title: `Level up: ${levelFor(after.xp).name}`, detail: `${after.xp} XP earned in total` });
    });
  }
  checkAchievements();
  void reason;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check(state: AppState): boolean;
}

const dayScore = (state: AppState, date: string): number => {
  // lightweight replica of the dashboard score for achievement checks
  const due = habitsDueOn(state, date);
  const done = due.filter((h) => isDone(h, state.habitLogs[h.id], date)).length;
  const habitPart = due.length ? done / due.length : 0.5;
  let routinePart = 0.5;
  const routines = state.routines;
  if (routines.length) {
    let total = 0;
    for (const r of routines) {
      const steps = r.steps.length || 1;
      total += Math.min(1, (state.routineLogs[r.id]?.[date]?.length ?? 0) / steps);
    }
    routinePart = total / routines.length;
  }
  const tops = state.tasks.filter((t) => t.date === date && t.isTop);
  const taskPart = tops.length ? tops.filter((t) => t.done).length / tops.length : 0.5;
  return Math.round((habitPart * 0.5 + routinePart * 0.3 + taskPart * 0.2) * 100);
};

/** The daily discipline score (0–100) shown on the dashboard and in progress reports. */
export function dailyScore(state: AppState, date: string): number {
  return dayScore(state, date);
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-habit", name: "First Step", description: "Created your first habit", icon: "🌱", check: (s) => s.habits.length >= 1 },
  { id: "five-habits", name: "Architect", description: "Tracking 5 habits at once", icon: "🧩", check: (s) => s.habits.filter((h) => !h.archived).length >= 5 },
  { id: "first-completion", name: "Started", description: "Completed a habit for the first time", icon: "✔️", check: (s) => Object.values(s.habitLogs).some((log) => Object.keys(log).length > 0) },
  { id: "streak-3", name: "Warming Up", description: "3-day streak on any habit", icon: "🔥", check: (s) => s.habits.some((h) => currentStreak(h, s.habitLogs[h.id]) >= 3) },
  { id: "streak-7", name: "One Week Strong", description: "7-day streak on any habit", icon: "🔥", check: (s) => s.habits.some((h) => currentStreak(h, s.habitLogs[h.id]) >= 7) },
  { id: "streak-30", name: "Thirty Sunrises", description: "30-day streak on any habit", icon: "🏔️", check: (s) => s.habits.some((h) => currentStreak(h, s.habitLogs[h.id]) >= 30) },
  { id: "completions-25", name: "Momentum", description: "25 habit completions in total", icon: "📈", check: (s) => Object.values(s.habitLogs).reduce((n, log) => n + Object.values(log).filter((v) => v > 0).length, 0) >= 25 },
  { id: "completions-100", name: "Relentless", description: "100 habit completions in total", icon: "💯", check: (s) => Object.values(s.habitLogs).reduce((n, log) => n + Object.values(log).filter((v) => v > 0).length, 0) >= 100 },
  { id: "perfect-day", name: "Perfect Day", description: "Scored 100% on a daily discipline score", icon: "⭐", check: (s) => [todayISO(), addDaysISO(todayISO(), -1), addDaysISO(todayISO(), -2), addDaysISO(todayISO(), -3), addDaysISO(todayISO(), -4), addDaysISO(todayISO(), -5), addDaysISO(todayISO(), -6)].some((d) => dayScore(s, d) === 100) },
  { id: "first-journal", name: "Reflection", description: "Wrote your first journal entry", icon: "📓", check: (s) => s.journal.length >= 1 },
  { id: "journal-7", name: "Inner Work", description: "7 journal entries written", icon: "🪞", check: (s) => s.journal.length >= 7 },
  { id: "journal-30", name: "Deep Thinker", description: "30 journal entries written", icon: "🧠", check: (s) => s.journal.length >= 30 },
  { id: "first-focus", name: "Deep Diver", description: "Finished your first focus session", icon: "🎯", check: (s) => s.focusSessions.length >= 1 },
  { id: "focus-10h", name: "Ten Hours Deep", description: "10 hours of tracked focus time", icon: "⏳", check: (s) => s.focusSessions.reduce((n, x) => n + x.minutes, 0) >= 600 },
  { id: "routine-day", name: "Full Circle", description: "Completed every routine in one day", icon: "🌅", check: (s) => { const t = todayISO(); return s.routines.length > 0 && s.routines.every((r) => (s.routineLogs[r.id]?.[t]?.length ?? 0) >= r.steps.length && r.steps.length > 0); } },
  { id: "routine-week", name: "Steady Rhythm", description: "Completed any routine 7 days in a row", icon: "🔄", check: (s) => s.routines.some((r) => { let n = 0; let cur = todayISO(); for (let i = 0; i < 60; i++) { const steps = r.steps.length || 1; if ((s.routineLogs[r.id]?.[cur]?.length ?? 0) >= steps) { n++; cur = addDaysISO(cur, -1); } else if (cur !== todayISO()) break; else cur = addDaysISO(cur, -1); } return n >= 7; }) },
  { id: "urge-10", name: "Steady Hand", description: "Resisted 10 urges", icon: "🛡️", check: (s) => s.badHabits.reduce((n, b) => n + Object.values(b.logs).flat().filter((e) => e.resisted).length, 0) >= 10 },
  { id: "challenge-first-day", name: "Challenger", description: "Completed a challenge day", icon: "⚔️", check: (s) => s.challengeInstances.some((c) => Object.values(c.dayState).some((d) => d.done)) },
  { id: "challenge-complete", name: "Finisher", description: "Completed a full challenge", icon: "🏆", check: (s) => s.challengeInstances.some((c) => Object.values(c.dayState).filter((d) => d.done).length >= c.days) },
  { id: "goal-first", name: "Vision Set", description: "Created your first goal", icon: "🧭", check: (s) => s.goals.length >= 1 },
  { id: "goal-achieved", name: "Promise Kept", description: "Achieved a goal with milestones", icon: "🎖️", check: (s) => s.goals.some((g) => g.completedAt) },
  { id: "lesson-1", name: "Student", description: "Completed an Academy lesson", icon: "📚", check: (s) => Object.values(s.lessonProgress).some((p) => p.completedAt) },
  { id: "lesson-all", name: "Scholar", description: "Completed every Academy lesson", icon: "🎓", check: (s) => s.lessonProgress && Object.keys(s.lessonProgress).length >= 10 && Object.values(s.lessonProgress).every((p) => p.completedAt) },
  { id: "week-consistent", name: "Week of Discipline", description: "Scored 70%+ on 5 days in one week", icon: "🗓️", check: (s) => { const ws = weekStartISO(todayISO()); let n = 0; for (let i = 0; i < 7; i++) if (dayScore(s, addDaysISO(ws, i)) >= 70) n++; return n >= 5; } },
  { id: "level-3", name: "Consistent", description: "Reached the Consistent level", icon: "🥉", check: (s) => levelFor(s.xp).index >= 2 },
  { id: "level-6", name: "Focused", description: "Reached the Focused level", icon: "🥇", check: (s) => levelFor(s.xp).index >= 5 },
];

/** Unlock any newly earned achievements. Idempotent — safe to run often. */
export function checkAchievements(): string[] {
  const s = snapshot();
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!s.unlockedAchievements[a.id] && safeCheck(a, s)) newly.push(a.id);
  }
  if (newly.length === 0) return [];
  const today = todayISO();
  setState((d) => {
    for (const id of newly) {
      const a = ACHIEVEMENTS.find((x) => x.id === id)!;
      d.unlockedAchievements[id] = today;
      d.timeline.push({ id: newId(), at: Date.now(), kind: "achievement", title: `Badge unlocked: ${a.name}`, detail: a.description });
    }
  });
  return newly;
}

function safeCheck(a: Achievement, s: AppState): boolean {
  try {
    return a.check(s);
  } catch {
    return false;
  }
}

export function balanceFromData(state: AppState, days = 14): Record<DisciplineCategory, number> {
  // actual completion rate per discipline category over the recent window
  const result = { physical: 0, mental: 0, productivity: 0, emotional: 0, lifestyle: 0, responsibility: 0 };
  const counts = { physical: 0, mental: 0, productivity: 0, emotional: 0, lifestyle: 0, responsibility: 0 };
  const today = todayISO();
  for (const h of state.habits) {
    if (h.archived) continue;
    let due = 0;
    let done = 0;
    for (let i = 0; i < days; i++) {
      const date = addDaysISO(today, -i);
      if (daysBetween(h.startDate, date) < 0) continue;
      due++;
      if (isDone(h, state.habitLogs[h.id], date)) done++;
    }
    if (due > 0) {
      result[h.category] += done / due;
      counts[h.category] += 1;
    }
  }
  for (const key of Object.keys(result) as DisciplineCategory[]) {
    if (counts[key] > 0) result[key] = Math.round((result[key] / counts[key]) * 100);
  }
  return result;
}
