import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LEVEL_ORDER } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: progressStats } = await supabase
    .from('word_progress')
    .select('status, repeat_count')
    .eq('user_id', user!.id)

  const learned  = progressStats?.filter(p => p.status === 'learned').length  ?? 0
  const learning = progressStats?.filter(p => p.status === 'learning').length ?? 0
  const total    = progressStats?.length ?? 0

  const { data: dueWords } = await supabase
    .from('word_progress')
    .select('id')
    .eq('user_id', user!.id)
    .lte('next_review_date', new Date().toISOString())
    .neq('status', 'learned')

  const dueCount = dueWords?.length ?? 0

  return (
    <div className="max-w-5xl mx-auto wq-animate-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1">
          Merhaba, {profile?.full_name?.split(' ')[0] ?? 'Kahraman'} 👋
        </h1>
        <p style={{ color: 'var(--wq-text-muted)' }}>
          {dueCount > 0
            ? `${dueCount} kelimen tekrar bekliyor.`
            : 'Harika, bugün her şey tamamdır!'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Öğrenilen', value: learned,  icon: '✅', color: 'var(--wq-accent)' },
          { label: 'Öğreniliyor', value: learning, icon: '📖', color: 'var(--wq-primary)' },
          { label: 'Tekrar Bekleyen', value: dueCount, icon: '⏰', color: 'var(--wq-gold)' },
          { label: 'Toplam XP', value: profile?.total_xp ?? 0, icon: '⚡', color: 'var(--wq-warn)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--wq-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Streak */}
      <div className="rounded-2xl p-6 mb-10 flex items-center gap-6"
        style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
        <div className="text-5xl">🔥</div>
        <div>
          <div className="text-3xl font-extrabold">{profile?.streak_count ?? 0} Gün</div>
          <div style={{ color: 'var(--wq-text-muted)' }}>Çalışma serisi</div>
        </div>
        <div className="ml-auto">
          <Link href="/dashboard/study"
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--wq-primary)', color: '#fff' }}>
            Çalışmaya Başla →
          </Link>
        </div>
      </div>

      {/* Level progress */}
      <h2 className="text-lg font-semibold mb-4">Seviye İlerlemesi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {LEVEL_ORDER.map(lvl => {
          const isCurrent = profile?.current_level === lvl
          return (
            <div key={lvl}
              className={`rounded-xl p-4 text-center border transition-all ${isCurrent ? 'scale-105' : ''}`}
              style={{
                background: isCurrent ? 'var(--wq-primary-glow)' : 'var(--wq-surface)',
                borderColor: isCurrent ? 'var(--wq-primary)' : 'var(--wq-border)',
              }}>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 level-${lvl.toLowerCase()}`}>
                {lvl}
              </div>
              {isCurrent && (
                <div className="text-xs" style={{ color: 'var(--wq-primary)' }}>Mevcut</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
