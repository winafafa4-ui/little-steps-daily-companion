import { createFileRoute } from '@tanstack/react-router'
import { useAppState } from "@/lib/store";
import { routineProgress } from "@/lib/routines";
import { todayISO } from "@/lib/dates";
import { Card, Empty, Page, PageHeader } from "@/components/app/bits";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/routines")({
  head: () => appHead("Routines — Discipline Habit Builder", "Design morning, afternoon and evening routines."),
  component: Routines,
});

const PERIODS = ["morning", "afternoon", "evening"] as const;

function Routines() {
  const state = useAppState();
  const today = todayISO();

  return (
    <Page>
      <PageHeader title="Routines" subtitle="Morning, afternoon and evening rituals" />
      {state.routines.length === 0 ? (
        <Empty icon="🌅" title="No routines yet" hint="Build your first routine during onboarding, or come back after the Routine Architect is added." />
      ) : (
        <div className="space-y-4">
          {PERIODS.map((period) => {
            const list = state.routines.filter((r) => r.period === period);
            if (list.length === 0) return null;
            return (
              <div key={period}>
                <h2 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{period}</h2>
                <div className="space-y-2">
                  {list.map((r) => {
                    const p = routineProgress(state, r.id, today);
                    return (
                      <Card key={r.id}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.steps.length} steps</div>
                          </div>
                          <div className="font-display text-sm font-semibold text-primary">{Math.round(p * 100)}%</div>
                        </div>
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
