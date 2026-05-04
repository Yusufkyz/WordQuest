'use client'

import { useState, useMemo } from 'react'
import type { WordWithProgress } from '@/types'
import { buildQuizOptions, createFillBlank, shuffleArray } from '@/lib/utils'

interface Props {
  words: WordWithProgress[]
  allTurkish: string[]
  onComplete: (correct: number, wrong: number) => void
}

type Mode = 'quiz' | 'fill_blank'

interface Question {
  word: WordWithProgress
  mode: Mode
  options?: string[]
  correctIndex?: number
  sentence?: string
}

export default function PracticeRound({ words, allTurkish, onComplete }: Props) {
  const questions = useMemo<Question[]>(() => {
    const q: Question[] = []

    words.forEach((word, i) => {
      if (i % 2 === 0) {
        // Quiz
        const { options, correct_index } = buildQuizOptions(word.turkish, allTurkish)
        q.push({ word, mode: 'quiz', options, correctIndex: correct_index })
      } else {
        // Fill blank
        const sentence = word.example_sentences?.[0] ?? `She used the word ${word.english} correctly.`
        q.push({ word, mode: 'fill_blank', sentence: createFillBlank(sentence, word.english) })
      }
    })

    return shuffleArray(q)
  }, [words, allTurkish])

  const [qi, setQi]               = useState(0)
  const [selected, setSelected]   = useState<number | null>(null)
  const [fillInput, setFillInput] = useState('')
  const [answered, setAnswered]   = useState(false)
  const [correct, setCorrect]     = useState(0)
  const [wrong, setWrong]         = useState(0)
  const [feedback, setFeedback]   = useState<'correct' | 'wrong' | null>(null)

  const q = questions[qi]

  function handleQuizSelect(idx: number) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const isCorrect = idx === q.correctIndex
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
  }

  function handleFillSubmit() {
    if (answered) return
    const isCorrect = fillInput.trim().toLowerCase() === q.word.english.toLowerCase()
    setAnswered(true)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
  }

  function handleNext() {
    if (qi + 1 >= questions.length) {
      onComplete(correct, wrong)
      return
    }
    setQi(qi + 1)
    setSelected(null)
    setFillInput('')
    setAnswered(false)
    setFeedback(null)
  }

  return (
    <div className="max-w-2xl mx-auto wq-animate-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3"
          style={{ background: 'var(--wq-primary-glow)', color: 'var(--wq-primary)' }}>
          🎯 Pratik Turu
        </div>
        <p className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
          {qi + 1} / {questions.length}
        </p>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full mb-8 overflow-hidden"
        style={{ background: 'var(--wq-surface-2)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${((qi) / questions.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--wq-primary), var(--wq-accent))',
          }} />
      </div>

      {/* Question card */}
      <div className="rounded-3xl p-8 mb-6"
        style={{
          background: 'var(--wq-surface)',
          border: `1px solid ${feedback === 'correct' ? 'var(--wq-accent)' : feedback === 'wrong' ? 'var(--wq-warn)' : 'var(--wq-border)'}`,
          boxShadow: feedback === 'correct' ? '0 0 24px var(--wq-accent-dim)' : feedback === 'wrong' ? '0 0 24px var(--wq-warn-dim)' : 'none',
          transition: 'all 0.3s',
        }}>

        {q.mode === 'quiz' && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--wq-text-faint)' }}>
              Bu kelimenin Türkçe karşılığı nedir?
            </p>
            <div className="text-4xl font-extrabold mb-8">{q.word.english}</div>

            <div className="grid grid-cols-2 gap-3">
              {q.options!.map((opt, idx) => {
                const isCorrectOpt = idx === q.correctIndex
                const isSelected   = idx === selected
                let borderColor    = 'var(--wq-border)'
                let bg             = 'var(--wq-surface-2)'
                let color          = 'var(--wq-text)'

                if (answered) {
                  if (isCorrectOpt) { borderColor = 'var(--wq-accent)'; bg = 'var(--wq-accent-dim)'; color = 'var(--wq-accent)' }
                  else if (isSelected) { borderColor = 'var(--wq-warn)'; bg = 'var(--wq-warn-dim)'; color = 'var(--wq-warn)' }
                }

                return (
                  <button key={idx}
                    onClick={() => handleQuizSelect(idx)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: bg, border: `1px solid ${borderColor}`, color }}>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {q.mode === 'fill_blank' && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--wq-text-faint)' }}>
              Boşluğu İngilizce doldurun
            </p>
            <div className="text-sm mb-6 leading-relaxed px-4 py-3 rounded-xl"
              style={{ background: 'var(--wq-surface-2)', color: 'var(--wq-text)', fontStyle: 'italic' }}>
              {q.sentence}
            </div>
            <div className="text-xs mb-2" style={{ color: 'var(--wq-text-faint)' }}>
              Türkçe karşılığı: <strong style={{ color: 'var(--wq-text-muted)' }}>{q.word.turkish}</strong>
            </div>

            <div className="flex gap-3">
              <input
                value={fillInput}
                onChange={e => setFillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !answered && handleFillSubmit()}
                disabled={answered}
                placeholder="İngilizce kelimeyi yaz…"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-sm"
                style={{
                  background: 'var(--wq-surface-2)',
                  border: `1px solid ${answered ? (feedback === 'correct' ? 'var(--wq-accent)' : 'var(--wq-warn)') : 'var(--wq-border)'}`,
                  color: 'var(--wq-text)',
                }}
              />
              {!answered && (
                <button onClick={handleFillSubmit}
                  className="px-5 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'var(--wq-primary)', color: '#fff' }}>
                  Kontrol
                </button>
              )}
            </div>

            {answered && feedback === 'wrong' && (
              <p className="mt-3 text-sm" style={{ color: 'var(--wq-warn)' }}>
                Doğru cevap: <strong>{q.word.english}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Feedback + Next */}
      {answered && (
        <div className="flex items-center justify-between wq-animate-in">
          <div className="flex items-center gap-3">
            {feedback === 'correct'
              ? <span className="text-sm font-semibold" style={{ color: 'var(--wq-accent)' }}>✓ Doğru! +10 XP</span>
              : <span className="text-sm font-semibold" style={{ color: 'var(--wq-warn)' }}>✗ Yanlış</span>
            }
          </div>
          <button onClick={handleNext}
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'var(--wq-primary)', color: '#fff' }}>
            {qi + 1 < questions.length ? 'Sonraki →' : 'Tamamla ✓'}
          </button>
        </div>
      )}

      {/* Score mini */}
      <div className="flex justify-center gap-8 mt-6 text-sm" style={{ color: 'var(--wq-text-muted)' }}>
        <span style={{ color: 'var(--wq-accent)' }}>✅ {correct}</span>
        <span style={{ color: 'var(--wq-warn)' }}>❌ {wrong}</span>
      </div>
    </div>
  )
}
