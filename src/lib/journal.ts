// Discipline Journal: fixed reflection prompts, mood, free writing,
// weekly reflections and monthly self-assessments.

import { todayISO } from "./dates";
import type { JournalEntry } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export const JOURNAL_PROMPTS = [
  { key: "accomplish", label: "What did I accomplish today?" },
  { key: "struggle", label: "Where did I struggle?" },
  { key: "distraction", label: "What distracted me?" },
  { key: "learn", label: "What did I learn?" },
  { key: "improve", label: "What should I improve tomorrow?" },
  { key: "grateful", label: "What am I grateful for?" },
] as const;

export const MOOD_FACES = ["😞", "😕", "😐", "🙂", "😄"];

export function saveJournalEntry(input: { date?: string; mood: number; answers: Record<string, string>; free: string }) {
  const date = input.date ?? todayISO();
  const s = snapshot();
  const existing = s.journal.find((e) => e.date === date);
  const isNew = !existing;
  setState((d) => {
    if (existing) {
      existing.mood = input.mood;
      existing.answers = input.answers;
      existing.free = input.free;
      existing.updatedAt = Date.now();
    } else {
      d.journal.push({
        id: newId(),
        date,
        mood: input.mood,
        answers: input.answers,
        free: input.free,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  });
  if (isNew) awardXp(10, "Journal entry written");
}

export function todayEntry(state: { journal: JournalEntry[] }, date = todayISO()): JournalEntry | undefined {
  return state.journal.find((e) => e.date === date);
}

export function searchJournal(state: { journal: JournalEntry[] }, query: string): JournalEntry[] {
  const q = query.trim().toLowerCase();
  const sorted = [...state.journal].sort((a, b) => (a.date < b.date ? 1 : -1));
  if (!q) return sorted;
  return sorted.filter(
    (e) =>
      e.free.toLowerCase().includes(q) ||
      Object.values(e.answers).some((a) => a.toLowerCase().includes(q)) ||
      e.date.includes(q),
  );
}
