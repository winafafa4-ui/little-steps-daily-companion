import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Check, Trash2 } from "lucide-react";
import { Card, GhostButton, Page, PageHeader, PrimaryButton } from "@/components/app/bits";
import { appHead } from "@/lib/head";
import { reorderSteps, toggleStep, completeAllSteps, deleteRoutine } from "@/lib/routines";
import { useAppState } from "@/lib/store";
import { todayISO } from "@/lib/dates";

export const Route = createFileRoute("/routines/$id_")({
  head: () => appHead("Routine Mode — Discipline Habit Builder", "Follow your routine one step at a time."),
  component: RoutineMode,
});

function RoutineMode() {
  const { id } = Route.useParams();
  const state = useAppState();
  const routine = state.routines.find((item) => item.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!routine) throw notFound();
  const completed = state.routineLogs[id]?.[todayISO()] ?? [];
  const done = routine.steps.filter((step) => completed.includes(step.id)).length;

  return (
    <Page>
      <PageHeader title={routine.name} subtitle={`${routine.period} routine · ${done}/${routine.steps.length} steps`} back />
      <div className="space-y-2">
        {routine.steps.map((step, index) => {
          const isDone = completed.includes(step.id);
          return (
            <Card key={step.id}>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleStep(id, step.id)} aria-label={isDone ? `Undo ${step.name}` : `Complete ${step.name}`} className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${isDone ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                  {isDone ? <Check className="size-4" /> : <span>{index + 1}</span>}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{step.name}</div>
                  <div className="text-xs text-muted-foreground">{step.minutes} min{step.note ? ` · ${step.note}` : ""}</div>
                </div>
                <div className="flex shrink-0">
                  <button type="button" disabled={index === 0} onClick={() => reorderSteps(id, index, index - 1)} className="press flex size-8 items-center justify-center text-muted-foreground disabled:opacity-30" aria-label={`Move ${step.name} up`}><ArrowUp className="size-4" /></button>
                  <button type="button" disabled={index === routine.steps.length - 1} onClick={() => reorderSteps(id, index, index + 1)} className="press flex size-8 items-center justify-center text-muted-foreground disabled:opacity-30" aria-label={`Move ${step.name} down`}><ArrowDown className="size-4" /></button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {routine.steps.length > 0 && done < routine.steps.length && <PrimaryButton onClick={() => completeAllSteps(id)} className="mt-4 w-full">Complete routine</PrimaryButton>}
      <div className="mt-6">
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2"><span className="mr-auto text-sm text-destructive">Delete this routine and its history?</span><GhostButton onClick={() => setConfirmDelete(false)}>Keep it</GhostButton><GhostButton onClick={() => { deleteRoutine(id); window.history.back(); }}><span className="flex items-center gap-1"><Trash2 className="size-4" /> Delete</span></GhostButton></div>
        ) : <GhostButton onClick={() => setConfirmDelete(true)}><span className="flex items-center gap-1"><Trash2 className="size-4" /> Delete routine</span></GhostButton>}
      </div>
    </Page>
  );
}