import { createClient } from '@/lib/supabase/server'
import StudySession from '@/components/study/StudySession'
import Link from 'next/link'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users').select('current_level').eq('id', user!.id).single()

  const now = new Date().toISOString()

  const { data: dueProgress } = await supabase
    .from('word_progress')
    .select('*, words(*)')
    .eq('user_id', user!.id)
    .neq('status', 'learned')
    .lte('next_review_date', now)
    .order('next_review_date', { ascending: true })
    .limit(30)

  if (!dueProgress || dueProgress.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 wq-animate-in">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold mb-3">Tekrar gereken kelime yok!</h2>
        <p className="mb-8" style={{ color: 'var(--wq-text-muted)' }}>
          Tüm kelimeler zamanında tekrar edildi. Yeni kelimeler öğrenmek ister misin?
        </p>
        <Link href="/dashboard/study"
          className="px-6 py-3 rounded-xl font-semibold"
          style={{ background: 'var(--wq-primary)', color: '#fff' }}>
          Yeni Kelimeler →
        </Link>
      </div>
    )
  }

  const words = dueProgress.map((p: any) => ({
    ...p.words,
    progress: {
      id:               p.id,
      user_id:          p.user_id,
      word_id:          p.word_id,
      repeat_count:     p.repeat_count,
      difficulty:       p.difficulty,
      status:           p.status,
      correct_count:    p.correct_count,
      wrong_count:      p.wrong_count,
      next_review_date: p.next_review_date,
      last_reviewed_at: p.last_reviewed_at,
      created_at:       p.created_at,
    },
  }))

  return (
    <div>
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🔄</span>
          <h1 className="text-2xl font-bold">Tekrar Modu</h1>
        </div>
        <p style={{ color: 'var(--wq-text-muted)' }}>
          {dueProgress.length} kelime tekrar bekliyor.
          Spaced repetition ile hafızanı pekiştir.
        </p>
      </div>

      <StudySession
        words={words}
        userId={user!.id}
        level={profile?.current_level ?? 'A1'}
      />
    </div>
  )
}
