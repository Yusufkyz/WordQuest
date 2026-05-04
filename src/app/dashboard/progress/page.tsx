import { createClient } from '@/lib/supabase/server'
import { LEVEL_ORDER } from '@/lib/utils'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Word progress stats
  const { data: allProgress } = await supabase
    .from('word_progress')
    .select('*, words(level)')
    .eq('user_id', user!.id)

  // Sessions last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: sessions } = await supabase
    .from('review_sessions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('started_at', sevenDaysAgo.toISOString())
    .order('started_at', { ascending: true })

  // Exam history
  const { data: exams } = await supabase
    .from('level_exams')
    .select('*')
    .eq('user_id', user!.id)
    .order('taken_at', { ascending: false })

  // Achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user!.id)

  // Per-level breakdown
  const levelStats = LEVEL_ORDER.map(lvl => {
    const lvlProgress = allProgress?.filter((p: any) => p.words?.level === lvl) ?? []
    return {
      level:    lvl,
      total:    lvlProgress.length,
      learned:  lvlProgress.filter(p => p.status === 'learned').length,
      learning: lvlProgress.filter(p => p.status === 'learning').length,
    }
  })

  // Weekly activity (words studied per day)
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const dayActivity = weekDays.map(day => {
    const daySessions = sessions?.filter(s => s.started_at.startsWith(day)) ?? []
    const total = daySessions.reduce((sum, s) => sum + s.correct_count + s.wrong_count, 0)
    return { day: day.slice(5), count: total }
  })

  const maxActivity = Math.max(...dayActivity.map(d => d.count), 1)

  return (
    <div className="max-w-4xl mx-auto wq-animate-in">
      <h1 className="text-2xl font-bold mb-8">İlerleme Raporu</h1>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Toplam XP',      value: profile?.total_xp ?? 0,    icon: '⚡', color: 'var(--wq-gold)'    },
          { label: 'Günlük Seri',    value: `${profile?.streak_count ?? 0} gün`, icon: '🔥', color: 'var(--wq-warn)' },
          { label: 'Öğrenilen',      value: allProgress?.filter(p => p.status === 'learned').length ?? 0, icon: '✅', color: 'var(--wq-accent)' },
          { label: 'Tamamlanan Sınav', value: exams?.filter(e => e.passed).length ?? 0, icon: '🎓', color: 'var(--wq-primary)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--wq-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly activity bar chart */}
      <section className="rounded-2xl p-6 mb-8"
        style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
        <h2 className="text-base font-semibold mb-6">📅 Haftalık Aktivite</h2>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {dayActivity.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.round((d.count / maxActivity) * 100)}px`,
                  minHeight: d.count > 0 ? 8 : 4,
                  background: d.count > 0
                    ? 'linear-gradient(180deg, var(--wq-primary), var(--wq-accent))'
                    : 'var(--wq-surface-2)',
                  opacity: d.count > 0 ? 1 : 0.4,
                }}
              />
              <span className="text-xs" style={{ color: 'var(--wq-text-faint)' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Per-level breakdown */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-4">🏅 Seviye Bazında İlerleme</h2>
        <div className="space-y-3">
          {levelStats.map(ls => {
            const pct = ls.total > 0 ? Math.round((ls.learned / ls.total) * 100) : 0
            const isCurrent = profile?.current_level === ls.level
            return (
              <div key={ls.level} className="rounded-2xl p-5"
                style={{
                  background: 'var(--wq-surface)',
                  border: `1px solid ${isCurrent ? 'var(--wq-primary)' : 'var(--wq-border)'}`,
                }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border level-${ls.level.toLowerCase()}`}>
                      {ls.level}
                    </span>
                    {isCurrent && (
                      <span className="text-xs" style={{ color: 'var(--wq-primary)' }}>← Şu an</span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>
                    {ls.learned} / {ls.total} · %{pct}
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--wq-surface-2)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, var(--wq-primary), var(--wq-accent))',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Exam history */}
      {exams && exams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-4">📝 Sınav Geçmişi</h2>
          <div className="space-y-2">
            {exams.map(e => (
              <div key={e.id}
                className="flex items-center justify-between px-5 py-3 rounded-xl"
                style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border level-${e.level.toLowerCase()}`}>
                    {e.level}
                  </span>
                  <span className="text-sm font-semibold">{e.score} / 100</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--wq-text-faint)' }}>
                    {new Date(e.taken_at).toLocaleDateString('tr-TR')}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    e.passed ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                  }`}>
                    {e.passed ? '✓ Geçti' : '✗ Kaldı'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-4">🏆 Rozetler</h2>
          <div className="flex flex-wrap gap-3">
            {achievements.map(a => (
              <div key={a.id}
                className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                style={{ background: 'var(--wq-gold-dim)', border: '1px solid rgba(255,209,102,0.3)' }}>
                <span style={{ color: 'var(--wq-gold)' }}>{a.badge_key}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
