'use client'

import { useState, useEffect } from 'react'
import type { WordWithProgress } from '@/types'

interface Props {
  word: WordWithProgress
}

interface ExplanationData {
  explanation: string
  memory_tip: string
  common_mistakes: string[]
  example_sentences: Array<{ english: string; turkish: string }>
  dialog: { turns: Array<{ speaker: string; english: string; turkish: string }> }
}

export default function WordDetailPanel({ word }: Props) {
  const [tab, setTab] = useState<'info' | 'explain'>('info')
  const [explanation, setExplanation] = useState<ExplanationData | null>(null)
  const [loadingExplain, setLoadingExplain] = useState(false)

  async function loadExplanation() {
    if (explanation || loadingExplain) return
    setLoadingExplain(true)
    try {
      const res = await fetch('/api/word-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word:        word.english,
          turkish:     word.turkish,
          wrong_count: word.progress?.wrong_count ?? 0,
          level:       word.level,
        }),
      })
      const json = await res.json()
      setExplanation(json.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingExplain(false)
    }
  }

  return (
    <div className="mt-4 rounded-2xl overflow-hidden wq-animate-in"
      style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--wq-border)' }}>
        {([
          { key: 'info',    label: '📖 Bilgi'       },
          { key: 'explain', label: '🧠 Açıklama'    },
        ] as const).map(t => (
          <button key={t.key}
            onClick={() => {
              setTab(t.key)
              if (t.key === 'explain') loadExplanation()
            }}
            className="flex-1 py-3 text-sm font-medium transition-all"
            style={{
              color: tab === t.key ? 'var(--wq-primary)' : 'var(--wq-text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--wq-primary)' : '2px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'info' && (
          <div className="space-y-4">
            {/* Examples */}
            {word.example_sentences && word.example_sentences.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--wq-text-faint)' }}>Örnek Cümleler</h4>
                <ul className="space-y-2">
                  {word.example_sentences.map((s, i) => (
                    <li key={i} className="text-sm px-3 py-2 rounded-xl"
                      style={{ background: 'var(--wq-surface-2)', color: 'var(--wq-text-muted)', fontStyle: 'italic' }}>
                      "{s}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Word family */}
            {word.word_family && word.word_family.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--wq-text-faint)' }}>Kelime Ailesi</h4>
                <div className="flex flex-wrap gap-2">
                  {word.word_family.map(w => (
                    <span key={w} className="px-3 py-1 rounded-full text-xs font-mono"
                      style={{ background: 'var(--wq-primary-glow)', color: 'var(--wq-primary)' }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-2 gap-4">
              {word.synonyms && word.synonyms.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: 'var(--wq-text-faint)' }}>Eş Anlamlı</h4>
                  <div className="flex flex-wrap gap-1">
                    {word.synonyms.map(s => (
                      <span key={s} className="px-2 py-1 rounded-full text-xs"
                        style={{ background: 'var(--wq-accent-dim)', color: 'var(--wq-accent)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms && word.antonyms.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: 'var(--wq-text-faint)' }}>Zıt Anlamlı</h4>
                  <div className="flex flex-wrap gap-1">
                    {word.antonyms.map(a => (
                      <span key={a} className="px-2 py-1 rounded-full text-xs"
                        style={{ background: 'var(--wq-warn-dim)', color: 'var(--wq-warn)' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Collocations */}
            {word.collocations && word.collocations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--wq-text-faint)' }}>Sık Kullanılan Kalıplar</h4>
                <div className="flex flex-wrap gap-2">
                  {word.collocations.map(c => (
                    <span key={c} className="px-3 py-1 rounded-full text-xs"
                      style={{ background: 'var(--wq-gold-dim)', color: 'var(--wq-gold)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dialog */}
            {word.dialog_example && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--wq-text-faint)' }}>Diyalog Örneği</h4>
                <pre className="text-xs px-4 py-3 rounded-xl whitespace-pre-wrap leading-relaxed font-mono"
                  style={{ background: 'var(--wq-surface-2)', color: 'var(--wq-text-muted)' }}>
                  {word.dialog_example}
                </pre>
              </div>
            )}
          </div>
        )}

        {tab === 'explain' && (
          <div>
            {loadingExplain && (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">🧠</div>
                <p className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
                  Claude açıklama hazırlıyor…
                </p>
              </div>
            )}

            {explanation && (
              <div className="space-y-4 wq-animate-in">
                <div className="p-4 rounded-xl"
                  style={{ background: 'var(--wq-surface-2)' }}>
                  <p className="text-sm leading-relaxed">{explanation.explanation}</p>
                </div>

                <div className="p-4 rounded-xl"
                  style={{ background: 'var(--wq-gold-dim)', border: '1px solid rgba(255,209,102,0.3)' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--wq-gold)' }}>
                    💡 Hatırlatma İpucu
                  </p>
                  <p className="text-sm">{explanation.memory_tip}</p>
                </div>

                {explanation.common_mistakes?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: 'var(--wq-text-faint)' }}>Yaygın Hatalar</h4>
                    <ul className="space-y-1">
                      {explanation.common_mistakes.map((m, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span style={{ color: 'var(--wq-warn)' }}>⚠</span>
                          <span style={{ color: 'var(--wq-text-muted)' }}>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.dialog?.turns && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: 'var(--wq-text-faint)' }}>Diyalog</h4>
                    <div className="space-y-2">
                      {explanation.dialog.turns.map((t, i) => (
                        <div key={i} className={`flex gap-3 ${t.speaker === 'B' ? 'flex-row-reverse' : ''}`}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: t.speaker === 'A' ? 'var(--wq-primary-glow)' : 'var(--wq-accent-dim)',
                                     color: t.speaker === 'A' ? 'var(--wq-primary)' : 'var(--wq-accent)' }}>
                            {t.speaker}
                          </div>
                          <div className={`max-w-xs px-3 py-2 rounded-xl text-xs ${t.speaker === 'B' ? 'text-right' : ''}`}
                            style={{ background: 'var(--wq-surface-2)' }}>
                            <div className="font-medium mb-0.5">{t.english}</div>
                            <div style={{ color: 'var(--wq-text-faint)' }}>{t.turkish}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
