'use client'

import { useState, useEffect } from 'react'
import type { WordWithProgress } from '@/types'
import WordDetailPanel from './WordDetailPanel'

interface Props {
  word: WordWithProgress
  onKnow: () => void
  onDontKnow: () => void
}

const CONTEXT_LABELS: Record<string, string> = {
  formal:   '🎩 Resmi',
  informal: '😊 Günlük',
  written:  '✍️ Yazılı',
  spoken:   '🗣️ Sözlü',
}

export default function FlashCard({ word, onKnow, onDontKnow }: Props) {
  const [flipped, setFlipped]       = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    setFlipped(false)
    setShowDetail(false)
  }, [word.id])

  const repeatLeft = word.progress?.repeat_count ?? 7

  return (
    <div>
      {/* Repeat indicator */}
      <div className="flex justify-center gap-1.5 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i}
            className="h-1.5 w-6 rounded-full transition-all"
            style={{
              background: i < (7 - repeatLeft)
                ? 'var(--wq-accent)'
                : 'var(--wq-border)',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className="w-full rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none"
        style={{
          minHeight: 300,
          padding: '40px 32px',
          background: 'var(--wq-surface)',
          border: `1px solid ${flipped ? 'var(--wq-primary)' : 'var(--wq-border)'}`,
          boxShadow: flipped ? '0 8px 40px var(--wq-primary-glow)' : '0 8px 40px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}>

        {!flipped ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{
              width: 96, height: 96, borderRadius: 16, marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, background: 'var(--wq-surface-2)'
            }}>
              📝
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>{word.english}</div>
            {word.context_tag && (
              <div style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 999, marginBottom: 16,
                background: 'var(--wq-surface-2)', color: 'var(--wq-text-muted)'
              }}>
                {CONTEXT_LABELS[word.context_tag] ?? word.context_tag}
              </div>
            )}
            <div style={{ fontSize: 14, color: 'var(--wq-text-faint)' }}>
              Türkçe anlamını görmek için tıkla
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--wq-text-muted)' }}>
              {word.english}
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 24, color: 'var(--wq-accent)' }}>
              {word.turkish}
            </div>
            {word.example_sentences?.[0] && (
              <div style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                background: 'var(--wq-surface-2)', color: 'var(--wq-text-muted)',
                fontSize: 14, fontStyle: 'italic'
              }}>
                "{word.example_sentences[0]}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {flipped && (
        <div style={{ marginTop: 24, animation: 'wq-slide-up 0.3s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} style={{
                padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                border: '1px solid var(--wq-border)', color: 'var(--wq-text-muted)',
                background: 'transparent', cursor: 'pointer'
              }}>
                {d === 'easy' ? '😊 Kolay' : d === 'medium' ? '🤔 Orta' : '😤 Zor'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={onDontKnow} style={{
              flex: 1, padding: '16px', borderRadius: 16, fontSize: 18, fontWeight: 600,
              background: 'var(--wq-warn-dim)', border: '1px solid var(--wq-warn)',
              color: 'var(--wq-warn)', cursor: 'pointer'
            }}>
              ✗ Bilmiyorum
            </button>
            <button onClick={onKnow} style={{
              flex: 1, padding: '16px', borderRadius: 16, fontSize: 18, fontWeight: 600,
              background: 'var(--wq-accent-dim)', border: '1px solid var(--wq-accent)',
              color: 'var(--wq-accent)', cursor: 'pointer'
            }}>
              ✓ Biliyorum
            </button>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={() => setShowDetail(v => !v)} style={{
              fontSize: 14, color: 'var(--wq-text-faint)',
              textDecoration: 'underline', background: 'none',
              border: 'none', cursor: 'pointer'
            }}>
              {showDetail ? 'Detayları gizle ▲' : 'Daha fazla detay ▼'}
            </button>
          </div>
        </div>
      )}

      {showDetail && flipped && <WordDetailPanel word={word} />}
    </div>
  )
}