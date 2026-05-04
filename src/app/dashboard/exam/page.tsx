'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Word, Level } from '@/types'
import { buildQuizOptions, createFillBlank, shuffleArray, PASSING_SCORE, getNextLevel } from '@/lib/utils'

type ExamQuestion = {
  word: Word
  type: 'quiz' | 'fill_blank'
  options?: string[]
  correctIndex?: number
  sentence?: string
}

export default function ExamPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [loading, setLoading]     = useState(true)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [level, setLevel]         = useState<Level>('A1')
  const [userId, setUserId]       = useState('')
  const [qi, setQi]               = useState(0)
  const [answers, setAnswers]     = useState<boolean[]>([])
  const [selected, setSelected]   = useState<number | null>(null)
  const [fillInput, setFillInput] = useState('')
  const [answered, setAnswered]   = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore]         = useState(0)

  useEffect(() => {
    async function loadExam() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('users').select('current_level').eq('id', user.id).single()

      const lvl: Level = profile?.current_level ?? 'A1'
      setLevel(lvl)

      // Get all learned words for this level
      const { data: progress } = await supabase
        .from('word_progress')
        .select('*, words(*)')
        .eq('user_id', user.id)
        .eq('status', 'learned')
        .filter('words.level', 'eq', lvl)
        .limit(40)

      if (!progress || progress.length < 10) {
        setLoading(false)
        return
      }

      const words: Word[] = progress.map((p: any) => p.words).filter(Boolean)
      const allTurkish    = words.map(w => w.turkish)
      const sample        = shuffleArray(words).slice(0, 20)

      const qs: ExamQuestion[] = sample.map((word, i) => {
        if (i % 2 === 0) {
          const { options, correct_index } = buildQuizOptions(word.turkish, allTurkish)
          return { word, type: 'quiz', options, correctIndex: correct_index }
        } else {
          const sentence = word.example_sentences?.[0] ?? `Use ${word.english} in a sentence.`
          return { word, type: 'fill_blank', sentence: createFillBlank(sentence, word.english) }
        }
      })

      setQuestions(qs)
      setLoading(false)
    }

    loadExam()
  }, [])

  function handleSelect(idx: number) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const correct = idx === questions[qi].correctIndex
    setAnswers(prev => [...prev, correct])
  }

  function handleFillSubmit() {
    if (answered) return
    const correct = fillInput.trim().toLowerCase() === questions[qi].word.english.toLowerCase()
    setAnswered(true)
    setAnswers(prev => [...prev, correct])
  }

  async function handleNext() {
    const nextQi = qi + 1

    if (nextQi >= questions.length) {
      // Calculate score
      const correctCount = [...answers].filter(Boolean).length
      const finalScore   = Math.round((correctCount / questions.length) * 100)
      setScore(finalScore)
      setShowResult(true)

      const passed = finalScore >= PASSING_SCORE

      // Save exam result
      await supabase.from('level_exams').insert({
        user_id: userId,
        level,
        score:   finalScore,
        passed,
      })

      // If passed, advance level
      if (passed) {
        const nextLevel = getNextLevel(level)
        if (nextLevel) {
          await supabase.from('users')
            .update({ current_level: nextLevel })
            .eq('id', userId)

          // Save achievement
          await supabase.from('achievements').upsert({
            user_id:   userId,
            badge_key: `level_${level.toLowerCase()}_passed`,
          }, { onConflict: 'user_id,badge_key' })
        }
      }
      return
    }

    setQi(nextQi)
    setSelected(null)
    setFillInput('')
    setAnswered(false)
  }

  const q = questions[qi]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64"
        style={{ color: 'var(--wq-text-muted)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p>Sınav hazırlanıyor…</p>
        </div>
      </div>
    )
  }

  if (questions.length < 10) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 wq-animate-in">
        <div className="text-6xl mb-6">📚</div>
        <h2 className="text-xl font-bold mb-3">Henüz yeterli kelime yok</h2>
        <p className="mb-6" style={{ color: 'var(--wq-text-muted)' }}>
          Seviye sınavına girebilmek için en az 10 kelime öğrenmen gerekiyor.
        </p>
        <button onClick={() => router.push('/dashboard/study')}
          className="px-6 py-3 rounded-xl font-semibold"
          style={{ background: 'var(--wq-primary)', color: '#fff' }}>
          Çalışmaya Devam Et →
        </button>
      </div>
    )
  }

  if (showResult) {
    const passed = score >= PASSING_SCORE
    return (
      <div className="max-w-md mx-auto text-center py-12 wq-animate-in">
        <div className="text-7xl mb-6">{passed ? '🎓' : '💪'}</div>
        <h2 className="text-3xl font-extrabold mb-2">
          {passed ? 'Tebrikler!' : 'Tekrar Dene'}
        </h2>
        <div className="text-6xl font-extrabold my-6"
          style={{ color: passed ? 'var(--wq-accent)' : 'var(--wq-warn)' }}>
          {score}
          <span className="text-2xl" style={{ color: 'var(--wq-text-muted)' }}>/100</span>
        </div>

        <p className="mb-8" style={{ color: 'var(--wq-text-muted)' }}>
          {passed
            ? `${level} seviyesini geçtin! Bir sonraki seviyeye yükseltiliyorsun.`
            : `Geçme notu ${PASSING_SCORE}. Biraz daha çalış ve tekrar dene!`
          }
        </p>

        <div className="flex gap-3 justify-center">
          {passed ? (
            <button onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ background: 'var(--wq-accent)', color: '#000' }}>
              Ana Sayfaya Git →
            </button>
          ) : (
            <button onClick={() => router.push('/dashboard/study')}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ background: 'var(--wq-primary)', color: '#fff' }}>
              Tekrar Çalış →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto wq-animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">📝 {level} Seviye Sınavı</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--wq-text-muted)' }}>
            Geçme notu: {PASSING_SCORE}/100
          </p>
        </div>
        <div className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
          {qi + 1} / {questions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 rounded-full mb-8 overflow-hidden"
        style={{ background: 'var(--wq-surface-2)' }}>
        <div className="h-full rounded-full transition-all"
          style={{
            width: `${(qi / questions.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--wq-gold), var(--wq-warn))',
          }} />
      </div>

      {/* Question */}
      <div className="rounded-3xl p-8"
        style={{
          background: 'var(--wq-surface)',
          border: `1px solid ${answered ? (answers[answers.length - 1] ? 'var(--wq-accent)' : 'var(--wq-warn)') : 'var(--wq-border)'}`,
        }}>

        {q.type === 'quiz' && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--wq-text-faint)' }}>
              Türkçe karşılığı nedir?
            </p>
            <div className="text-4xl font-extrabold mb-8">{q.word.english}</div>
            <div className="grid grid-cols-2 gap-3">
              {q.options!.map((opt, idx) => {
                let borderColor = 'var(--wq-border)'
                let bg = 'var(--wq-surface-2)'
                let color = 'var(--wq-text)'
                if (answered) {
                  if (idx === q.correctIndex) { borderColor = 'var(--wq-accent)'; bg = 'var(--wq-accent-dim)'; color = 'var(--wq-accent)' }
                  else if (idx === selected)  { borderColor = 'var(--wq-warn)'; bg = 'var(--wq-warn-dim)'; color = 'var(--wq-warn)' }
                }
                return (
                  <button key={idx} onClick={() => handleSelect(idx)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                    style={{ background: bg, border: `1px solid ${borderColor}`, color }}>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {q.type === 'fill_blank' && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--wq-text-faint)' }}>
              Boşluğu İngilizce doldurun
            </p>
            <div className="text-sm mb-6 px-4 py-3 rounded-xl italic"
              style={{ background: 'var(--wq-surface-2)', color: 'var(--wq-text-muted)' }}>
              {q.sentence}
            </div>
            <div className="text-xs mb-3" style={{ color: 'var(--wq-text-faint)' }}>
              İpucu: {q.word.turkish}
            </div>
            <div className="flex gap-3">
              <input value={fillInput} onChange={e => setFillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !answered && handleFillSubmit()}
                disabled={answered} placeholder="Cevabınızı yazın…"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-sm"
                style={{
                  background: 'var(--wq-surface-2)',
                  border: `1px solid ${answered ? (answers[answers.length - 1] ? 'var(--wq-accent)' : 'var(--wq-warn)') : 'var(--wq-border)'}`,
                  color: 'var(--wq-text)',
                }} />
              {!answered && (
                <button onClick={handleFillSubmit}
                  className="px-5 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'var(--wq-primary)', color: '#fff' }}>
                  Kontrol
                </button>
              )}
            </div>
            {answered && !answers[answers.length - 1] && (
              <p className="mt-3 text-sm" style={{ color: 'var(--wq-warn)' }}>
                Doğru: <strong>{q.word.english}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {answered && (
        <div className="mt-6 flex items-center justify-between wq-animate-in">
          <span className="text-sm font-semibold"
            style={{ color: answers[answers.length - 1] ? 'var(--wq-accent)' : 'var(--wq-warn)' }}>
            {answers[answers.length - 1] ? '✓ Doğru!' : '✗ Yanlış'}
          </span>
          <button onClick={handleNext}
            className="px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--wq-primary)', color: '#fff' }}>
            {qi + 1 < questions.length ? 'Sonraki →' : 'Sonucu Gör'}
          </button>
        </div>
      )}
    </div>
  )
}
