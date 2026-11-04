import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, PageHeader, Card, SectionTitle, Empty } from "@/components/app/bits";
import { useAppState } from "@/lib/store";
import { addTask, toggleTask, setTaskTop, deleteTask, topThree } from "@/lib/tasks";
import { todayISO } from "@/lib/dates";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/tasks")({
  head: () => appHead("Tasks — Discipline Habit Builder", "Today's tasks and your top-3 priorities."),
  component: Tasks,
});

function Tasks() {
  const state = useAppState();
  const today = todayISO();
  const [title, setTitle] = useState("");
  const todays = state.tasks.filter((t) => t.date === today);
  const tops = topThree(state, today);
  const others = todays.filter((t) => !tops.includes(t));

  function add() {
    if (!title.trim()) return;
    addTask(title.trim(), today);
    setTitle("");
  }

  function makeTop(id: string) {
    const ok = setTaskTop(id, true);
    if (!ok) alert("You already have three top priorities for today.");
  }

  return (
    <Page>
      <PageHeader title="Tasks" subtitle="Choose what actually matters today" />

      <Card>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a task for today…"
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <button type="button" onClick={add} className="press rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Add</button>
        </div>
      </Card>

      <SectionTitle>Top 3 priorities</SectionTitle>
      {tops.length === 0 ? (
        <Empty icon="⭐" title="No priorities yet" hint="Tap the star on a task to make it one of today's top three." />
      ) : (
        <div className="space-y-2">
          {tops.map((t, i) => (
            <Card key={t.id}>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold text-gold">{i + 1}</span>
                <button type="button" onClick={() => toggleTask(t.id)} className={"min-w-0 flex-1 text-left text-sm " + (t.done ? "text-muted-foreground line-through" : "text-foreground")}>
                  {t.title}
                </button>
                <button type="button" onClick={() => setTaskTop(t.id, false)} aria-label="Remove from top priorities" className="text-xs text-muted-foreground hover:text-foreground">☆</button>
                <button type="button" onClick={() => deleteTask(t.id)} aria-label="Delete task" className="text-xs text-muted-foreground hover:text-destructive">✕</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle>Other tasks today</SectionTitle>
      {others.length === 0 ? (
        <Empty icon="✅" title="Nothing else" hint="Add tasks above, or enjoy the emptiness." />
      ) : (
        <div className="space-y-2">
          {others.map((t) => (
            <Card key={t.id}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleTask(t.id)}
                  className={"press flex size-7 items-center justify-center rounded-full text-xs " + (t.done ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground")}
                  aria-label={t.done ? "Mark incomplete" : "Mark done"}
                >
                  {t.done ? "✓" : ""}
                </button>
                <span className={"min-w-0 flex-1 text-sm " + (t.done ? "text-muted-foreground line-through" : "text-foreground")}>{t.title}</span>
                {!t.done && (
                  <button type="button" onClick={() => makeTop(t.id)} aria-label="Make top priority" className="text-lg text-muted-foreground hover:text-gold">☆</button>
                )}
                <button type="button" onClick={() => deleteTask(t.id)} aria-label="Delete task" className="text-xs text-muted-foreground hover:text-destructive">✕</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
