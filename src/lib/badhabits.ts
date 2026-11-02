// Bad Habit Breaker: trigger tracking, urge logging (never judgmental),
// alternative behaviors, weekly behavioral insights.

import { addDaysISO, todayISO, lastNDates } from "./dates";
import type { BadHabit, UrgeEvent } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export function createBadHabit(input: { name: string; triggers: string[]; alternative: string }): BadHabit {
  const habit: BadHabit = { ...input, id: newId(), startDate: todayISO(), logs: {} };
  setState((d) => {
    d.badHabits.push(habit);
  });
  return habit;
}

export function logUrge(badHabitId: string, level: number, resisted: boolean, note = "") {
  const event: UrgeEvent = { level, resisted, note, at: Date.now() };
  setState((d) => {
    const bh = d.badHabits.find((x) => x.id === badHabitId);
    if (!bh) return;
    const date = todayISO();
    bh.logs[date] = bh.logs[date] ?? [];
    bh.logs[date].push(event);
  });
  if (resisted) awardXp(8, `Urges resisted: ${snapshot().badHabits.find((b) => b.id === badHabitId)?.name ?? ""}`);
}

export function updateBadHabit(id: string, patch: Partial<BadHabit>) {
  setState((d) => {
    const bh = d.badHabits.find((x) => x.id === id);
    if (bh) Object.assign(bh, patch);
  });
}

export function deleteBadHabit(id: string) {
  setState((d) => {
    d.badHabits = d.badHabits.filter((b) => b.id !== id);
  });
}

export function badHabitStats(bh: BadHabit, days = 30): {
  urges: number;
  resisted: number;
  relapses: number;
  resistRate: number;
  cleanStreak: number;
  cleanDays: number;
} {
  const dates = lastNDates(days);
  let urges = 0;
  let resisted = 0;
  let relapses = 0;
  let cleanDays = 0;
  for (const date of dates) {
    const events = bh.logs[date] ?? [];
    urges += events.length;
    resisted += events.filter((e) => e.resisted).length;
    relapses += events.filter((e) => !e.resisted).length;
    if (events.length === 0 || events.every((e) => e.resisted)) cleanDays++;
  }
  // clean streak: consecutive recent days without a relapse
  let cleanStreak = 0;
  let cursor = todayISO();
  for (let i = 0; i < 400; i++) {
    const events = bh.logs[cursor] ?? [];
    if (events.some((e) => !e.resisted)) break;
    cleanStreak++;
    cursor = addDaysISO(cursor, -1);
    if (cursor < bh.startDate) break;
  }
  return { urges, resisted, relapses, resistRate: urges ? resisted / urges : 0, cleanStreak, cleanDays };
}

export function topTriggers(bh: BadHabit): { trigger: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const events of Object.values(bh.logs)) {
    for (const e of events) {
      for (const trigger of bh.triggers) {
        if (noteMatches(e.note, trigger)) counts[trigger] = (counts[trigger] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function noteMatches(note: string, trigger: string): boolean {
  if (!note) return false;
  return note.toLowerCase().includes(trigger.toLowerCase().split(" ")[0] ?? trigger.toLowerCase());
}

export const COMMON_BAD_HABITS = [
  { name: "Excessive social media", triggers: ["Boredom", "Stress", "Phone in hand"], alternative: "Read two pages or step outside for a short walk" },
  { name: "Procrastination", triggers: ["Big vague task", "Fear of failing", "Tiredness"], alternative: "Use Just Start Mode for five minutes" },
  { name: "Unnecessary spending", triggers: ["Late-night browsing", "Sales emails", "Stress"], alternative: "Wait 24 hours before buying" },
  { name: "Excessive gaming", triggers: ["Escaping tasks", "Friends online", "Boredom"], alternative: "Set a fixed gaming window after duties are done" },
  { name: "Late-night scrolling", triggers: ["Phone by the bed", "Can't sleep", "Habit loop"], alternative: "Charge phone outside the bedroom" },
  { name: "Skipping workouts", triggers: ["Low energy", "Busy schedule", "Bad weather"], alternative: "Do a 10-minute minimum version instead" },
];
