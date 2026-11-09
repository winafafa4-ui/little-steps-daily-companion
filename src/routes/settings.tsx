import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Field, GhostButton, inputCls, Page, PageHeader, PrimaryButton, SectionTitle } from "@/components/app/bits";
import { appHead } from "@/lib/head";
import { clearAllData, exportJSON, importJSON, setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => appHead("Settings — Discipline Habit Builder", "Manage your profile, appearance, reminders and private offline backup."),
  component: Settings,
});

function Settings() {
  const state = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState("");

  function applyTheme(theme: "light" | "dark" | "system") {
    setState((draft) => { draft.profile.theme = theme; });
    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }

  function downloadBackup() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `discipline-habit-builder-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded to this device.");
  }

  async function restoreBackup(file: File | undefined) {
    if (!file) return;
    const result = importJSON(await file.text());
    setMessage(result.ok ? "Backup restored." : result.error ?? "Could not restore that file.");
    if (fileRef.current) fileRef.current.value = "";
  }

  function resetData() {
    clearAllData();
    document.documentElement.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
    setConfirmClear(false);
    setMessage("All app data has been cleared from this device.");
  }

  return (
    <Page>
      <PageHeader title="Settings" subtitle="Your account stays on this device" />
      <SectionTitle>Profile</SectionTitle>
      <Card className="space-y-3">
        <Field label="Name"><input value={state.profile.name} onChange={(event) => setState((draft) => { draft.profile.name = event.target.value; })} className={inputCls} placeholder="Your name" /></Field>
        <Field label="Identity statement"><input value={state.profile.identity} onChange={(event) => setState((draft) => { draft.profile.identity = event.target.value; })} className={inputCls} placeholder="I am the kind of person who…" /></Field>
        <Link to="/onboarding" className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline">Review setup</Link>
      </Card>

      <SectionTitle>Appearance</SectionTitle>
      <Card>
        <Field label="Color theme"><select value={state.profile.theme} onChange={(event) => applyTheme(event.target.value as "light" | "dark" | "system")} className={inputCls}><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></select></Field>
      </Card>

      <SectionTitle>Reminders</SectionTitle>
      <Card className="space-y-3">
        <label className="flex items-center justify-between gap-3 text-sm font-medium text-foreground"><span>Enable reminder preferences</span><input type="checkbox" checked={state.profile.reminders.enabled} onChange={(event) => setState((draft) => { draft.profile.reminders.enabled = event.target.checked; })} className="size-5 accent-[var(--color-primary)]" /></label>
        <p className="text-xs text-muted-foreground">These times are saved on your device. Actual notifications require the phone app.</p>
        <Field label="Morning check-in"><input type="time" value={state.profile.reminders.morning} onChange={(event) => setState((draft) => { draft.profile.reminders.morning = event.target.value; })} className={inputCls} /></Field>
        <Field label="Evening reflection"><input type="time" value={state.profile.reminders.evening} onChange={(event) => setState((draft) => { draft.profile.reminders.evening = event.target.value; })} className={inputCls} /></Field>
      </Card>

      <SectionTitle>Backup and restore</SectionTitle>
      <Card>
        <p className="text-sm text-muted-foreground">Your habits, notes, history and settings are stored locally. Save a private copy or restore one here.</p>
        <div className="mt-3 flex flex-wrap gap-2"><PrimaryButton onClick={downloadBackup}>Download backup</PrimaryButton><GhostButton onClick={() => fileRef.current?.click()}>Restore backup</GhostButton><input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => void restoreBackup(event.target.files?.[0])} /></div>
      </Card>

      <SectionTitle>Clear data</SectionTitle>
      <Card>
        {confirmClear ? <div><p className="text-sm font-medium text-destructive">This permanently removes all local habits, entries and history.</p><div className="mt-3 flex gap-2"><GhostButton onClick={() => setConfirmClear(false)}>Cancel</GhostButton><PrimaryButton onClick={resetData} className="bg-destructive text-destructive-foreground">Clear everything</PrimaryButton></div></div> : <GhostButton onClick={() => setConfirmClear(true)}>Clear all app data</GhostButton>}
      </Card>
      {message && <p role="status" className="mt-3 text-sm text-primary">{message}</p>}
    </Page>
  );
}