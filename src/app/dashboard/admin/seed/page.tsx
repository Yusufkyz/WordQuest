'use client'

import { useState } from 'react'
import type { Level } from '@/types'
import { LEVEL_ORDER } from '@/lib/utils'

interface SeedResult {
  level: Level
  seeded: number
  results: Array<{ word: string; status: string }>
}

export default function AdminSeedPage() {
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState<SeedResult[]>([])
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1')
  const [limit, setLimit]       = useState(10)

  async function handleSeed() {
    setLoading(true)
    try {
      const res = await fetch('/api/seed-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: selectedLevel, limit }),
      })
      const data = await res.json()
      setResults(prev => [{ level: selectedLevel, ...data }, ...prev])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSeedAll() {
    setLoading(true)
    for (const lvl of LEVEL_ORDER) {
      try {
        const res = await fetch('/api/seed-words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: lvl, limit }),
        })
        const data = await res.json()
        setResults(prev => [{ level: lvl, ...data }, ...prev])
      } catch (e) {
        console.error(e)
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto wq-animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">🛠️ Kelime Seed Paneli</h1>
        <p className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
          Claude API ile veritabanına kelime ekle. Her kelime için tam içerik üretilir.
        </p>
      </div>

      <div className="rounded-2xl p-6 mb-6"
        style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Level selector */}
          <div>
            <label className="block text-sm font-medium mb-2"
              style={{ color: 'var(--wq-text-muted)' }}>Seviye</label>
            <div className="flex gap-2 flex-wrap">
              {LEVEL_ORDER.map(lvl => (
                <button key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all level-${lvl.toLowerCase()}`}
                  style={{ opacity: selectedLevel === lvl ? 1 : 0.4 }}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium mb-2"
              style={{ color: 'var(--wq-text-muted)' }}>Kelime Sayısı: {limit}</label>
            <input type="range" min={5} max={50} step={5}
              value={limit} onChange={e => setLimit(Number(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSeed} disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--wq-primary)', color: '#fff' }}>
            {loading ? '⏳ İşleniyor…' : `${selectedLevel} Ekle (${limit} kelime)`}
          </button>
          <button onClick={handleSeedAll} disabled={loading}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--wq-surface-2)', border: '1px solid var(--wq-border)', color: 'var(--wq-text)' }}>
            Tümünü Ekle
          </button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-3 text-sm"
            style={{ color: 'var(--wq-text-muted)' }}>
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--wq-primary)', borderTopColor: 'transparent' }} />
            Claude API ile kelime içerikleri üretiliyor… ({limit} kelime ≈ {limit * 2}s)
          </div>
        )}
      </div>

      {/* Results */}
      {results.map((r, i) => (
        <div key={i} className="rounded-2xl p-5 mb-4"
          style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border level-${r.level.toLowerCase()}`}>
                {r.level}
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--wq-accent)' }}>
                {r.seeded} kelime eklendi
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {r.results?.map((res, j) => (
              <span key={j}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: res.status === 'ok' ? 'var(--wq-accent-dim)' : 'var(--wq-warn-dim)',
                  color: res.status === 'ok' ? 'var(--wq-accent)' : 'var(--wq-warn)',
                }}>
                {res.word}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
