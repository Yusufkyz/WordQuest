export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type WordStatus = 'new' | 'learning' | 'learned'
export type ContextTag = 'formal' | 'informal' | 'written' | 'spoken'
export type PracticeMode = 'flashcard' | 'quiz' | 'fill_blank' | 'pronunciation' | 'spelling'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  daily_goal: number
  streak_count: number
  last_study_date: string | null
  current_level: Level
  total_xp: number
  created_at: string
}

export interface Word {
  id: string
  english: string
  turkish: string
  level: Level
  image_url: string | null
  audio_url: string | null
  example_sentences: string[] | null
  synonyms: string[] | null
  antonyms: string[] | null
  word_family: string[] | null
  collocations: string[] | null
  context_tag: ContextTag | null
  dialog_example: string | null
  created_at: string
}

export interface WordProgress {
  id: string
  user_id: string
  word_id: string
  repeat_count: number      // 7 → 0 (counts down)
  difficulty: Difficulty
  status: WordStatus
  correct_count: number
  wrong_count: number
  next_review_date: string | null
  last_reviewed_at: string | null
  created_at: string
}

export interface WordWithProgress extends Word {
  progress: WordProgress | null
}

export interface ReviewSession {
  id: string
  user_id: string
  level: Level
  correct_count: number
  wrong_count: number
  xp_earned: number
  started_at: string
  ended_at: string | null
}

export interface LevelExam {
  id: string
  user_id: string
  level: Level
  score: number
  passed: boolean
  taken_at: string
}

export interface Achievement {
  id: string
  user_id: string
  badge_key: string
  earned_at: string
}

export interface QuizQuestion {
  word: Word
  options: string[]           // 4 options, one is correct (word.turkish)
  correct_index: number
}

export interface FillBlankQuestion {
  sentence: string            // e.g. "She made a _____ decision."
  answer: string              // e.g. "brave"
  word: Word
}

// SM-2 Spaced Repetition result
export interface SM2Result {
  next_review_date: Date
  repeat_count: number
  status: WordStatus
}

// Badge definitions
export const BADGES: Record<string, { label: string; icon: string; description: string }> = {
  first_word:       { label: 'İlk Adım',        icon: '🌱', description: 'İlk kelimeni öğrendin!' },
  streak_3:         { label: '3 Gün Serisi',     icon: '🔥', description: '3 gün üst üste çalıştın' },
  streak_7:         { label: '7 Gün Serisi',     icon: '⚡', description: '7 gün üst üste çalıştın' },
  streak_30:        { label: 'Aylık Şampiyon',   icon: '👑', description: '30 gün üst üste çalıştın' },
  words_10:         { label: '10 Kelime',        icon: '📚', description: '10 kelime öğrendin' },
  words_50:         { label: '50 Kelime',        icon: '🎯', description: '50 kelime öğrendin' },
  words_100:        { label: '100 Kelime',       icon: '💎', description: '100 kelime öğrendin' },
  words_500:        { label: '500 Kelime',       icon: '🏆', description: '500 kelime öğrendin' },
  level_a1_passed:  { label: 'A1 Tamamlandı',   icon: '🎓', description: 'A1 seviyesini geçtin' },
  level_a2_passed:  { label: 'A2 Tamamlandı',   icon: '🎓', description: 'A2 seviyesini geçtin' },
  level_b1_passed:  { label: 'B1 Tamamlandı',   icon: '🎓', description: 'B1 seviyesini geçtin' },
  perfect_quiz:     { label: 'Mükemmel Quiz',   icon: '⭐', description: 'Quizi hatasız tamamladın' },
}
