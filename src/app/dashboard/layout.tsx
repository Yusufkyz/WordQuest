import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--wq-bg)' }}>
      <div className="wq-glow-bg" />
      <DashboardNav user={profile} />
      <main className="relative z-10 flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
