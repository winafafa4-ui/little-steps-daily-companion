import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CATEGORY_META, Empty, Field, GhostButton, inputCls, Page, PageHeader, PrimaryButton, SectionTitle } from "@/components/app/bits";
import { appHead } from "@/lib/head";
import { addMilestone, createGoal, deleteGoal, goalHorizonLabel, goalProgress, toggleMilestone } from "@/lib/goals";
import type { DisciplineCategory, Goal } from "@/lib/model";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/goals")({
  head: () => appHead("Goals — Discipline Habit Builder", "Plan meaningful yearly, monthly and weekly goals with milestones."),
  component: Goals,
});

function Goals() {
  const state = useAppState();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [horizon, setHorizon] = useState<Goal["horizon"]>("monthly");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<DisciplineCategory | "">("");
  const [milestoneText, setMilestoneText] = useState("");
  const [notes, setNotes] = useState("");
  const [milestoneDraft, setMilestoneDraft] = useState<Record<string, string>>({});
  const active = state.goals.filter((goal) => !goal.completedAt);
  const completed = state.goals.filter((goal) => Boolean(goal.completedAt));

  function submit() {
    if (!title.trim()) return;
    createGoal({
      title: title.trim(),
      horizon,
      deadline: deadline || null,
      category: category || null,
      habitIds: [],
      milestones: milestoneText.split("\n").map((item) => item.trim()).filter(Boolean).map((text) => ({ title: text, done: false })),
      notes: notes.trim(),
    });
    setTitle(""); setDeadline(""); setCategory(""); setMilestoneText(""); setNotes(""); setCreating(false);
  }

  return (
    <Page>
      <PageHeader title="Goals" subtitle={`${active.length} in progress · ${completed.length} achieved`} action={<PrimaryButton onClick={() => setCreating((open) => !open)} className="mt-1 !px-3 !py-2">{creating ? "Close" : "New"}</PrimaryButton>} />
      {creating && <Card className="mb-5 space-y-3">
        <Field label="What do you want to accomplish?"><input value={title} onChange={(event) => setTitle(event.target.value)} className={inputCls} placeholder="A specific, meaningful outcome" /></Field>
        <Field label="Time horizon"><select value={horizon} onChange={(event) => setHorizon(event.target.value as Goal["horizon"])} className={inputCls}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></Field>
        <Field label="Target date (optional)"><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className={inputCls} /></Field>
        <Field label="Area of life (optional)"><select value={category} onChange={(event) => setCategory(event.target.value as DisciplineCategory | "")} className={inputCls}><option value="">Choose an area</option>{Object.entries(CATEGORY_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select></Field>
        <Field label="Milestones (one per line)"><textarea rows={3} value={milestoneText} onChange={(event) => setMilestoneText(event.target.value)} className={inputCls + " resize-y"} placeholder="First concrete step\nNext checkpoint" /></Field>
        <Field label="Notes"><textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className={inputCls + " resize-y"} /></Field>
        <PrimaryButton disabled={!title.trim()} onClick={submit}>Create goal</PrimaryButton>
      </Card>}
      <SectionTitle>In progress</SectionTitle>
      {active.length === 0 ? <Empty icon="🧭" title="No goals yet" hint="Choose a clear outcome and break it into milestones you can act on." /> : <div className="space-y-3">
        {active.map((goal) => <Card key={goal.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><h2 className="font-semibold text-foreground">{goal.title}</h2><p className="mt-0.5 text-xs text-muted-foreground">{goalHorizonLabel(goal.horizon)}{goal.deadline ? ` · Due ${goal.deadline}` : ""}{goal.category ? ` · ${CATEGORY_META[goal.category]?.label ?? goal.category}` : ""}</p></div>
            <GhostButton onClick={() => deleteGoal(goal.id)} className="shrink-0 !px-2 !py-1.5">Remove</GhostButton>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(goalProgress(goal) * 100)}%` }} /></div>
          <p className="mt-1 text-right text-xs text-muted-foreground">{Math.round(goalProgress(goal) * 100)}%</p>
          <div className="mt-2 space-y-2">
            {goal.milestones.map((milestone) => <label key={milestone.id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={milestone.done} onChange={() => toggleMilestone(goal.id, milestone.id)} className="mt-1 accent-[var(--color-primary)]" />
              <span className={milestone.done ? "text-muted-foreground line-through" : "text-foreground"}>{milestone.title}</span>
            </label>)}
          </div>
          <div className="mt-3 flex gap-2"><input value={milestoneDraft[goal.id] ?? ""} onChange={(event) => setMilestoneDraft((current) => ({ ...current, [goal.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter" && milestoneDraft[goal.id]?.trim()) { addMilestone(goal.id, milestoneDraft[goal.id]); setMilestoneDraft((current) => ({ ...current, [goal.id]: "" })); } }} className={inputCls} placeholder="Add a milestone" /><PrimaryButton onClick={() => { const text = milestoneDraft[goal.id] ?? ""; if (text.trim()) addMilestone(goal.id, text); setMilestoneDraft((current) => ({ ...current, [goal.id]: "" })); }}>Add</PrimaryButton></div>
          {goal.notes && <p className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-xs text-muted-foreground">{goal.notes}</p>}
        </Card>)}
      </div>}
      {completed.length > 0 && <><SectionTitle>Achieved</SectionTitle><div className="space-y-2">{completed.map((goal) => <Card key={goal.id}><div className="font-medium text-foreground">✓ {goal.title}</div><div className="text-xs text-muted-foreground">{goalHorizonLabel(goal.horizon)} · Achieved {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : ""}</div></Card>)}</div></>}
    </Page>
  );
}