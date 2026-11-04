import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Card, Chip, CATEGORY_META, Ring } from "@/components/app/bits";
import { useAppState, setState, newId } from "@/lib/store";
import { createHabit } from "@/lib/habits";
import { createRoutine } from "@/lib/routines";
import type { DisciplineCategory, Difficulty, HabitTarget } from "@/lib/model";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/onboarding")({
  head: () => appHead("Get started — Discipline Habit Builder", "Set up your identity, priorities, habits and routines in a few steps."),
  component: Onboarding,
});

const CATEGORIES = Object.keys(CATEGORY_META) as DisciplineCategory[];

const SUGGESTIONS: { name: string; icon: string; category: DisciplineCategory; description: string; target?: HabitTarget }[] = [
  { name: "Morning walk", icon: "🚶", category: "physical", description: "10+ minutes outside before the day starts" },
  { name: "Exercise", icon: "💪", category: "physical", description: "Any deliberate training session" },
  { name: "Read", icon: "📖", category: "mental", description: "Read for at least 10 minutes", target: { type: "count", value: 10, unit: "min" } },
  { name: "Learn something", icon: "🧠", category: "mental", description: "Study or practice a skill" },
  { name: "Plan tomorrow", icon: "🗓️", category: "productivity", description: "Write tomorrow's top 3 before bed" },
  { name: "Deep work block", icon: "⚡", category: "productivity", description: "One focused block on your most important task" },
  { name: "Journal", icon: "📓", category: "emotional", description: "Reflect on the day in the Journal" },
  { name: "Gratitude note", icon: "🙏", category: "emotional", description: "Write one thing you're grateful for" },
  { name: "Tidy one surface", icon: "🧹", category: "lifestyle", description: "Restore order to one small space" },
  { name: "Phone-free morning", icon: "📵", category: "lifestyle", description: "No screens for the first 30 minutes" },
  { name: "Wash dishes tonight", icon: "🍽️", category: "responsibility", description: "Kitchen reset before bed" },
  { name: "Budget check", icon: "💸", category: "responsibility", description: "Two-minute money review" },
];

const STEPS = ["Welcome", "Assessment", "Priorities", "Habits", "Routines", "Reminders"] as const;

function Onboarding() {
  const state = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.profile.name);
  const [identity, setIdentity] = useState(state.profile.identity);
  const [assessment, setAssessment] = useState<Record<string, number>>({});
  const [priorities, setPriorities] = useState<DisciplineCategory[]>(state.profile.priorities);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [morningSteps, setMorningSteps] = useState<{ name: string; minutes: number }[]>([
    { name: "Make the bed", minutes: 3 },
    { name: "Drink a glass of water", minutes: 2 },
  ]);
  const [eveningSteps, setEveningSteps] = useState<{ name: string; minutes: number }[]>([
    { name: "Plan tomorrow's top 3", minutes: 5 },
    { name: "Tidy one surface", minutes: 5 },
  ]);
  const [reminders, setReminders] = useState({ enabled: true, morning: "07:00", evening: "21:30" });
  const [stepDraft, setStepDraft] = useState({ period: "morning" as "morning" | "evening", name: "", minutes: 5 });

  function finish() {
    const now = Date.now();
    setState((d) => {
      d.profile.name = name.trim();
      d.profile.identity = identity.trim();
      d.profile.priorities = priorities;
      d.profile.assessment = assessment;
      d.profile.onboardedAt = now;
      d.profile.reminders = reminders;
      d.timeline.push({
        id: newId(),
        at: now,
        kind: "onboarding",
        title: "Started your discipline journey",
        detail: priorities.length ? `Focus areas: ${priorities.map((c) => CATEGORY_META[c]?.label ?? c).join(", ")}` : "Skipped personalization",
      });
    });
    const pickedNames = Object.keys(picked).filter((k) => picked[k]);
    for (const s of SUGGESTIONS) {
      if (picked[s.name]) {
        createHabit({
          name: s.name,
          icon: s.icon,
          category: s.category,
          description: s.description,
          difficulty,
          target: s.target ?? { type: "check" },
          schedule: { type: "daily" },
        });
      }
    }
    void pickedNames;
    if (morningSteps.length > 0) createRoutine("Morning routine", "morning", morningSteps);
    if (eveningSteps.length > 0) createRoutine("Evening routine", "evening", eveningSteps);
    navigate({ to: "/" });
  }

  function skipAll() {
    setState((d) => {
      d.profile.onboardedAt = Date.now();
    });
    navigate({ to: "/" });
  }

  return (
    <Page>
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </div>
        <button type="button" onClick={skipAll} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Skip setup
        </button>
      </div>
      <div className="mt-2 flex gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className={"h-1 flex-1 rounded-full " + (i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      {step === 0 && (
        <Welcome name={name} setName={setName} identity={identity} setIdentity={setIdentity} next={() => setStep(1)} />
      )}
      {step === 1 && (
        <Assessment values={assessment} setValues={setAssessment} next={() => setStep(2)} back={() => setStep(0)} />
      )}
      {step === 2 && (
        <Priorities
          selected={priorities}
          toggle={(c) =>
            setPriorities((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
          }
          next={() => setStep(3)}
          back={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <PickHabits
          priorities={priorities}
          picked={picked}
          setPicked={setPicked}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          next={() => setStep(4)}
          back={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Routines
          morning={morningSteps}
          evening={eveningSteps}
          remove={(period, idx) =>
            (period === "morning" ? setMorningSteps : setEveningSteps)((prev) => prev.filter((_, i) => i !== idx))
          }
          draft={stepDraft}
          setDraft={setStepDraft}
          add={() => {
            const nm = stepDraft.name.trim();
            if (!nm) return;
            const target = stepDraft.period === "morning" ? setMorningSteps : setEveningSteps;
            target((prev) => [...prev, { name: nm, minutes: Math.max(1, stepDraft.minutes) }]);
            setStepDraft((d) => ({ ...d, name: "" }));
          }}
          next={finish}
          back={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <Reminders
          value={reminders}
          onChange={setReminders}
          next={finish}
          back={() => setStep(4)}
        />
      )}
    </Page>
  );
}

function NavButtons({ next, back, nextLabel = "Continue" }: { next: () => void; back?: () => void; nextLabel?: string }) {
  return (
    <div className="mt-6 flex gap-2">
      {back && (
        <button type="button" onClick={back} className="press rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground">
          Back
        </button>
      )}
      <button type="button" onClick={next} className="press flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        {nextLabel}
      </button>
    </div>
  );
}

function Welcome({ name, setName, identity, setIdentity, next }: { name: string; setName: (v: string) => void; identity: string; setIdentity: (v: string) => void; next: () => void }) {
  return (
    <div>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground">Build the discipline you'll thank yourself for</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Habits, routines, challenges and reflection — all stored on your device. Nothing leaves it.
      </p>
      <Card className="mt-4">
        <label className="text-sm font-medium text-foreground" htmlFor="ob-name">What should we call you?</label>
        <input
          id="ob-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        />
        <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="ob-identity">Your identity statement</label>
        <p className="text-xs text-muted-foreground">Finish the sentence: "I am the kind of person who…"</p>
        <input
          id="ob-identity"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder="…shows up even when it's hard"
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        />
      </Card>
      <NavButtons next={next} />
    </div>
  );
}

function Assessment({ values, setValues, next, back }: { values: Record<string, number>; setValues: (v: Record<string, number>) => void; next: () => void; back: () => void }) {
  return (
    <div>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">Where do you stand today?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Rate yourself honestly, 1–10. This is your starting point — it never gets shown to anyone.</p>
      <div className="mt-4 space-y-2">
        {CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c]!;
          const v = values[c] ?? 5;
          return (
            <Card key={c}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{meta.icon}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{meta.label}</span>
                <span className="font-display text-lg font-semibold text-primary">{v}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={v}
                onChange={(e) => setValues({ ...values, [c]: Number(e.target.value) })}
                className="mt-2 w-full accent-[var(--color-primary)]"
                aria-label={`Rate your ${meta.label} discipline`}
              />
            </Card>
          );
        })}
      </div>
      <NavButtons next={next} back={back} />
    </div>
  );
}

function Priorities({ selected, toggle, next, back }: { selected: DisciplineCategory[]; toggle: (c: DisciplineCategory) => void; next: () => void; back: () => void }) {
  return (
    <div>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">Pick your focus areas</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose up to six. Your dashboard will lean toward these.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c]!;
          const active = selected.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={
                "press flex flex-col items-start gap-1 rounded-2xl border p-4 text-left " +
                (active ? "border-primary bg-primary/10" : "border-border bg-card")
              }
            >
              <span className="text-2xl">{meta.icon}</span>
              <span className={"text-sm font-medium " + (active ? "text-primary" : "text-foreground")}>{meta.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{selected.length} selected</p>
      <NavButtons next={next} back={back} />
    </div>
  );
}

function PickHabits({
  priorities,
  picked,
  setPicked,
  difficulty,
  setDifficulty,
  next,
  back,
}: {
  priorities: DisciplineCategory[];
  picked: Record<string, boolean>;
  setPicked: (v: Record<string, boolean>) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  next: () => void;
  back: () => void;
}) {
  const sorted = [...SUGGESTIONS].sort((a, b) => {
    const ap = priorities.includes(a.category) ? 0 : 1;
    const bp = priorities.includes(b.category) ? 0 : 1;
    return ap - bp;
  });
  const count = Object.values(picked).filter(Boolean).length;
  return (
    <div>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">Choose starter habits</h1>
      <p className="mt-2 text-sm text-muted-foreground">Pick a few to begin with — you can add, edit or remove habits any time. Small and consistent beats big and broken.</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Effort level</span>
        {(["minimum", "standard", "advanced"] as Difficulty[]).map((d) => (
          <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
            {d === "minimum" ? "Minimum" : d === "standard" ? "Standard" : "Advanced"}
          </Chip>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {sorted.map((s) => {
          const active = picked[s.name];
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => setPicked({ ...picked, [s.name]: !active })}
              className={
                "press flex w-full items-center gap-3 rounded-2xl border p-3 text-left " +
                (active ? "border-primary bg-primary/10" : "border-border bg-card")
              }
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-lg">{s.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{s.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{s.description} · {CATEGORY_META[s.category]?.label}</span>
              </span>
              <span className={"flex size-6 items-center justify-center rounded-full text-xs " + (active ? "bg-primary text-primary-foreground" : "border border-border")}>
                {active ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <NavButtons next={next} back={back} nextLabel={count === 0 ? "Skip habits" : `Add ${count} habit${count > 1 ? "s" : ""}`} />
    </div>
  );
}

function Routines({
  morning,
  evening,
  remove,
  draft,
  setDraft,
  add,
  next,
  back,
}: {
  morning: { name: string; minutes: number }[];
  evening: { name: string; minutes: number }[];
  remove: (period: "morning" | "evening", idx: number) => void;
  draft: { period: "morning" | "evening"; name: string; minutes: number };
  setDraft: (v: { period: "morning" | "evening"; name: string; minutes: number }) => void;
  add: () => void;
  next: () => void;
  back: () => void;
}) {
  const list = draft.period === "morning" ? morning : evening;
  return (
    <div>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">Design two anchor routines</h1>
      <p className="mt-2 text-sm text-muted-foreground">A short morning and evening routine carry the rest of the day. Edit freely — defaults are only suggestions.</p>
      <div className="mt-4 flex gap-2">
        <Chip active={draft.period === "morning"} onClick={() => setDraft({ ...draft, period: "morning" })}>🌅 Morning</Chip>
        <Chip active={draft.period === "evening"} onClick={() => setDraft({ ...draft, period: "evening" })}>🌙 Evening</Chip>
      </div>
      <Card className="mt-3">
        <div className="space-y-2">
          {list.length === 0 && <p className="text-xs text-muted-foreground">No steps yet — add the first one below.</p>}
          {list.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl bg-background px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{s.name}</span>
              <span className="text-xs text-muted-foreground">{s.minutes} min</span>
              <button type="button" onClick={() => remove(draft.period, i)} className="text-xs text-muted-foreground hover:text-destructive" aria-label={`Remove step ${s.name}`}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="New step"
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="number"
            min={1}
            max={180}
            value={draft.minutes}
            onChange={(e) => setDraft({ ...draft, minutes: Number(e.target.value) })}
            className="w-16 rounded-xl border border-border bg-background px-2 py-2 text-center text-sm text-foreground outline-none focus:border-primary"
            aria-label="Minutes"
          />
          <button type="button" onClick={add} className="press rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Add</button>
        </div>
      </Card>
      <NavButtons next={next} back={back} nextLabel="Finish setup" />
    </div>
  );
}

function Reminders({ value, onChange, next, back }: { value: { enabled: boolean; morning: string; evening: string }; onChange: (v: { enabled: boolean; morning: string; evening: string }) => void; next: () => void; back: () => void }) {
  return (
    <div>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">Gentle nudges</h1>
      <p className="mt-2 text-sm text-muted-foreground">We store your preferred reminder times with the app. On a phone build these become real notifications.</p>
      <Card className="mt-4 space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Enable reminders</span>
          <input type="checkbox" checked={value.enabled} onChange={(e) => onChange({ ...value, enabled: e.target.checked })} className="size-5 accent-[var(--color-primary)]" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Morning check-in</span>
          <input type="time" value={value.morning} onChange={(e) => onChange({ ...value, morning: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Evening reflection</span>
          <input type="time" value={value.evening} onChange={(e) => onChange({ ...value, evening: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
        </label>
      </Card>
      <NavButtons next={next} back={back} nextLabel="Start my journey" />
    </div>
  );
}
