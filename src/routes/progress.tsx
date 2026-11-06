import { createFileRoute } from '@tanstack/react-router'
import { useAppState } from "@/lib/store";
import { dailyScore, levelFor } from "@/lib/gamify";
import { lastNDates, todayISO } from "@/lib/dates";
import { Bars, Page, PageHeader, SectionTitle, Stat } from "@/components/app/bits";
import { ACHIEVEMENTS, balanceFromData } from "@/lib/gamify";
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
  const balance = balanceFromData(state);
  const unlocked = Object.keys(state.unlockedAchievements).length;
  const achievements = [...ACHIEVEMENTS].sort((a, b) => Number(Boolean(state.unlockedAchievements[b.id])) - Number(Boolean(state.unlockedAchievements[a.id])));

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
      <SectionTitle>Discipline balance · recent habits</SectionTitle>
      <div className="space-y-3 card-soft p-4">
        {Object.entries(balance).map(([category, value]) => (
          <div key={category}>
            <div className="mb-1 flex justify-between text-xs"><span className="capitalize text-foreground">{category}</span><span className="text-muted-foreground">{value}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>
      <SectionTitle>Achievements · {unlocked}/{ACHIEVEMENTS.length}</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {achievements.map((achievement) => {
          const earned = Boolean(state.unlockedAchievements[achievement.id]);
          return <div key={achievement.id} className={`card-soft p-3 ${earned ? "" : "opacity-55"}`}>
            <div className="text-xl">{achievement.icon}</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{achievement.name}</div>
            <div className="text-xs text-muted-foreground">{earned ? `Earned ${state.unlockedAchievements[achievement.id]}` : achievement.description}</div>
          </div>;
        })}
      </div>
      <SectionTitle>Growth timeline</SectionTitle>
      {state.timeline.length === 0 ? <p className="py-4 text-sm text-muted-foreground">Milestones and badges will appear here as you make progress.</p> : (
        <ol className="space-y-3 border-l border-border pl-4">
          {[...state.timeline].sort((a, b) => b.at - a.at).slice(0, 30).map((event) => (
            <li key={event.id} className="relative"><span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" /><div className="text-sm font-medium text-foreground">{event.title}</div><div className="text-xs text-muted-foreground">{event.detail} · {new Date(event.at).toLocaleDateString()}</div></li>
          ))}
        </ol>
      )}
    </Page>
  );
}
