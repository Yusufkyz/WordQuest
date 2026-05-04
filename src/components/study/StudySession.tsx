'use client'

import { useState, useCallback } from 'react'
import type { WordWithProgress, Level } from '@/types'
import FlashCard from './FlashCard'
import PracticeRound from './PracticeRound'
import SessionComplete from './SessionComplete'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview, resetOnWrongAnswer, calculateXP } from '@/lib/utils'

interface Props {
  words: WordWithProgress[]
  userId: string
  level: Level
}

type Phase = 'flashcard' | 'practice' | 'complete'

export default function StudySession({ words, userId, level }: Props) {
  const supabase = createClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase]               = useState<Phase>('flashcard')
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, xp: 0 })
  const [practiceWords, setPracticeWords] = useState<WordWithProgress[]>([])

  const currentWord = words[currentIndex]
  const progress    = (currentIndex / words.length) * 100

  const saveProgress = useCallback(async (
    word: WordWithProgress,
    isCorrect: boolean
  ) => {
    const existingProgress = word.progress

    if (isCorrect) {
      const difficulty = existingProgress?.difficulty ?? 'medium'
      const currentRepeat = existingProgress?.repeat_count ?? 7
      const sm2 = calculateNextReview(currentRepeat, difficulty)

      await supabase.from('word_progress').upsert({
        user_id:          userId,
        word_id:          word.id,
        repeat_count:     sm2.repeat_count,
        status:           sm2.status,
        next_review_date: sm2.next_review_date.toISOString(),
        last_reviewed_at: new Date().toISOString(),
        correct_count:    (existingProgress?.correct_count ?? 0) + 1,
        wrong_count:      existingProgress?.wrong_count ?? 0,
        difficulty:       existingProgress?.difficulty ?? 'medium',
      }, { onConflict: 'user_id,word_id' })
    } else {
      const reset = resetOnWrongAnswer()
      await supabase.from('word_progress').upsert({
        user_id:          userId,
        word_id:          word.id,
        repeat_count:     reset.repeat_count,
        status:           reset.status,
        next_review_date: null,
        last_reviewed_at: new Date().toISOString(),
        correct_count:    existingProgress?.correct_count ?? 0,
        wrong_count:      (existingProgress?.wrong_count ?? 0) + 1,
        difficulty:       existingProgress?.difficulty ?? 'medium',
      }, { onConflict: 'user_id,word_id' })
    }
  }, [supabase, userId])

  const handleFlashcardResult = useCallback(async (knew: boolean) => {
    await saveProgress(currentWord, knew)

    const xpGain = knew ? 5 : 0
    setSessionStats(prev => ({
      correct: prev.correct + (knew ? 1 : 0),
      wrong:   prev.wrong   + (knew ? 0 : 1),
      xp:      prev.xp + xpGain,
    }))

    const nextIndex = currentIndex + 1

    // Every 10 words → practice round
    if (nextIndex % 10 === 0 && nextIndex < words.length) {
      const batch = words.slice(Math.max(0, nextIndex - 10), nextIndex)
      setPracticeWords(batch)
      setPhase('practice')
      return
    }

    if (nextIndex >= words.length) {
      // Update user XP
      await supabase.rpc('increment_xp', {
        p_user_id: userId,
        p_amount:  sessionStats.xp + xpGain,
      }).catch(() => {})
      setPhase('complete')
      return
    }

    setCurrentIndex(nextIndex)
  }, [currentIndex, currentWord, saveProgress, sessionStats, supabase, userId, words])

  const handlePracticeComplete = useCallback((correct: number, wrong: number) => {
    const xpGain = calculateXP(correct, 'correct_quiz')
    setSessionStats(prev => ({
      correct: prev.correct + correct,
      wrong:   prev.wrong   + wrong,
      xp:      prev.xp + xpGain,
    }))
    setPhase('flashcard')
    // Continue from where we left off
  }, [])

  if (phase === 'complete') {
    return <SessionComplete stats={sessionStats} totalWords={words.length} level={level} />
  }

  if (phase === 'practice') {
    return (
      <PracticeRound
        words={practiceWords}
        allTurkish={words.map(w => w.turkish)}
        onComplete={handlePracticeComplete}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto wq-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border level-${level.toLowerCase()}`}>
            {level}
          </div>
        </div>
        <div className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-10 overflow-hidden"
        style={{ background: 'var(--wq-surface-2)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--wq-primary), var(--wq-accent))',
          }}
        />
      </div>

      {/* Flashcard */}
      <FlashCard
        key={currentWord.id}
        word={currentWord}
        onKnow={() => handleFlashcardResult(true)}
        onDontKnow={() => handleFlashcardResult(false)}
      />

      {/* Session mini-stats */}
      <div className="flex justify-center gap-8 mt-8 text-sm"
        style={{ color: 'var(--wq-text-muted)' }}>
        <span>✅ {sessionStats.correct} doğru</span>
        <span>❌ {sessionStats.wrong} yanlış</span>
        <span>⚡ {sessionStats.xp} XP</span>
      </div>
    </div>
  )
}
