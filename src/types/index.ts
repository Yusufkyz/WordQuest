export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type WordStatus = 'new' | 'learning' | 'learned'
export type ContextTag = 'formal' | 'informal' | 'written' | 'spoken'

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
  context_tag: ContextTag | null
  created_at: string
}

export interface WordProgress {
  id: string
  user_id: string
  word_id: string
  repeat_count: number
  difficulty: Difficulty
  status: WordStatus
  next_review_date: string | null
  last_reviewed_at: string | null
  created_at: string
}