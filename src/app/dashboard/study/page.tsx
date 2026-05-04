import { createClient } from '@/lib/supabase/server'
import StudySession from '@/components/study/StudySession'
import Link from 'next/link'

export default async function StudyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  const level = profile?.current_level ?? 'A1'

  // Fetch words for this level that need study
  // Priority: due for review → new words
  const { data: allWords } = await supabase
    .from('words')
    .select(`
      *,
      word_progress!left(*)
    `)
    .eq('level', level)
    .limit(50)

  const words = (allWords ?? []).map((w: any) => ({
    ...w,
    progress: w.word_progress?.[0] ?? null,
  }))

  // Separate into due and new
  const now = new Date().toISOString()
  const dueWords = words.filter(w =>
    w.progress &&
    w.progress.status !== 'learned' &&
    w.progress.next_review_date &&
    w.progress.next_review_date <= now
  )
  const newWords = words.filter(w => !w.progress || w.progress.status === 'new')

  const studyQueue = [...dueWords, ...newWords].slice(0, 20)

  if (studyQueue.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 wq-animate-in">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold mb-3">Harikasın!</h2>
        <p className="mb-8" style={{ color: 'var(--wq-text-muted)' }}>
          {level} seviyesindeki tüm kelimeler tamamdır. Tekrar gelmeden önce bekleyebilir
          ya da bir sonraki seviyeyi deneyebilirsin.
        </p>
        <Link href="/dashboard"
          className="px-6 py-3 rounded-xl font-semibold"
          style={{ background: 'var(--wq-primary)', color: '#fff' }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    )
  }

  return (
    <StudySession
      words={studyQueue}
      userId={user!.id}
      level={level}
    />
  )
}
