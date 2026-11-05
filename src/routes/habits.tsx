import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, RotateCcw } from "lucide-react";
import { useAppState } from "@/lib/store";
import { habitsDueOn, isDone, toggleHabit, currentStreak, setHabitProgress, targetValue, archiveHabit } from "@/lib/habits";
import { todayISO } from "@/lib/dates";
import { Card, Empty, Page, PageHeader, PrimaryButton } from "@/components/app/bits";
import { HabitForm } from "@/components/app/habit-form";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/habits")({
  head: () => appHead("Habits — Discipline Habit Builder", "Track your habits, streaks and daily progress."),
  component: Habits,
});

function Habits() {
  const state = useAppState();
  const today = todayISO();
  const [creating, setCreating] = useState(false);
  const active = state.habits.filter((h) => !h.archived);
  const archived = state.habits.filter((h) => h.archived);
  const due = habitsDueOn(state, today);
  const notDueToday = active.filter((h) => !due.some((d) => d.id === h.id));

  const bump = (id: string, dir: 1 | -1) => {
    const habit = state.habits.find((h) => h.id === id);
    if (!habit || habit.target.type !== "count") return;
    setHabitProgress(id, today, (state.habitLogs[id]?.[today] ?? 0) + dir);
  };

  return (
    <Page>
      <PageHeader
        title="Habits"
        subtitle={`${active.length} active · ${due.filter((h) => isDone(h, state.habitLogs[h.id], today)).length}/${due.length} done today`}
        action={
          <PrimaryButton onClick={() => setCreating((v) => !v)} className="mt-1 flex items-center gap-1 !px-3 !py-2">
            <Plus className="size-4" /> Add
          </PrimaryButton>
        }
      />

      {creating && (
        <div className="mb-5">
          <HabitForm onDone={() => setCreating(false)} />
        </div>
      )}

      {active.length === 0 ? (
        <Empty icon="🌱" title="No habits yet" hint="Start small — pick one thing you can repeat most days. Consistency beats intensity." />
      ) : (
        <div className="space-y-2">
          {due.map((h) => {
            const done = isDone(h, state.habitLogs[h.id], today);
            const count = state.habitLogs[h.id]?.[today] ?? 0;
            const target = targetValue(h);
            return (
              <Card key={h.id} className="!p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-xl">{h.icon}</div>
                  <Link to="/habits/$id" params={{ id: h.id }} className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{h.name}</div>
                    <div className="text-xs text-muted-foreground">🔥 {currentStreak(h, state.habitLogs[h.id])} day streak</div>
                  </Link>
                  {h.target.type === "count" ? (
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => bump(h.id, -1)} className="press flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground" aria-label="Decrease">−</button>
                      <span className="w-16 text-center text-xs font-semibold text-foreground">{count}/{target} {h.target.unit}</span>
                      <button type="button" onClick={() => bump(h.id, 1)} className="press flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground" aria-label="Increase">+</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleHabit(h.id, today)}
                      className={
                        "press flex size-10 items-center justify-center rounded-full text-lg " +
                        (done ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground")
                      }
                      aria-label={done ? `Mark ${h.name} incomplete` : `Complete ${h.name}`}
                    >
                      {done ? "✓" : "○"}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
          {notDueToday.map((h) => (
            <Card key={h.id} className="opacity-60">
              <Link to="/habits/$id" params={{ id: h.id }} className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-xl">{h.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{h.name}</div>
                  <div className="text-xs text-muted-foreground">Not scheduled today</div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <>
          <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Archived</h2>
          <div className="space-y-2">
            {archived.map((h) => (
              <Card key={h.id} className="!p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-lg">{h.icon}</div>
                  <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{h.name}</div>
                  <button
                    type="button"
                    onClick={() => archiveHabit(h.id, false)}
                    className="press flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground"
                    aria-label={`Restore ${h.name}`}
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
