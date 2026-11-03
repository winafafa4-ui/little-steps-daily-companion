import { createFileRoute } from '@tanstack/react-router'
import { useAppState } from "@/lib/store";
import { dailyScore, levelFor } from "@/lib/gamify";
import { lastNDates, todayISO } from "@/lib/dates";
import { Bars, Page, PageHeader, Stat } from "@/components/app/bits";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/progress")({
  head: () => appHead("Progress — Discipline Habit Builder", "Your discipline score, XP and lifetime progress."),
  component: Progress,
});

function Progress() {
  const state = useAppState();
  const today = todayISO();
  const dates = lastNDates(14);
  const scores = dates.map((d) => dailyScore(state, d));
  const lvl = levelFor(state.xp);

  return (
    <Page>
      <PageHeader title="Progress" subtitle="Real numbers from your own data" />
      <div className="flex gap-2">
        <Stat label="Total XP (lifetime)" value={state.xp} />
        <Stat label="Level" value={lvl.name} />
      </div>
      <div className="mt-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Daily score — last 14 days</h2>
        <div className="card-soft p-4">
          <Bars dates={dates} values={scores} height={100} />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Charts, heatmaps, achievements and the growth timeline arrive with the next build step.
      </p>
    </Page>
  );
}
