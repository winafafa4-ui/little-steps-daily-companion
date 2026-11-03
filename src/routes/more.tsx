import { createFileRoute } from '@tanstack/react-router'
import { Page, PageHeader } from "@/components/app/bits";
import { appHead } from "@/lib/head";
import { ACHIEVEMENTS, levelFor } from "@/lib/gamify";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/more")({
  head: () => appHead("More — Discipline Habit Builder", "Focus, journal, academy, challenges, goals and settings."),
  component: More,
});

const MODULES = [
  { icon: "⏱️", name: "Focus", desc: "Pomodoro, deep work and Just Start mode" },
  { icon: "📓", name: "Journal", desc: "Daily reflection prompts and free writing" },
  { icon: "📚", name: "Academy", desc: "10 offline lessons on building discipline" },
  { icon: "⚔️", name: "Challenges", desc: "8 guided challenges plus your own" },
  { icon: "🧭", name: "Goals", desc: "Yearly, monthly and weekly goal planner" },
  { icon: "🛡️", name: "Bad Habit Breaker", desc: "Track urges, triggers and alternatives" },
  { icon: "📵", name: "Digital Tracker", desc: "Log screen-free time and phone rules" },
  { icon: "✅", name: "Tasks", desc: "Today's tasks and top-3 priorities" },
  { icon: "⚙️", name: "Settings", desc: "Theme, reminders, backup and data" },
];

function More() {
  const state = useAppState();
  const lvl = levelFor(state.xp);
  const unlocked = Object.keys(state.unlockedAchievements).length;

  return (
    <Page>
      <PageHeader title="More" subtitle={`Level ${lvl.index + 1} · ${lvl.name} · ${unlocked}/${ACHIEVEMENTS.length} badges`} />
      <div className="space-y-2">
        {MODULES.map((m) => (
          <div key={m.name} className="card-soft flex items-center gap-3 p-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-xl">{m.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.desc}</div>
            </div>
            <span className="text-xs text-muted-foreground/60">soon</span>
          </div>
        ))}
      </div>
    </Page>
  );
}
