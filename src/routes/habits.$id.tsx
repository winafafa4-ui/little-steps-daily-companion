import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Archive, Trash2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { bestStreak, completionRate, currentStreak, deleteHabit, isDone, isDueOn, setHabitProgress, targetValue, totalCompletions, archiveHabit } from "@/lib/habits";
import { lastNDates, todayISO, fmtShort } from "@/lib/dates";
import { Bars, Heatmap, Page, PageHeader, PrimaryButton, GhostButton, Stat } from "@/components/app/bits";
import { HabitForm } from "@/components/app/habit-form";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/habits/$id")({
  head: () => appHead("Habit details — Discipline Habit Builder", "Streaks, completion rates and history for one habit."),
  component: HabitDetail,
});

function HabitDetail() {
  const { id } = Route.useParams();
  const state = useAppState();
  const habit = state.habits.find((h) => h.id === id);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (!habit) throw notFound();

  const today = todayISO();
  const log = state.habitLogs[habit.id];
  const dates = lastNDates(63);
  const bars14 = lastNDates(14);
  const count = log?.[today] ?? 0;
  const target = targetValue(habit);

  return (
    <Page>
      <PageHeader
        title={`${habit.icon} ${habit.name}`}
        subtitle={habit.description || habit.ifThenPlan || "Keep showing up — that's the whole game."}
        back
      />

      {habit.target.type === "count" && !habit.archived && (
        <div className="mb-4 flex items-center justify-center gap-3">
          <button type="button" onClick={() => setHabitProgress(habit.id, today, count - 1)} className="press flex size-11 items-center justify-center rounded-full border border-border text-xl text-muted-foreground" aria-label="Decrease">−</button>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-foreground">{count}/{target}</div>
            <div className="text-xs text-muted-foreground">{habit.target.unit} today</div>
          </div>
          <button type="button" onClick={() => setHabitProgress(habit.id, today, count + 1)} className="press flex size-11 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground" aria-label="Increase">+</button>
        </div>
      )}

      <div className="flex gap-2">
        <Stat label="Current streak" value={`${currentStreak(habit, log)} d`} />
        <Stat label="Best streak" value={`${bestStreak(habit, log)} d`} />
      </div>
      <div className="mt-2 flex gap-2">
        <Stat label="30-day rate" value={`${Math.round(completionRate(habit, log, 30) * 100)}%`} />
        <Stat label="Total done" value={totalCompletions(habit, log)} />
      </div>

      <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Last 9 weeks</h2>
      <div className="card-soft overflow-x-auto p-4">
        <Heatmap
          dates={dates}
          valueFor={(d) => (isDueOn(habit, d) ? (isDone(habit, log, d) ? 1 : 0) : 0)}
        />
      </div>

      <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Progress — last 14 days</h2>
      <div className="card-soft p-4">
        <Bars dates={bars14} values={bars14.map((d) => Math.min(log?.[d] ?? 0, target))} height={80} />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{fmtShort(bars14[0] ?? today)}</span>
          <span>{fmtShort(today)}</span>
        </div>
      </div>

      {habit.ifThenPlan && (
        <div className="card-soft mt-4 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">If-then plan</div>
          <p className="mt-1 text-sm text-foreground">{habit.ifThenPlan}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <PrimaryButton onClick={() => setEditing((v) => !v)}>{editing ? "Close editor" : "Edit habit"}</PrimaryButton>
        <GhostButton onClick={() => { archiveHabit(habit.id, true); }}>
          <span className="flex items-center gap-1.5"><Archive className="size-4" /> Archive</span>
        </GhostButton>
        {confirming ? (
          <GhostButton className="!border-destructive/50 !text-destructive" onClick={() => { deleteHabit(habit.id); history.back(); }}>
            <span className="flex items-center gap-1.5"><Trash2 className="size-4" /> Really delete — all history lost</span>
          </GhostButton>
        ) : (
          <GhostButton className="!text-destructive" onClick={() => setConfirming(true)}>
            <span className="flex items-center gap-1.5"><Trash2 className="size-4" /> Delete</span>
          </GhostButton>
        )}
      </div>

      {editing && (
        <div className="mt-4">
          <HabitForm initial={habit} onDone={() => setEditing(false)} />
        </div>
      )}
    </Page>
  );
}
