import type { Difficulty, WordStatus, SM2Result } from '@/types'

// ──────────────────────────────────────────────
// SM-2 Spaced Repetition Algorithm
// ──────────────────────────────────────────────

const INTERVALS_BY_REPEAT: Record<number, number> = {
  7: 0,   // same session
  6: 1,   // 1 day
  5: 3,   // 3 days
  4: 7,   // 1 week
  3: 14,  // 2 weeks
  2: 21,  // 3 weeks
  1: 30,  // 1 month
  0: 0,   // learned — very long interval
}

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy:   1.3,
  medium: 1.0,
  hard:   0.7,
}

/**
 * Calculate next review date after a correct answer.
 * repeat_count counts DOWN: 7 → 6 → ... → 0 = learned
 */
export function calculateNextReview(
  currentRepeatCount: number,
  difficulty: Difficulty
): SM2Result {
  const newRepeatCount = Math.max(0, currentRepeatCount - 1)
  const baseInterval  = INTERVALS_BY_REPEAT[newRepeatCount] ?? 30
  const multiplier    = DIFFICULTY_MULTIPLIER[difficulty]
  const intervalDays  = Math.round(baseInterval * multiplier)

  const nextDate = new Date()
  if (intervalDays === 0 && newRepeatCount > 0) {
    // Same session — review again in a few minutes
    nextDate.setMinutes(nextDate.getMinutes() + 10)
  } else {
    nextDate.setDate(nextDate.getDate() + intervalDays)
  }

  const status: WordStatus =
    newRepeatCount === 0 ? 'learned' : 'learning'

  return { next_review_date: nextDate, repeat_count: newRepeatCount, status }
}

/**
 * Reset repeat_count to 7 on wrong answer.
 */
export function resetOnWrongAnswer(): Pick<SM2Result, 'repeat_count' | 'status'> {
  return { repeat_count: 7, status: 'learning' }
}

// ──────────────────────────────────────────────
// XP System
// ──────────────────────────────────────────────

export const XP_VALUES = {
  correct_flashcard:  5,
  correct_quiz:       10,
  correct_fill_blank: 15,
  correct_spelling:   15,
  correct_pronun:     20,
  word_learned:       50,
  level_exam_passed:  200,
  daily_goal_reached: 30,
  streak_bonus:       10,   // per streak day (up to 7)
}

export function calculateXP(
  correctCount: number,
  mode: keyof typeof XP_VALUES = 'correct_quiz',
  bonuses: { wordsLearned?: number; streakDays?: number } = {}
): number {
  let xp = correctCount * XP_VALUES[mode]
  if (bonuses.wordsLearned) xp += bonuses.wordsLearned * XP_VALUES.word_learned
  if (bonuses.streakDays)
    xp += Math.min(bonuses.streakDays, 7) * XP_VALUES.streak_bonus
  return xp
}

// ──────────────────────────────────────────────
// Streak
// ──────────────────────────────────────────────

export function calculateStreak(
  lastStudyDate: string | null,
  currentStreak: number
): number {
  if (!lastStudyDate) return 1

  const last    = new Date(lastStudyDate)
  const today   = new Date()
  const diffMs  = today.setHours(0,0,0,0) - last.setHours(0,0,0,0)
  const diffDay = diffMs / (1000 * 60 * 60 * 24)

  if (diffDay === 0) return currentStreak          // already studied today
  if (diffDay === 1) return currentStreak + 1      // consecutive day
  return 1                                         // streak broken
}

// ──────────────────────────────────────────────
// Quiz helpers
// ──────────────────────────────────────────────

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildQuizOptions(
  correctAnswer: string,
  allOptions: string[],
  count = 4
): { options: string[]; correct_index: number } {
  const distractors = shuffleArray(
    allOptions.filter(o => o !== correctAnswer)
  ).slice(0, count - 1)

  const raw = shuffleArray([correctAnswer, ...distractors])
  return {
    options: raw,
    correct_index: raw.indexOf(correctAnswer),
  }
}

// ──────────────────────────────────────────────
// Fill-blank helper
// ──────────────────────────────────────────────

export function createFillBlank(sentence: string, word: string): string {
  // Replace first occurrence (case-insensitive) with _____
  return sentence.replace(new RegExp(`\\b${word}\\b`, 'i'), '_____')
}

// ──────────────────────────────────────────────
// Level progression
// ──────────────────────────────────────────────

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export function getNextLevel(current: string): string | null {
  const idx = LEVEL_ORDER.indexOf(current as typeof LEVEL_ORDER[number])
  return idx >= 0 && idx < LEVEL_ORDER.length - 1
    ? LEVEL_ORDER[idx + 1]
    : null
}

export const PASSING_SCORE = 70  // minimum exam score to advance
