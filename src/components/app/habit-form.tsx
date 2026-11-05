// Habit builder form, shared by the habits list (create) and the habit
// detail page (edit). Fully offline — writes straight to the local store.

import { useState } from "react";
import type { DisciplineCategory, Difficulty, Habit, HabitSchedule, HabitTarget } from "@/lib/model";
import { createHabit, updateHabit } from "@/lib/habits";
import { CATEGORY_META, Chip, Field, GhostButton, PrimaryButton, inputCls } from "./bits";

const CATEGORIES: DisciplineCategory[] = ["physical", "mental", "productivity", "emotional", "lifestyle", "responsibility"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
export const COLOR_VARS = Array.from({ length: 8 }, (_, i) => `var(--p${i + 1})`);

export function colorVar(colorIndex: number): string {
  return COLOR_VARS[Math.max(1, Math.min(8, colorIndex)) - 1] ?? "var(--p1)";
}

export function HabitForm({ initial, onDone }: { initial?: Habit; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "✅");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<DisciplineCategory>(initial?.category ?? "lifestyle");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "standard");
  const [colorIndex, setColorIndex] = useState(initial?.colorIndex ?? 1);
  const [scheduleType, setScheduleType] = useState<HabitSchedule["type"]>(initial?.schedule.type ?? "daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>(initial?.schedule.type === "weekly" ? initial.schedule.days : [1, 2, 3, 4, 5]);
  const [intervalDays, setIntervalDays] = useState(initial?.schedule.type === "custom" ? initial.schedule.intervalDays : 2);
  const [targetType, setTargetType] = useState<HabitTarget["type"]>(initial?.target.type ?? "check");
  const [countValue, setCountValue] = useState(initial?.target.type === "count" ? initial.target.value : 1);
  const [countUnit, setCountUnit] = useState(initial?.target.type === "count" ? initial.target.unit : "times");
  const [ifThenPlan, setIfThenPlan] = useState(initial?.ifThenPlan ?? "");

  const toggleDay = (day: number) =>
    setWeeklyDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day].sort()));

  const submit = () => {
    if (!name.trim()) return;
    const schedule: HabitSchedule =
      scheduleType === "weekly" ? { type: "weekly", days: weeklyDays.length ? weeklyDays : [1, 2, 3, 4, 5] } :
      scheduleType === "custom" ? { type: "custom", intervalDays: Math.max(1, intervalDays) } :
      { type: "daily" };
    const target: HabitTarget =
      targetType === "count" ? { type: "count", value: Math.max(1, countValue), unit: countUnit.trim() || "times" } :
      { type: "check" };
    const payload = {
      name: name.trim(),
      description,
      category,
      icon: icon.trim() || "✅",
      colorIndex,
      schedule,
      target,
      difficulty,
      ifThenPlan,
    };
    if (initial) updateHabit(initial.id, payload);
    else createHabit(payload);
    onDone();
  };

  return (
    <div className="card-soft space-y-4 p-4">
      <div className="flex gap-2">
        <div className="w-16 shrink-0">
          <Field label="Icon">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} className={inputCls + " text-center text-lg"} placeholder="✅" />
          </Field>
        </div>
        <div className="min-w-0 flex-1">
          <Field label="Habit name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Read 10 pages" />
          </Field>
        </div>
      </div>

      <Field label="Category">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_META[c]?.icon} {CATEGORY_META[c]?.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Difficulty (affects XP earned)">
        <div className="flex flex-wrap gap-1.5">
          {(["minimum", "standard", "advanced"] as Difficulty[]).map((d) => (
            <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d === "minimum" ? "Minimum (8 XP)" : d === "standard" ? "Standard (12 XP)" : "Advanced (18 XP)"}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="How often?">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={scheduleType === "daily"} onClick={() => setScheduleType("daily")}>Every day</Chip>
          <Chip active={scheduleType === "weekly"} onClick={() => setScheduleType("weekly")}>Certain days</Chip>
          <Chip active={scheduleType === "custom"} onClick={() => setScheduleType("custom")}>Every N days</Chip>
        </div>
      </Field>
      {scheduleType === "weekly" && (
        <div className="flex gap-1.5">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={
                "press flex size-9 items-center justify-center rounded-full border text-xs font-semibold " +
                (weeklyDays.includes(i) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {scheduleType === "custom" && (
        <Field label="Every how many days?">
          <input type="number" min={1} max={30} value={intervalDays} onChange={(e) => setIntervalDays(Number(e.target.value))} className={inputCls} />
        </Field>
      )}

      <Field label="Goal each time">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={targetType === "check"} onClick={() => setTargetType("check")}>Simple check-off</Chip>
          <Chip active={targetType === "count"} onClick={() => setTargetType("count")}>Count target</Chip>
        </div>
      </Field>
      {targetType === "count" && (
        <div className="flex gap-2">
          <div className="w-24">
            <Field label="Amount">
              <input type="number" min={1} value={countValue} onChange={(e) => setCountValue(Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <div className="min-w-0 flex-1">
            <Field label="Unit">
              <input value={countUnit} onChange={(e) => setCountUnit(e.target.value)} className={inputCls} placeholder="pages, glasses, minutes…" />
            </Field>
          </div>
        </div>
      )}

      <Field label="If-then plan (optional)">
        <input value={ifThenPlan} onChange={(e) => setIfThenPlan(e.target.value)} className={inputCls} placeholder="If it's 7am, then I read at the kitchen table" />
      </Field>

      <Field label="Description (optional)">
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="Why does this matter to you?" />
      </Field>

      <Field label="Color">
        <div className="flex gap-2">
          {COLOR_VARS.map((v, i) => (
            <button
              key={v}
              type="button"
              aria-label={`Color ${i + 1}`}
              onClick={() => setColorIndex(i + 1)}
              className={"press size-7 rounded-full " + (colorIndex === i + 1 ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-card" : "")}
              style={{ background: v }}
            />
          ))}
        </div>
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <GhostButton onClick={onDone}>Cancel</GhostButton>
        <PrimaryButton onClick={submit} disabled={!name.trim()}>
          {initial ? "Save changes" : "Create habit"}
        </PrimaryButton>
      </div>
    </div>
  );
}
