import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, Page, Ring } from "@/components/app/bits";
import { useAppState } from "@/lib/store";
import { dailyScore, levelFor } from "@/lib/gamify";
import { habitsDueOn, isDone, toggleHabit } from "@/lib/habits";
import { greeting, todayISO, fmtLong } from "@/lib/dates";
import { topThree, toggleTask } from "@/lib/tasks";
import { wisdomForToday } from "@/content/wisdom";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/")({
  head: () => appHead("Discipline Habit Builder", "Build discipline with habits, routines, challenges and reflection — fully offline."),
  component: Home,
});

function Home() {
  const state = useAppState();
  const today = todayISO();
  const [dayGreeting, setDayGreeting] = useState("Welcome back");
  useEffect(() => setDayGreeting(greeting()), []);
  const lvl = levelFor(state.xp);
  const due = habitsDueOn(state, today);
  const doneToday = due.filter((h) => isDone(h, state.habitLogs[h.id], today));
  const dayScore = useMemo(() => dailyScore(state, today), [state, today]);
  const wisdom = wisdomForToday();
  const tasks = topThree(state, today);

  return (
    <Page>
      {/* Greeting + level */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <p className="text-sm text-muted-foreground">{fmtLong(today)}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {dayGreeting}
            {state.profile.name ? `, ${state.profile.name}` : ""}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Ring value={lvl.progress} size={56} stroke={5}>
            <span className="font-display text-[11px] font-semibold text-foreground">{state.xp} XP</span>
          </Ring>
        </div>
      </div>

      {/* Daily score */}
      <Card className="mt-4">
        <div className="flex items-center gap-4">
          <Ring value={dayScore / 100} size={72} stroke={7} color="var(--color-gold)">
            <span className="font-display text-base font-bold text-foreground">{dayScore}</span>
          </Ring>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground">Today's discipline score</div>
            <p className="text-xs text-muted-foreground">
              {due.length === 0
                ? "Add habits to start scoring your days."
                : `${doneToday.length} of ${due.length} habits done · present is enough, perfect is not required.`}
            </p>
          </div>
        </div>
      </Card>

      {/* Habits due today */}
      <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Habits today</h2>
      {due.length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">
          No habits yet. Add your first habit or personalize your setup from Settings.
        </Card>
      ) : (
        <div className="space-y-2">
          {due.map((h) => {
            const done = isDone(h, state.habitLogs[h.id], today);
            return (
              <Card key={h.id} onClick={() => toggleHabit(h.id, today)}>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-lg">{h.icon}</div>
                  <div className="min-w-0 flex-1 truncate font-medium text-foreground">{h.name}</div>
                  <span
                    className={
                      "flex size-8 items-center justify-center rounded-full text-sm " +
                      (done ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground")
                    }
                  >
                    {done ? "✓" : ""}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Top 3 tasks */}
      <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top priorities</h2>
      {tasks.length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">Pick up to three things that must happen today.</Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <Card key={t.id} onClick={() => toggleTask(t.id)}>
              <div className="flex items-center gap-3">
                <span className={t.done ? "text-primary" : "text-muted-foreground"}>{t.done ? "●" : "○"}</span>
                <span className={"min-w-0 flex-1 truncate " + (t.done ? "text-muted-foreground line-through" : "text-foreground")}>
                  {t.title}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Daily wisdom */}
      <Card className="mt-6 border-primary/20 bg-secondary/50">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">Daily wisdom</div>
        <p className="mt-2 font-display text-lg leading-snug text-foreground">“{wisdom.text}”</p>
        <p className="mt-1 text-xs text-muted-foreground">— {wisdom.source}</p>
      </Card>
    </Page>
  );
}
