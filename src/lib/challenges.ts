// Discipline challenges: 8 built-in programs + custom challenges.
// Objectives are generated per day; nothing here claims a fixed number of
// days makes a habit permanent.

import { addDaysISO, daysBetween, todayISO } from "./dates";
import type { ChallengeInstance } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export interface ChallengeTemplate {
  id: string;
  name: string;
  tagline: string;
  days: number;
  reward: string;
  category: string;
  reflection: string[];
  objectiveFor(day: number): string;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: "wake-early-7",
    name: "7-Day Wake Up Early",
    tagline: "Reclaim your mornings, one sunrise at a time",
    days: 7,
    reward: "The calm, unhurried feeling of an already-won morning",
    category: "lifestyle",
    reflection: ["What pulled you out of bed today?", "What would make tomorrow's wake-up easier?"],
    objectiveFor(day: number) {
      return [
        "Set your alarm tonight and put your phone across the room",
        "Get up at your target time — no snooze",
        "Get up, then immediately open the curtains or step outside for light",
        "Get up on time and start your morning routine within 10 minutes",
        "Get up on time and do one thing you enjoy before obligations",
        "Get up on time, even if you slept imperfectly",
        "Get up on time and plan how to keep this going next week",
      ][Math.min(day - 1, 6)];
    },
  },
  {
    id: "reading-14",
    name: "14-Day Reading Challenge",
    tagline: "Fourteen days of daily reading, however small",
    days: 14,
    reward: "A reading habit with real momentum — and a finished book",
    category: "mental",
    reflection: ["What did you read, and what stuck?", "When during the day was reading easiest?"],
    objectiveFor(day: number) {
      return day <= 3
        ? "Read for 10 minutes at a fixed time today"
        : day <= 7
          ? "Read for 15 minutes — keep the same time and place"
          : "Read for 20+ minutes today; note one idea worth keeping";
    },
  },
  {
    id: "consistency-21",
    name: "21-Day Consistency Challenge",
    tagline: "Show up for your core habits 21 days in a row",
    days: 21,
    reward: "Proof to yourself that you can be consistent — that's the win",
    category: "productivity",
    reflection: ["Which habit was hardest today, and why?", "What system (not willpower) would make it easier?"],
    objectiveFor(day: number) {
      return `Complete at least 2 of your core habits today (Day ${day} of showing up). Perfect is not required — present is.`;
    },
  },
  {
    id: "physical-30",
    name: "30-Day Physical Discipline",
    tagline: "Thirty days of moving your body every single day",
    days: 30,
    reward: "A stronger body and a proven exercise habit",
    category: "physical",
    reflection: ["How does your body feel today?", "What workout will you prepare tonight?"],
    objectiveFor(day: number) {
      if (day <= 7) return "Do any deliberate movement for 10 minutes today";
      if (day <= 14) return "Train for at least 20 minutes — intensity is your choice";
      if (day <= 21) return "Train 30 minutes and log how you felt afterward";
      return "Train 30+ minutes and include one strength or mobility element";
    },
  },
  {
    id: "no-procrastination-30",
    name: "30-Day No Procrastination",
    tagline: "Face the hard thing first, every day",
    days: 30,
    reward: "The identity of someone who starts — and the hours you get back",
    category: "productivity",
    reflection: ["What task did you avoid longest today?", "What was the real cost of waiting?"],
    objectiveFor(day: number) {
      return `Pick today's most-avoided task and start it within 5 minutes of deciding (Day ${day}). Five minutes counts as a win.`;
    },
  },
  {
    id: "digital-detox-7",
    name: "7-Day Digital Detox",
    tagline: "One week of intentional screen use",
    days: 7,
    reward: "Quieter evenings and a phone that serves you again",
    category: "lifestyle",
    reflection: ["When did you reach for your phone without thinking?", "What did you do with the freed time?"],
    objectiveFor(day: number) {
      return [
        "No screens for the first 30 minutes after waking",
        "Phone-free first hour of the evening",
        "Log your screen-free time in the Digital Tracker",
        "No social media until your first habit block is done",
        "Charge your phone outside the bedroom tonight",
        "Replace one scrolling session with a walk or a book",
        "Define your permanent phone rules for after this week",
      ][Math.min(day - 1, 6)];
    },
  },
  {
    id: "self-control-30",
    name: "30-Day Self-Control",
    tagline: "Pause before every impulse, one day at a time",
    days: 30,
    reward: "A wider gap between impulse and action — your strongest asset",
    category: "emotional",
    reflection: ["What urge showed up today, and how strong was it?", "What helped you ride it out?"],
    objectiveFor(day: number) {
      return `Log every significant urge today in the Bad Habit Breaker (Day ${day}) and choose your alternative at least once.`;
    },
  },
  {
    id: "organized-life-30",
    name: "30-Day Organized Life",
    tagline: "One small act of order every day",
    days: 30,
    reward: "A home and schedule that work for you instead of against you",
    category: "responsibility",
    reflection: ["What did you organize today?", "What's one thing you can pre-arrange for tomorrow?"],
    objectiveFor(day: number) {
      if (day % 7 === 0) return "Do a 15-minute weekly reset: surface, laundry, plan";
      return "Spend 10 minutes restoring order: one surface, drawer, or inbox today";
    },
  },
];

export function startChallenge(template: ChallengeTemplate, startDate = todayISO()): ChallengeInstance {
  const objectives = Array.from({ length: template.days }, (_, i) => template.objectiveFor(i + 1));
  const instance: ChallengeInstance = {
    id: newId(),
    templateId: template.id,
    name: template.name,
    tagline: template.tagline,
    days: template.days,
    reward: template.reward,
    startDate,
    objectives,
    dayState: {},
    createdAt: Date.now(),
  };
  setState((d) => {
    d.challengeInstances.push(instance);
  });
  return instance;
}

export function startCustomChallenge(name: string, days: number, reward: string, startDate = todayISO()): ChallengeInstance {
  const instance: ChallengeInstance = {
    id: newId(),
    templateId: null,
    name,
    tagline: "Your own custom challenge",
    days: Math.max(1, Math.min(365, days)),
    reward,
    startDate,
    objectives: Array.from({ length: Math.max(1, Math.min(365, days)) }, (_, i) => `Day ${i + 1}: keep your commitment`),
    dayState: {},
    createdAt: Date.now(),
  };
  setState((d) => {
    d.challengeInstances.push(instance);
  });
  return instance;
}

export function toggleChallengeDay(instanceId: string, day: number) {
  const s = snapshot();
  const inst = s.challengeInstances.find((c) => c.id === instanceId);
  if (!inst) return;
  const was = inst.dayState[day]?.done ?? false;
  setState((d) => {
    const c = d.challengeInstances.find((x) => x.id === instanceId);
    if (!c) return;
    c.dayState[day] = c.dayState[day] ?? { done: false, completedOn: null, reflection: "" };
    c.dayState[day].done = !was;
    c.dayState[day].completedOn = !was ? Date.now() : null;
  });
  if (!was) {
    awardXp(20, `Challenge day ${day}: ${inst.name}`);
    const now = snapshot();
    const after = now.challengeInstances.find((c) => c.id === instanceId);
    if (after && Object.values(after.dayState).filter((x) => x.done).length === after.days) {
      awardXp(60, `Challenge completed: ${inst.name}`);
      setState((draft) => {
        draft.timeline.push({
          id: newId(),
          at: Date.now(),
          kind: "challenge",
          title: `Completed ${inst.name}`,
          detail: `${inst.days} days of showing up`,
        });
      });
    }
  }
}

export function setReflection(instanceId: string, day: number, text: string) {
  setState((d) => {
    const c = d.challengeInstances.find((x) => x.id === instanceId);
    if (!c) return;
    c.dayState[day] = c.dayState[day] ?? { done: false, completedOn: null, reflection: "" };
    c.dayState[day].reflection = text;
  });
}

export function isChallengeActive(inst: ChallengeInstance, today = todayISO()): boolean {
  return daysBetween(inst.startDate, today) < inst.days;
}

export function challengeProgress(inst: ChallengeInstance): number {
  return Object.values(inst.dayState).filter((x) => x.done).length / inst.days;
}

export function challengeCurrentDay(inst: ChallengeInstance, today = todayISO()): number {
  return Math.min(inst.days, Math.max(1, daysBetween(inst.startDate, today) + 1));
}

export function deleteChallenge(id: string) {
  setState((d) => {
    d.challengeInstances = d.challengeInstances.filter((c) => c.id !== id);
  });
}

export { addDaysISO as challengeDateForDay };
