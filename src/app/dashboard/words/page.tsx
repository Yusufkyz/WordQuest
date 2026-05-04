import { createClient } from '@/lib/supabase/server'

export default async function WordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: progress } = await supabase
    .from('word_progress')
    .select(`
      *,
      words (*)
    `)
    .eq('user_id', user!.id)
    .order('last_reviewed_at', { ascending: false })

  const learned  = progress?.filter(p => p.status === 'learned')  ?? []
  const learning = progress?.filter(p => p.status === 'learning') ?? []
  const hardWords = progress?.filter(p => p.wrong_count >= 3).sort((a, b) => b.wrong_count - a.wrong_count) ?? []

  return (
    <div className="max-w-4xl mx-auto wq-animate-in">
      <h1 className="text-2xl font-bold mb-8">Kelimelerim</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Öğrenilen', count: learned.length,  icon: '✅', color: 'var(--wq-accent)'   },
          { label: 'Öğreniliyor', count: learning.length, icon: '📖', color: 'var(--wq-primary)'  },
          { label: 'Zor Kelimeler', count: hardWords.length, icon: '⚠️', color: 'var(--wq-warn)'    },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-extrabold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--wq-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hard words */}
      {hardWords.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">⚠️ En Çok Zorlandıklarım</h2>
          <div className="space-y-2">
            {hardWords.slice(0, 10).map(p => (
              <div key={p.id}
                className="flex items-center justify-between px-5 py-3 rounded-xl"
                style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
                <div>
                  <span className="font-semibold mr-3">{(p.words as any)?.english}</span>
                  <span className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
                    {(p.words as any)?.turkish}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--wq-text-faint)' }}>
                  <span style={{ color: 'var(--wq-warn)' }}>❌ {p.wrong_count} yanlış</span>
                  <span className={`px-2 py-0.5 rounded-full border level-${(p.words as any)?.level?.toLowerCase()}`}>
                    {(p.words as any)?.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Learned words */}
      {learned.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">✅ Öğrenilenler ({learned.length})</h2>
          <div className="flex flex-wrap gap-2">
            {learned.map(p => (
              <span key={p.id}
                className="px-3 py-1.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--wq-accent-dim)', color: 'var(--wq-accent)', border: '1px solid rgba(0,212,170,0.3)' }}>
                {(p.words as any)?.english}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Learning */}
      {learning.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">📖 Öğrenilenler ({learning.length})</h2>
          <div className="space-y-2">
            {learning.map(p => (
              <div key={p.id}
                className="flex items-center justify-between px-5 py-3 rounded-xl"
                style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
                <div>
                  <span className="font-semibold mr-3">{(p.words as any)?.english}</span>
                  <span className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
                    {(p.words as any)?.turkish}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* 7-repeat dots */}
                  <div className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: i < (7 - p.repeat_count) ? 'var(--wq-accent)' : 'var(--wq-border)' }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {progress?.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--wq-text-muted)' }}>
          <div className="text-5xl mb-4">📭</div>
          <p>Henüz kelime çalışmadın. Hadi başlayalım!</p>
        </div>
      )}
    </div>
  )
}
