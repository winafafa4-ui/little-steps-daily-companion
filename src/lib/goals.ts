// Goal & personal growth planner: yearly / monthly / weekly goals,
// milestones, deadlines, habit connections.

import type { Goal } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export function createGoal(input: Pick<Goal, "title" | "horizon" | "deadline" | "category" | "habitIds" | "milestones" | "notes">): Goal {
  const goal: Goal = { ...input, milestones: input.milestones.map((m) => ({ ...m, id: newId() })), id: newId(), createdAt: Date.now(), completedAt: null };
  setState((d) => {
    d.goals.push(goal);
  });
  return goal;
}

export function updateGoal(id: string, patch: Partial<Goal>) {
  setState((d) => {
    const g = d.goals.find((x) => x.id === id);
    if (g) Object.assign(g, patch);
  });
}

export function toggleMilestone(goalId: string, milestoneId: string) {
  setState((d) => {
    const g = d.goals.find((x) => x.id === goalId);
    const m = g?.milestones.find((x) => x.id === milestoneId);
    if (m) m.done = !m.done;
  });
  const s = snapshot();
  const g = s.goals.find((x) => x.id === goalId);
  if (!g) return;
  const doneCount = g.milestones.filter((m) => m.done).length;
  if (g.milestones.length > 0 && doneCount === g.milestones.length && !g.completedAt) {
    setState((d) => {
      const gg = d.goals.find((x) => x.id === goalId);
      if (gg) gg.completedAt = Date.now();
    });
    awardXp(g.horizon === "yearly" ? 80 : g.horizon === "monthly" ? 40 : 20, `Goal achieved: ${g.title}`);
    setState((d) => {
      d.timeline.push({ id: newId(), at: Date.now(), kind: "goal", title: `Goal achieved: ${g.title}`, detail: `All ${g.milestones.length} milestones done` });
    });
  }
}

export function addMilestone(goalId: string, title: string) {
  setState((d) => {
    const g = d.goals.find((x) => x.id === goalId);
    if (g && title.trim()) g.milestones.push({ id: newId(), title: title.trim(), done: false });
  });
}

export function deleteGoal(id: string) {
  setState((d) => {
    d.goals = d.goals.filter((g) => g.id !== id);
  });
}

export function goalProgress(g: Goal): number {
  if (g.completedAt) return 1;
  if (g.milestones.length === 0) return 0;
  return g.milestones.filter((m) => m.done).length / g.milestones.length;
}

export function goalHorizonLabel(h: Goal["horizon"]): string {
  return h === "yearly" ? "Yearly" : h === "monthly" ? "Monthly" : "Weekly";
}
