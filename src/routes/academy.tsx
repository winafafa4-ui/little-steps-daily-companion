import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Empty, GhostButton, Page, PageHeader, PrimaryButton, SectionTitle } from "@/components/app/bits";
import { LESSONS } from "@/content/academy";
import { academyStats, markLessonRead, recordQuizResult } from "@/lib/academy";
import { appHead } from "@/lib/head";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/academy")({
  head: () => appHead("Academy — Discipline Habit Builder", "Offline lessons and short knowledge checks for building lasting habits."),
  component: Academy,
});

function Academy() {
  const state = useAppState();
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<string | null>(null);
  const selected = LESSONS.find((lesson) => lesson.id === lessonId);
  const stats = academyStats(state);

  function openLesson(id: string) {
    setLessonId(id);
    setAnswers({});
    setResult(null);
  }

  function submitQuiz() {
    if (!selected || Object.keys(answers).length !== selected.quiz.length) return;
    const passed = selected.quiz.every((question, index) => answers[index] === question.correct);
    recordQuizResult(selected.id, passed);
    setResult(passed ? "All answers are correct. Quiz passed." : "Not quite yet. Review the explanations and try again.");
  }

  return (
    <Page>
      <PageHeader title="Academy" subtitle={`${stats.completed} of ${stats.total} lessons read · ${stats.quizPassed} quizzes passed`} />
      {selected ? (
        <>
          <GhostButton onClick={() => { setLessonId(null); setResult(null); }}>← All lessons</GhostButton>
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{selected.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selected.category} · {selected.minutes} min · {selected.tagline}</p>
          <div className="mt-4 space-y-3">
            {selected.sections.map((section) => (
              <Card key={section.heading}>
                <h3 className="font-semibold text-foreground">{section.heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </Card>
            ))}
          </div>
          <SectionTitle>Key takeaways</SectionTitle>
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
            {selected.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
          </ul>
          <PrimaryButton className="mt-4 w-full" onClick={() => markLessonRead(selected.id)}>
            {state.lessonProgress[selected.id]?.completedAt ? "Lesson read" : "Mark lesson read"}
          </PrimaryButton>
          <SectionTitle>Knowledge check</SectionTitle>
          <div className="space-y-3">
            {selected.quiz.map((question, questionIndex) => (
              <Card key={question.q}>
                <p className="text-sm font-medium text-foreground">{question.q}</p>
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={option} className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
                      <input type="radio" name={`quiz-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers((previous) => ({ ...previous, [questionIndex]: optionIndex }))} className="mt-1 accent-[var(--color-primary)]" />
                      <span>{option}</span>
                    </label>
                  ))}
                  {answers[questionIndex] !== undefined && <p className="mt-2 text-xs text-muted-foreground">{question.why}</p>}
                </div>
              </Card>
            ))}
          </div>
          <PrimaryButton className="mt-3 w-full" disabled={Object.keys(answers).length !== selected.quiz.length} onClick={submitQuiz}>Check answers</PrimaryButton>
          {result && <p role="status" className="mt-2 text-center text-sm font-medium text-primary">{result}</p>}
        </>
      ) : LESSONS.length === 0 ? (
        <Empty icon="📚" title="No lessons available" />
      ) : (
        <div className="space-y-2">
          {LESSONS.map((lesson, index) => {
            const progress = state.lessonProgress[lesson.id];
            return (
              <Card key={lesson.id}>
                <button type="button" onClick={() => openLesson(lesson.id)} className="flex w-full items-center gap-3 text-left">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{lesson.title}</span>
                    <span className="block text-xs text-muted-foreground">{lesson.category} · {lesson.minutes} min</span>
                  </span>
                  <span className="text-xs text-primary">{progress?.quizPassed ? "Passed" : progress?.completedAt ? "Read" : "Start"}</span>
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}