'use client'

import Link from 'next/link'
import type { Level } from '@/types'

interface Props {
  stats: { correct: number; wrong: number; xp: number }
  totalWords: number
  level: Level
}

export default function SessionComplete({ stats, totalWords, level }: Props) {
  const accuracy = totalWords > 0
    ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
    : 0

  return (
    <div className="max-w-md mx-auto text-center py-12 wq-animate-in">
      <div className="text-7xl mb-6">
        {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎯' : '💪'}
      </div>

      <h2 className="text-3xl font-extrabold mb-2">Oturum Tamamlandı!</h2>
      <p className="mb-8" style={{ color: 'var(--wq-text-muted)' }}>
        {level} seviyesinde harika bir çalışma seansı.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Doğruluk', value: `%${accuracy}`, color: 'var(--wq-accent)' },
          { label: 'Kazanılan XP', value: `+${stats.xp}`, color: 'var(--wq-gold)' },
          { label: 'Toplam Kelime', value: totalWords, color: 'var(--wq-primary)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--wq-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/dashboard/study"
          className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--wq-primary)', color: '#fff' }}>
          Devam Et →
        </Link>
        <Link href="/dashboard"
          className="px-6 py-3 rounded-xl font-semibold"
          style={{ border: '1px solid var(--wq-border)', color: 'var(--wq-text-muted)' }}>
          Ana Sayfa
        </Link>
      </div>
    </div>
  )
}
