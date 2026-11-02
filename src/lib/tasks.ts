// Daily task manager (independent from habits) + top-3 priorities.

import { todayISO } from "./dates";
import type { Task } from "./model";
import { newId, setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export function addTask(title: string, date = todayISO(), isTop = false): Task {
  const task: Task = { id: newId(), title, date, isTop, done: false, doneAt: null, createdAt: Date.now() };
  setState((d) => {
    d.tasks.push(task);
  });
  return task;
}

export function toggleTask(id: string) {
  setState((d) => {
    const t = d.tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = !t.done;
    t.doneAt = t.done ? Date.now() : null;
  });
  const t = snapshot().tasks.find((x) => x.id === id);
  if (t?.done) awardXp(t.isTop ? 8 : 5, `Task done: ${t.title}`);
}

export function setTaskTop(id: string, isTop: boolean) {
  const s = snapshot();
  const todayCount = s.tasks.filter((t) => t.date === todayISO() && t.isTop && t.id !== id).length;
  if (isTop && todayCount >= 3) return false;
  setState((d) => {
    const t = d.tasks.find((x) => x.id === id);
    if (t) t.isTop = isTop;
  });
  return true;
}

export function updateTask(id: string, patch: Partial<Task>) {
  setState((d) => {
    const t = d.tasks.find((x) => x.id === id);
    if (t) Object.assign(t, patch);
  });
}

export function deleteTask(id: string) {
  setState((d) => {
    d.tasks = d.tasks.filter((t) => t.id !== id);
  });
}

export function topThree(state: { tasks: Task[] }, date = todayISO()): Task[] {
  return state.tasks.filter((t) => t.date === date && t.isTop).slice(0, 3);
}
