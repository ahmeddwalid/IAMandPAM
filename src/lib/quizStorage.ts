export interface QuizResult {
  score: number;
  total: number;
  timestamp: number;
}

const STORAGE_KEY = 'iam-pam-quiz-scores';

type ScoreMap = Record<string, QuizResult>;

function readAll(): ScoreMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ScoreMap) : {};
  } catch {
    return {};
  }
}

function writeAll(scores: ScoreMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Storage can be unavailable in private browsing; the quiz still works.
  }
}

export function getLatestScore(section: string): QuizResult | null {
  return readAll()[section] ?? null;
}

export function recordQuizScore(section: string, score: number, total: number) {
  const scores = readAll();
  scores[section] = {score, total, timestamp: Date.now()};
  writeAll(scores);
}
