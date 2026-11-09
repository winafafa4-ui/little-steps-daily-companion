import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Empty, Field, GhostButton, inputCls, Page, PageHeader, PrimaryButton, SectionTitle } from "@/components/app/bits";
import { appHead } from "@/lib/head";
import { CHALLENGE_TEMPLATES, challengeCurrentDay, challengeProgress, deleteChallenge, isChallengeActive, setReflection, startChallenge, startCustomChallenge, toggleChallengeDay } from "@/lib/challenges";
import { todayISO } from "@/lib/dates";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/challenges")({
  head: () => appHead("Challenges — Discipline Habit Builder", "Take on guided or custom daily challenges and reflect on your progress."),
  component: Challenges,
});

function Challenges() {
  const state = useAppState();
  const [customOpen, setCustomOpen] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState(7);
  const [reward, setReward] = useState("");
  const active = state.challengeInstances.filter(isChallengeActive);
  const past = state.challengeInstances.filter((challenge) => !isChallengeActive(challenge));

  function createCustom() {
    if (!name.trim()) return;
    startCustomChallenge(name.trim(), days, reward.trim() || "A promise kept to yourself");
    setName("");
    setReward("");
    setDays(7);
    setCustomOpen(false);
  }

  return (
    <Page>
      <PageHeader title="Challenges" subtitle="A daily commitment, with room for real life" action={<PrimaryButton onClick={() => setCustomOpen((open) => !open)} className="mt-1 !px-3 !py-2">{customOpen ? "Close" : "Custom"}</PrimaryButton>} />
      {customOpen && (
        <Card className="mb-5 space-y-3">
          <Field label="Challenge name"><input value={name} onChange={(event) => setName(event.target.value)} className={inputCls} placeholder="e.g. Read before bed" /></Field>
          <Field label="Length in days"><input type="number" min={1} max={365} value={days} onChange={(event) => setDays(Math.max(1, Math.min(365, Number(event.target.value) || 1)))} className={inputCls} /></Field>
          <Field label="What would completing it mean to you?"><input value={reward} onChange={(event) => setReward(event.target.value)} className={inputCls} placeholder="A calmer evening" /></Field>
          <PrimaryButton onClick={createCustom} disabled={!name.trim()}>Start challenge</PrimaryButton>
        </Card>
      )}

      <SectionTitle>In progress · {active.length}</SectionTitle>
      {active.length === 0 ? <Empty icon="⚔️" title="No active challenges" hint="Choose a guided plan below or make one of your own." /> : (
        <div className="space-y-3">
          {active.map((challenge) => {
            const day = challengeCurrentDay(challenge);
            const todayDone = challenge.dayState[day]?.done ?? false;
            return (
              <Card key={challenge.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{challenge.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{challenge.tagline} · {Math.round(challengeProgress(challenge) * 100)}% complete</p>
                  </div>
                  <GhostButton onClick={() => deleteChallenge(challenge.id)} className="shrink-0 !px-2 !py-1.5">Remove</GhostButton>
                </div>
                <div className="mt-3 rounded-md bg-secondary/70 p-3">
                  <p className="text-xs font-semibold text-primary">Day {day} of {challenge.days}</p>
                  <p className="mt-1 text-sm text-foreground">{challenge.objectives[day - 1] ?? "Keep your commitment today."}</p>
                  <PrimaryButton className="mt-3 w-full" onClick={() => toggleChallengeDay(challenge.id, day)}>{todayDone ? "Undo today's check-in" : "Complete today's check-in"}</PrimaryButton>
                  <label className="mt-3 block text-xs font-medium text-muted-foreground" htmlFor={`reflection-${challenge.id}`}>Reflection for today</label>
                  <textarea id={`reflection-${challenge.id}`} rows={2} value={challenge.dayState[day]?.reflection ?? ""} onChange={(event) => setReflection(challenge.id, day, event.target.value)} placeholder="What helped, or what got in the way?" className={inputCls + " mt-1 resize-y"} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SectionTitle>Guided challenges</SectionTitle>
      <div className="space-y-2">
        {CHALLENGE_TEMPLATES.map((template) => {
          const alreadyActive = active.some((challenge) => challenge.templateId === template.id);
          return (
            <Card key={template.id}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground">{template.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{template.days} days · {template.tagline}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{template.reward}</p>
                  <PrimaryButton className="mt-3" disabled={alreadyActive} onClick={() => startChallenge(template)}>{alreadyActive ? "Already active" : "Start challenge"}</PrimaryButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {past.length > 0 && <>
        <SectionTitle>Completed or past</SectionTitle>
        <div className="space-y-2">{past.map((challenge) => <Card key={challenge.id}>
          <div className="flex items-center justify-between gap-3">
            <div><div className="font-medium text-foreground">{challenge.name}</div><div className="text-xs text-muted-foreground">{Object.values(challenge.dayState).filter((day) => day.done).length} of {challenge.days} days checked in · started {todayISO() === challenge.startDate ? "today" : challenge.startDate}</div></div>
            <GhostButton onClick={() => deleteChallenge(challenge.id)}>Remove</GhostButton>
          </div>
        </Card>)}</div>
      </>}
    </Page>
  );
}