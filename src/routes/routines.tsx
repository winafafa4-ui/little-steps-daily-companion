import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { useAppState } from "@/lib/store";
import { createRoutine, deleteRoutine, periodForNow, routineProgress, updateRoutine } from "@/lib/routines";
import { todayISO } from "@/lib/dates";
import type { RoutineStep } from "@/lib/model";
import { Card, Empty, Field, Page, PageHeader, PrimaryButton, Ring, inputCls } from "@/components/app/bits";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/routines")({
  head: () => appHead("Routines — Discipline Habit Builder", "Design morning, afternoon and evening routines."),
  component: Routines,
});

const PERIODS = ["morning", "afternoon", "evening"] as const;

function Routines() {
  const state = useAppState();
  const today = todayISO();
  const [creating, setCreating] = useState(false);
  const now = periodForNow();

  return (
    <Page>
      <PageHeader
        title="Routines"
        subtitle={`It's ${now} — build rituals that run on autopilot`}
        action={
          <PrimaryButton onClick={() => setCreating((v) => !v)} className="mt-1 flex items-center gap-1 !px-3 !py-2">
            <Plus className="size-4" /> New
          </PrimaryButton>
        }
      />

      {creating && <RoutineCreator onDone={() => setCreating(false)} />}

      {state.routines.length === 0 && !creating ? (
        <Empty icon="🌅" title="No routines yet" hint="A routine is just a short list of steps you do in the same order. Start with 2–3 steps." />
      ) : (
        <div className="space-y-4">
          {PERIODS.map((period) => {
            const list = state.routines.filter((r) => r.period === period);
            if (list.length === 0) return null;
            return (
              <div key={period}>
                <h2 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {period === "morning" ? "Morning ☀️" : period === "afternoon" ? "Afternoon 🌤️" : "Evening 🌙"}
                </h2>
                <div className="space-y-2">
                  {list.map((r) => {
                    const p = routineProgress(state, r.id, today);
                    return (
                      <Card key={r.id}>
                        <Link to="/routines/$id" params={{ id: r.id }} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{r.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {r.steps.length} steps · {r.steps.reduce((n, s) => n + s.minutes, 0)} min
                            </div>
                          </div>
                          <Ring value={p} size={44} stroke={5}>
                            <span className="text-[10px] font-bold text-foreground">{Math.round(p * 100)}%</span>
                          </Ring>
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}

function RoutineCreator({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [period, setPeriod] = useState<"morning" | "afternoon" | "evening">(periodForNow());
  const [steps, setSteps] = useState<Omit<RoutineStep, "id">[]>([{ name: "", minutes: 5, note: "" }]);

  const setStep = (i: number, patch: Partial<Omit<RoutineStep, "id">>) =>
    setSteps((s) => s.map((x, xi) => (xi === i ? { ...x, ...patch } : x)));

  const submit = () => {
    if (!name.trim() || steps.every((s) => !s.name.trim())) return;
    createRoutine(name.trim(), period, steps.filter((s) => s.name.trim()));
    onDone();
  };

  return (
    <div className="card-soft mb-5 space-y-4 p-4">
      <Field label="Routine name">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Morning launch" />
      </Field>
      <Field label="When does it happen?">
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={
                "press flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize " +
                (period === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")
              }
            >
              {p}
            </button>
          ))}
        </div>
      </Field>
      <div>
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Steps</span>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="min-w-0 flex-1 space-y-1.5">
                <input value={s.name} onChange={(e) => setStep(i, { name: e.target.value })} className={inputCls} placeholder={`Step ${i + 1}`} />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={s.minutes}
                    onChange={(e) => setStep(i, { minutes: Math.max(0, Number(e.target.value)) })}
                    className={inputCls + " !w-20"}
                    aria-label="Minutes"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>
              <button type="button" onClick={() => setSteps((x) => x.filter((_, xi) => xi !== i))} className="press mt-2 flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground" aria-label="Remove step">
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSteps((s) => [...s, { name: "", minutes: 5, note: "" }])} className="press mt-2 flex items-center gap-1 text-sm font-medium text-primary">
          <Plus className="size-4" /> Add step
        </button>
      </div>
      <div className="flex justify-end">
        <PrimaryButton onClick={submit}>Create routine</PrimaryButton>
      </div>
    </div>
  );
}
