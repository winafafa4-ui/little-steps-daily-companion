import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Page, PageHeader, Card, SectionTitle, Stat, Bars } from "@/components/app/bits";
import { useAppState, setState, newId } from "@/lib/store";
import { lastNDates, todayISO, weekStartISO, weekDates, fmtShort } from "@/lib/dates";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/digital")({
  head: () => appHead("Digital Tracker — Discipline Habit Builder", "Log screen-free time and build intentional phone rules."),
  component: Digital,
});

const ACTIVITIES = ["Walk", "Reading", "Exercise", "Time with people", "Hobby", "Chores", "Rest"];

function Digital() {
  const state = useAppState();
  const today = todayISO();
  const [minutes, setMinutes] = useState(30);
  const [activity, setActivity] = useState(ACTIVITIES[0]!);
  const [custom, setCustom] = useState("");

  const dates14 = useMemo(() => lastNDates(14), []);
  const byDay = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of dates14) out[d] = 0;
    for (const s of state.screenFree) if (s.date in out) out[s.date]! += s.minutes;
    return out;
  }, [state.screenFree, dates14]);

  const week = weekDates(weekStartISO(today));
  const weekTotal = week.reduce((n, d) => n + (state.screenFree.filter((s) => s.date === d).reduce((m, s) => m + s.minutes, 0)), 0);
  const todayTotal = byDay[today] ?? 0;

  function log() {
    const m = Math.max(1, Math.min(24 * 60, minutes));
    const act = (custom.trim() || activity).trim();
    setState((d) => {
      d.screenFree.push({ id: newId(), date: today, minutes: m, activity: act });
    });
    setCustom("");
  }

  function remove(id: string) {
    setState((d) => {
      d.screenFree = d.screenFree.filter((s) => s.id !== id);
    });
  }

  const recent = [...state.screenFree].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);

  return (
    <Page>
      <PageHeader title="Digital Tracker" subtitle="Make your phone a tool, not a default" />

      <div className="flex gap-2">
        <Stat label="Today screen-free" value={`${Math.floor(todayTotal / 60)}h ${todayTotal % 60}m`} />
        <Stat label="This week" value={`${Math.round(weekTotal / 60)}h`} />
      </div>

      <Card className="mt-3">
        <div className="text-sm font-medium text-foreground">Log screen-free time</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setActivity(a)}
              className={"press rounded-full border px-3 py-1.5 text-xs font-medium " + (activity === a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}
            >
              {a}
            </button>
          ))}
        </div>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or name your own activity…"
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <div className="mt-2 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={1440}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-center text-sm text-foreground outline-none focus:border-primary"
            aria-label="Minutes"
          />
          <span className="text-sm text-muted-foreground">minutes</span>
          <button type="button" onClick={log} className="press ml-auto rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Log</button>
        </div>
      </Card>

      <SectionTitle>Screen-free minutes — last 14 days</SectionTitle>
      <Card>
        <Bars dates={dates14} values={dates14.map((d) => byDay[d] ?? 0)} height={80} color="var(--color-p7)" />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{fmtShort(dates14[0]!)}</span>
          <span>{fmtShort(dates14[dates14.length - 1]!)}</span>
        </div>
      </Card>

      <SectionTitle>Phone rules that work</SectionTitle>
      <Card className="text-sm text-muted-foreground">
        <ul className="list-inside list-disc space-y-1.5">
          <li>Charge your phone outside the bedroom at night.</li>
          <li>Turn off every notification that isn't from a real person.</li>
          <li>Decide your checking windows (e.g. after lunch and after dinner) instead of grazing all day.</li>
          <li>Keep one screen-free block daily — even 30 protected minutes counts.</li>
        </ul>
      </Card>

      {recent.length > 0 && (
        <>
          <SectionTitle>Recent logs</SectionTitle>
          <div className="space-y-2">
            {recent.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{s.activity}</div>
                    <div className="text-xs text-muted-foreground">{fmtShort(s.date)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-semibold text-primary">{s.minutes} min</span>
                    <button type="button" onClick={() => remove(s.id)} aria-label="Delete log" className="text-xs text-muted-foreground hover:text-destructive">✕</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
