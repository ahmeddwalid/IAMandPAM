import React, { useState, useEffect } from 'react';

interface QuizResult {
  section: string;
  score: number;
  total: number;
  timestamp: number;
}

const STORAGE_KEY = 'iam-pam-quiz-scores';

function loadScores(): QuizResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScores(scores: QuizResult[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function recordQuizScore(section: string, score: number, total: number) {
  const scores = loadScores();
  const existing = scores.findIndex((s) => s.section === section);
  const result: QuizResult = { section, score, total, timestamp: Date.now() };
  if (existing >= 0) {
    scores[existing] = result;
  } else {
    scores.push(result);
  }
  saveScores(scores);
}

export default function QuizScore({ section }: { section: string }) {
  const [scores, setScores] = useState<QuizResult[]>([]);

  useEffect(() => {
    setScores(loadScores());
  }, []);

  const sectionScores = scores.filter((s) => s.section === section);
  const latest = sectionScores.sort((a, b) => b.timestamp - a.timestamp)[0];

  if (!latest) return null;

  const percentage = Math.round((latest.score / latest.total) * 100);
  const passed = percentage >= 60;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '4px',
        background: passed ? 'rgba(44, 122, 74, 0.1)' : 'rgba(192, 57, 43, 0.1)',
        border: `1px solid ${passed ? 'var(--sem-success)' : 'var(--sem-danger)'}`,
        fontSize: '0.8rem',
        fontWeight: 600,
        color: passed ? 'var(--sem-success)' : 'var(--sem-danger)',
      }}
    >
      <span>Your score: {latest.score}/{latest.total} ({percentage}%)</span>
      {passed ? ' — Passed' : ' — Keep reviewing'}
    </div>
  );
}
