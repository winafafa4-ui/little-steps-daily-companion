import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Empty, Field, GhostButton, inputCls, Page, PageHeader, PrimaryButton, SectionTitle, Stat } from "@/components/app/bits";
import { appHead } from "@/lib/head";
import { badHabitStats, COMMON_BAD_HABITS, createBadHabit, deleteBadHabit, logUrge, topTriggers } from "@/lib/badhabits";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/bad-habits")({
  head: () => appHead("Bad Habit Breaker — Discipline Habit Builder", "Notice triggers, record urges without judgment, and choose an alternative response."),
  component: BadHabits,
});

function BadHabits() {
  const state = useAppState();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [triggers, setTriggers] = useState("");
  const [alternative, setAlternative] = useState("");
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  function addHabit(habitName = name, habitTriggers = triggers, habitAlternative = alternative) {
    if (!habitName.trim()) return;
    createBadHabit({ name: habitName.trim(), triggers: habitTriggers.split(",").map((item) => item.trim()).filter(Boolean), alternative: habitAlternative.trim() });
    setName(""); setTriggers(""); setAlternative(""); setCreating(false);
  }

  return (
    <Page>
      <PageHeader title="Bad Habit Breaker" subtitle="A lapse is information, not a verdict" action={<PrimaryButton onClick={() => setCreating((open) => !open)} className="mt-1 !px-3 !py-2">{creating ? "Close" : "Add"}</PrimaryButton>} />
      {creating && <Card className="mb-5 space-y-3">
        <Field label="Behavior you want to change"><input value={name} onChange={(event) => setName(event.target.value)} className={inputCls} placeholder="e.g. Late-night scrolling" /></Field>
        <Field label="Common triggers (comma separated)"><input value={triggers} onChange={(event) => setTriggers(event.target.value)} className={inputCls} placeholder="Boredom, stress, phone nearby" /></Field>
        <Field label="A helpful alternative"><input value={alternative} onChange={(event) => setAlternative(event.target.value)} className={inputCls} placeholder="What could you try instead?" /></Field>
        <PrimaryButton onClick={() => addHabit()} disabled={!name.trim()}>Track this behavior</PrimaryButton>
      </Card>}
      {state.badHabits.length === 0 && <>
        <Empty icon="🛡️" title="No behaviors tracked" hint="Start with a template or describe a pattern you want to understand." />
        <SectionTitle>Common starting points</SectionTitle>
        <div className="space-y-2">{COMMON_BAD_HABITS.map((example) => <Card key={example.name}>
          <div className="flex items-center gap-3"><div className="min-w-0 flex-1"><div className="font-medium text-foreground">{example.name}</div><div className="text-xs text-muted-foreground">Alternative: {example.alternative}</div></div><PrimaryButton onClick={() => addHabit(example.name, example.triggers.join(", "), example.alternative)}>Track</PrimaryButton></div>
        </Card>)}</div>
      </>}
      {state.badHabits.length > 0 && <div className="space-y-3">
        {state.badHabits.map((habit) => {
          const stats = badHabitStats(habit);
          const triggersRanked = topTriggers(habit);
          const level = levels[habit.id] ?? 3;
          return <Card key={habit.id}>
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-semibold text-foreground">{habit.name}</h2><p className="mt-1 text-xs text-muted-foreground">{habit.triggers.length ? `Watch for: ${habit.triggers.join(" · ")}` : "No triggers added yet"}</p></div><GhostButton onClick={() => deleteBadHabit(habit.id)} className="shrink-0 !px-2 !py-1.5">Remove</GhostButton></div>
            <div className="mt-3 flex gap-2"><Stat label="Urges (30d)" value={stats.urges} /><Stat label="Resisted" value={stats.resisted} /><Stat label="Clean streak" value={`${stats.cleanStreak}d`} /></div>
            {triggersRanked.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Frequent trigger notes: {triggersRanked.map((entry) => `${entry.trigger} (${entry.count})`).join(" · ")}</p>}
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-sm font-medium text-foreground">Notice an urge?</p>
              <label className="mt-2 block text-xs text-muted-foreground">Intensity · {level} of 5<input type="range" min={1} max={5} value={level} onChange={(event) => setLevels((current) => ({ ...current, [habit.id]: Number(event.target.value) }))} className="mt-1 w-full accent-[var(--color-primary)]" /></label>
              <input value={notes[habit.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [habit.id]: event.target.value }))} className={inputCls + " mt-2"} placeholder="What was happening just before?" />
              <p className="mt-2 text-xs text-muted-foreground">Alternative: {habit.alternative || "Pause, notice the urge, then choose your next action."}</p>
              <div className="mt-3 grid grid-cols-2 gap-2"><PrimaryButton onClick={() => logUrge(habit.id, level, true, notes[habit.id] ?? "")}>I chose my alternative</PrimaryButton><GhostButton onClick={() => logUrge(habit.id, level, false, notes[habit.id] ?? "")}>Log a slip</GhostButton></div>
              <p className="mt-2 text-center text-xs text-muted-foreground">{stats.resistRate ? `${Math.round(stats.resistRate * 100)}% of logged urges resisted` : "Every honest check-in helps reveal your pattern."}</p>
            </div>
          </Card>;
        })}
      </div>}
      {state.badHabits.length > 0 && <SectionTitle>More templates</SectionTitle>}
      {state.badHabits.length > 0 && <div className="flex flex-wrap gap-2">{COMMON_BAD_HABITS.filter((example) => !state.badHabits.some((habit) => habit.name === example.name)).map((example) => <GhostButton key={example.name} onClick={() => addHabit(example.name, example.triggers.join(", "), example.alternative)}>{example.name}</GhostButton>)}</div>}
    </Page>
  );
}