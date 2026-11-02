// Domain model for Discipline Habit Builder.
// All persistence happens through src/lib/store.ts (LocalStorage today,
// swappable for IndexedDB/SQLite later).

export type ID = string;

export type DisciplineCategory =
  | "physical"
  | "mental"
  | "productivity"
  | "emotional"
  | "lifestyle"
  | "responsibility";

export type Difficulty = "minimum" | "standard" | "advanced";

export type HabitSchedule =
  | { type: "daily" }
  | { type: "weekly"; days: number[] } // 0 = Sunday … 6 = Saturday
  | { type: "custom"; intervalDays: number };

export type HabitTarget =
  | { type: "check" }
  | { type: "count"; value: number; unit: string };

export interface Habit {
  id: ID;
  name: string;
  description: string;
  category: DisciplineCategory;
  icon: string; // emoji
  colorIndex: number; // 1..8 → --p1..--p8
  schedule: HabitSchedule;
  target: HabitTarget;
  difficulty: Difficulty;
  reminder: { time: string; enabled: boolean } | null;
  startDate: string; // yyyy-mm-dd (local)
  archived: boolean;
  stackAfterId: ID | null; // habit stacking: do this right after another habit
  ifThenPlan: string; // implementation intention, e.g. "If it is 7am, then …"
  goalId: ID | null;
  createdAt: number;
}

export interface RoutineStep {
  id: ID;
  name: string;
  minutes: number;
  note: string;
}

export interface Routine {
  id: ID;
  name: string;
  period: "morning" | "afternoon" | "evening";
  steps: RoutineStep[];
}

export interface Task {
  id: ID;
  title: string;
  date: string; // yyyy-mm-dd
  isTop: boolean; // one of today's top 3 priorities
  done: boolean;
  doneAt: number | null;
  createdAt: number;
}

export interface FocusSession {
  id: ID;
  type: "pomodoro" | "deep" | "just-start";
  label: string;
  startedAt: number;
  minutes: number;
  distractions: { at: number; note: string }[];
}

export interface UrgeEvent {
  level: number; // 1..5 urge intensity
  resisted: boolean;
  note: string;
  at: number;
}

export interface BadHabit {
  id: ID;
  name: string;
  triggers: string[];
  alternative: string;
  startDate: string;
  logs: Record<string, UrgeEvent[]>; // date -> events
}

export interface ChallengeDayState {
  done: boolean;
  completedOn: number | null; // epoch
  reflection: string;
}

export interface ChallengeInstance {
  id: ID;
  templateId: string | null; // null for custom challenges
  name: string;
  tagline: string;
  days: number;
  reward: string;
  startDate: string;
  objectives: string[]; // one per day
  dayState: Record<number, ChallengeDayState>;
  createdAt: number;
}

export interface JournalEntry {
  id: ID;
  date: string;
  mood: number; // 1..5
  answers: Record<string, string>; // prompt key -> text
  free: string;
  createdAt: number;
  updatedAt: number;
}

export interface Milestone {
  id: ID;
  title: string;
  done: boolean;
}

export interface Goal {
  id: ID;
  title: string;
  horizon: "yearly" | "monthly" | "weekly";
  deadline: string | null;
  category: DisciplineCategory | null;
  habitIds: ID[];
  milestones: Milestone[];
  notes: string;
  createdAt: number;
  completedAt: number | null;
}

export interface LessonProgress {
  completedAt: number | null;
  quizPassed: boolean;
}

export interface ScreenFreeSession {
  id: ID;
  date: string;
  minutes: number;
  activity: string;
}

export interface TimelineEvent {
  id: ID;
  at: number; // epoch
  kind: "level" | "achievement" | "challenge" | "goal" | "milestone" | "onboarding";
  title: string;
  detail: string;
}

export interface Profile {
  name: string;
  identity: string; // "I am the kind of person who…"
  priorities: DisciplineCategory[];
  assessment: Partial<Record<DisciplineCategory, number>>; // 1..10 self-rating
  onboardedAt: number | null;
  reminders: { enabled: boolean; morning: string; evening: string };
  theme: "light" | "dark" | "system";
  pomodoro: { focusMin: number; breakMin: number };
  balance: Partial<Record<DisciplineCategory, number>> | null; // life balance self-assessment
}

export interface AppState {
  version: number;
  profile: Profile;
  habits: Habit[];
  habitLogs: Record<ID, Record<string, number>>; // habitId -> date -> count
  routines: Routine[];
  routineLogs: Record<ID, Record<string, string[]>>; // routineId -> date -> completed step ids
  tasks: Task[];
  focusSessions: FocusSession[];
  badHabits: BadHabit[];
  challengeInstances: ChallengeInstance[];
  journal: JournalEntry[];
  goals: Goal[];
  lessonProgress: Record<string, LessonProgress>;
  screenFree: ScreenFreeSession[];
  xp: number;
  unlockedAchievements: Record<string, string>; // achievementId -> date
  levelHistory: { level: number; at: number }[];
  timeline: TimelineEvent[];
}

export const LEVELS = [
  { name: "Beginner", minXp: 0 },
  { name: "Explorer", minXp: 100 },
  { name: "Consistent", minXp: 300 },
  { name: "Dedicated", minXp: 700 },
  { name: "Disciplined", minXp: 1500 },
  { name: "Focused", minXp: 3000 },
  { name: "Master", minXp: 6000 },
] as const;

export function levelFor(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].minXp) idx = i;
  const next = LEVELS[idx + 1];
  const base = LEVELS[idx].minXp;
  const progress = next ? (xp - base) / (next.minXp - base) : 1;
  return { index: idx, name: LEVELS[idx].name, next, progress: Math.max(0, Math.min(1, progress)) };
}
