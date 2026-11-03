import { useAppState } from "@/lib/store";
import { habitsDueOn, isDone, toggleHabit, currentStreak } from "@/lib/habits";
import { todayISO } from "@/lib/dates";
import { Card, Empty, Page, PageHeader } from "@/components/app/bits";
import { appHead } from "@/lib/head";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/habits")({
  head: () => appHead("Habits — Discipline Habit Builder", "Track your habits, streaks and daily progress."),
  component: Habits,
});

function Habits() {
  const state = useAppState();
  const today = todayISO();
  const active = state.habits.filter((h) => !h.archived);
  const due = habitsDueOn(state, today);

  return (
    <Page>
      <PageHeader
        title="Habits"
        subtitle={`${active.length} active · ${due.filter((h) => isDone(h, state.habitLogs[h.id], today)).length}/${due.length} done today`}
      />
      {active.length === 0 ? (
        <Empty icon="🌱" title="No habits yet" hint="Your habits will appear here. You can add some during onboarding." />
      ) : (
        <div className="space-y-2">
          {active.map((h) => {
            const done = isDone(h, state.habitLogs[h.id], today);
            const count = state.habitLogs[h.id]?.[today] ?? 0;
            const target = h.target.type === "count" ? h.target.value : 1;
            return (
              <Card key={h.id}>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-xl">{h.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{h.name}</div>
                    <div className="text-xs text-muted-foreground">
                      🔥 {currentStreak(h, state.habitLogs[h.id])} day streak
                      {h.target.type === "count" ? ` · ${count}/${target} ${h.target.unit}` : ""}
                    </div>
                  </div>
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
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Habit builder and detailed tracking arrive with the next build step.
      </p>
      <div className="mt-2 text-center">
        <Link to="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </Page>
  );
}
