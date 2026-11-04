import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page, PageHeader, Card, SectionTitle, Empty, Chip } from "@/components/app/bits";
import { useAppState } from "@/lib/store";
import { JOURNAL_PROMPTS, MOOD_FACES, saveJournalEntry, searchJournal, todayEntry } from "@/lib/journal";
import { relativeDay } from "@/lib/dates";
import { appHead } from "@/lib/head";

export const Route = createFileRoute("/journal")({
  head: () => appHead("Journal — Discipline Habit Builder", "Daily reflection prompts, mood check-ins and free writing."),
  component: Journal,
});

function Journal() {
  const state = useAppState();
  const today = todayEntry(state);
  const [mood, setMood] = useState(3);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [free, setFree] = useState("");
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Load today's existing entry into the editor (client only).
  useEffect(() => {
    if (today) {
      setMood(today.mood);
      setAnswers({ ...today.answers });
      setFree(today.free);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today?.id]);

  function save() {
    saveJournalEntry({ mood, answers, free });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const results = searchJournal(state, query);

  return (
    <Page>
      <PageHeader title="Journal" subtitle="A few honest minutes beat perfect prose" />

      <Card>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How was your day?</div>
        <div className="mt-2 flex justify-between">
          {MOOD_FACES.map((face, i) => {
            const v = i + 1;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setMood(v)}
                aria-label={`Mood ${v} of 5`}
                className={"press flex size-11 items-center justify-center rounded-full text-2xl " + (mood === v ? "bg-primary/15 ring-1 ring-primary" : "bg-secondary")}
              >
                {face}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          {JOURNAL_PROMPTS.map((p) => (
            <label key={p.key} className="block">
              <span className="text-sm font-medium text-foreground">{p.label}</span>
              <textarea
                value={answers[p.key] ?? ""}
                onChange={(e) => setAnswers({ ...answers, [p.key]: e.target.value })}
                rows={2}
                className="mt-1 w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-foreground">Anything else</span>
            <textarea
              value={free}
              onChange={(e) => setFree(e.target.value)}
              rows={3}
              placeholder="Free writing — nobody else reads this."
              className="mt-1 w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={save} className="press flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            {today ? "Update today's entry" : "Save entry"}
          </button>
          {saved && <span className="text-xs font-medium text-primary">Saved ✓</span>}
        </div>
      </Card>

      <SectionTitle>Past entries</SectionTitle>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your entries…"
        className="mb-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
      {results.length === 0 ? (
        <Empty icon="📓" title="No entries yet" hint="Your first reflection is one honest paragraph away." />
      ) : (
        <div className="space-y-2">
          {results.map((e) => (
            <Card key={e.id} onClick={() => setOpenId(openId === e.id ? null : e.id)}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{relativeDay(e.date)}</div>
                  <div className="truncate text-xs text-muted-foreground">{e.free || Object.values(e.answers).find(Boolean) || "—"}</div>
                </div>
                <span className="text-xl">{MOOD_FACES[e.mood - 1] ?? "😐"}</span>
              </div>
              {openId === e.id && (
                <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                  {JOURNAL_PROMPTS.map((p) =>
                    e.answers[p.key] ? (
                      <div key={p.key}>
                        <div className="text-xs font-semibold text-muted-foreground">{p.label}</div>
                        <div className="text-sm text-foreground">{e.answers[p.key]}</div>
                      </div>
                    ) : null,
                  )}
                  {e.free && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Free writing</div>
                      <div className="whitespace-pre-wrap text-sm text-foreground">{e.free}</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
