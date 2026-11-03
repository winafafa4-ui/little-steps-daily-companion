// Academy progress (lesson completion + quizzes). Lesson content lives in
// src/content/academy.ts and is fully offline.

import type { AppState } from "./model";
import { setState, snapshot } from "./store";
import { awardXp } from "./gamify";

export function markLessonRead(lessonId: string) {
  const s = snapshot();
  const progress = s.lessonProgress[lessonId];
  if (progress?.completedAt) return;
  setState((d) => {
    d.lessonProgress[lessonId] = {
      completedAt: d.lessonProgress[lessonId]?.completedAt ?? Date.now(),
      quizPassed: d.lessonProgress[lessonId]?.quizPassed ?? false,
    };
  });
  awardXp(15, "Lesson completed");
}

export function recordQuizResult(lessonId: string, passed: boolean) {
  const s = snapshot();
  const was = s.lessonProgress[lessonId]?.quizPassed ?? false;
  if (!was && passed) {
    setState((d) => {
      d.lessonProgress[lessonId] = {
        completedAt: d.lessonProgress[lessonId]?.completedAt ?? null,
        quizPassed: true,
      };
    });
    awardXp(10, "Quiz passed");
  } else if (!passed) {
    setState((d) => {
      d.lessonProgress[lessonId] = {
        completedAt: d.lessonProgress[lessonId]?.completedAt ?? null,
        quizPassed: false,
      };
    });
  }
}

export function academyStats(state: AppState): { completed: number; quizPassed: number; total: number } {
  return {
    completed: Object.values(state.lessonProgress).filter((p) => p.completedAt).length,
    quizPassed: Object.values(state.lessonProgress).filter((p) => p.quizPassed).length,
    total: 10,
  };
}
