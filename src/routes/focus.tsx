import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Page, PageHeader, Card, Chip, Stat, SectionTitle, Empty } from "@/components/app/bits";
import { useAppState, snapshot } from "@/lib/store";
import { saveFocusSession, addDistraction, focusMinutesByDay, totalFocusMinutes } from "@/lib/focus";
import { lastNDates, fmtShort } from "@/lib/dates";
import { Bars } from "@/components/app/bits";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/focus")({
  head: () => appHead("Focus — Discipline Habit Builder", "Pomodoro, deep work and Just Start sessions with a distraction log."),
  component: Focus,
});

type Mode = "pomodoro" | "deep" | "just-start";

const MODE_INFO: Record<Mode, { label: string; icon: string; desc: string }> = {
  pomodoro: { label: "Pomodoro", icon: "🍅", desc: "Classic focus/break cycles" },
  deep: { label: "Deep work", icon: "🧠", desc: "One long, uninterrupted block" },
  "just-start": { label: "Just Start", icon: "🚀", desc: "Only 5 minutes — starting is the win" },
};

function Focus() {
  const state = useAppState();
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [deepMinutes, setDeepMinutes] = useState(50);
  const [label, setLabel] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [distraction, setDistraction] = useState("");
  const [showDistractions, setShowDistractions] = useState(false);
  const [breakMode, setBreakMode] = useState(false);
  const startedAtRef = useRef(0);

  const focusMin = state.profile.pomodoro.focusMin || 25;
  const breakMin = state.profile.pomodoro.breakMin || 5;
  const plannedMinutes = mode === "pomodoro" ? focusMin : mode === "deep" ? deepMinutes : 5;

  useEffect(() => {
    if (!running || remaining === null) return;
    if (remaining <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => (r ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  });

  function start() {
    startedAtRef.current = Date.now();
    setRemaining(plannedMinutes * 60);
    setRunning(true);
    setBreakMode(false);
    if (!sessionId) setSessionId(crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  }

  function finish() {
    const elapsedMin = Math.round((Date.now() - startedAtRef.current) / 60000);
    const completed = (remaining ?? 0) <= 0 && !breakMode;
    const minutes = breakMode ? 0 : Math.max(completed ? plannedMinutes : 0, completed ? plannedMinutes : Math.min(elapsedMin, plannedMinutes));
    setRunning(false);
    setRemaining(null);
    if (sessionId && minutes >= 1) {
      saveFocusSession({ type: mode, label: label.trim() || MODE_INFO[mode]!.label, startedAt: startedAtRef.current, minutes, distractions: [] });
    }
    setBreakMode(false);
    setSessionId(null);
  }

  function endEarly() {
    const elapsedMin = Math.round((Date.now() - startedAtRef.current) / 60000);
    const minutes = Math.min(elapsedMin, plannedMinutes);
    setRunning(false);
    setRemaining(null);
    if (sessionId && minutes >= 1) {
      saveFocusSession({ type: mode, label: label.trim() || MODE_INFO[mode]!.label, startedAt: startedAtRef.current, minutes, distractions: [] });
    }
    setSessionId(null);
  }

  function startBreak() {
    setBreakMode(true);
    setRemaining(breakMin * 60);
    setRunning(true);
  }

  function logDistraction() {
    if (sessionId && distraction.trim()) addDistraction(sessionId, distraction.trim());
    setDistraction("");
  }

  const dates = useMemo(() => lastNDates(14), []);
  const minutesByDay = useMemo(() => focusMinutesByDay(state, dates), [state, dates]);
  const recent = [...state.focusSessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 5);
  const mmss = remaining === null ? "" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <Page>
      <PageHeader title="Focus" subtitle={`${Math.round(totalFocusMinutes(state) / 60)}h of tracked focus, lifetime`} />

      {!running && remaining === null && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(MODE_INFO) as Mode[]).map((m) => (
              <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                {MODE_INFO[m]!.icon} {MODE_INFO[m]!.label}
              </Chip>
            ))}
          </div>
          <Card className="mt-3">
            <p className="text-xs text-muted-foreground">{MODE_INFO[mode]!.desc}</p>
            {mode === "pomodoro" && (
              <p className="mt-1 text-sm font-medium text-foreground">{focusMin} min focus · {breakMin} min break</p>
            )}
            {mode === "deep" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {[25, 45, 50, 60, 90].map((n) => (
                  <Chip key={n} active={deepMinutes === n} onClick={() => setDeepMinutes(n)}>{n} min</Chip>
                ))}
              </div>
            )}
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What will you work on?"
              className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <button type="button" onClick={start} className="press mt-3 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">
              Start {plannedMinutes}-minute session
            </button>
          </Card>
        </>
      )}

      {(running || remaining !== null) && (
        <Card className="mt-4 text-center">
          {breakMode && <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Break time</div>}
          <div className="font-display text-6xl font-bold tabular-nums text-foreground">{mmss}</div>
          <p className="mt-2 truncate text-sm text-muted-foreground">{label.trim() || MODE_INFO[mode]!.label}</p>
          {running ? (
            <div className="mt-4 space-y-2">
              {breakMode ? (
                <button type="button" onClick={finish} className="press w-full rounded-full border border-border bg-card py-2.5 text-sm font-medium text-foreground">Skip break</button>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={distraction}
                      onChange={(e) => setDistraction(e.target.value)}
                      placeholder="A distraction appeared…"
                      className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <button type="button" onClick={logDistraction} className="press rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground">Log</button>
                  </div>
                  <button type="button" onClick={endEarly} className="press w-full rounded-full border border-border bg-card py-2.5 text-sm font-medium text-muted-foreground">End and save elapsed time</button>
                </>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Session finished — nice work.</p>
          )}
        </Card>
      )}

      {!running && remaining === null && breakMode === false && sessionId === null && mode === "pomodoro" && (
        <Card className="mt-3 text-center">
          <p className="text-sm text-muted-foreground">Finished a focus block? Take your {breakMin}-minute break.</p>
          <button type="button" onClick={startBreak} className="press mt-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">☕ Start break</button>
        </Card>
      )}

      <SectionTitle>Focus minutes — last 14 days</SectionTitle>
      <Card>
        <Bars dates={dates} values={dates.map((d) => minutesByDay[d] ?? 0)} height={80} color="var(--color-gold)" />
      </Card>

      <SectionTitle>Recent sessions</SectionTitle>
      {recent.length === 0 ? (
        <Empty icon="⏱️" title="No sessions yet" hint="Start a five-minute Just Start session — that's usually all it takes." />
      ) : (
        <div className="space-y-2">
          {recent.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.startedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {s.distractions.length > 0 && ` · ${s.distractions.length} distraction${s.distractions.length > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div className="font-display text-sm font-semibold text-primary">{s.minutes} min</div>
              </div>
              {s.distractions.length > 0 && (
                <button type="button" onClick={() => setShowDistractions(!showDistractions)} className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:underline">
                  {showDistractions ? "Hide" : "Show"} distraction log
                </button>
              )}
              {showDistractions && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {s.distractions.map((d, i) => (
                    <li key={i}>• {d.note}</li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Stat label="Sessions logged" value={state.focusSessions.length} />
        <Stat label="Total minutes" value={totalFocusMinutes(snapshot())} />
      </div>
    </Page>
  );
}
