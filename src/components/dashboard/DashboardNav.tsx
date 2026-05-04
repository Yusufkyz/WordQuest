'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

const NAV_ITEMS = [
  { href: '/dashboard',          icon: '🏠', label: 'Ana Sayfa'    },
  { href: '/dashboard/study',    icon: '📚', label: 'Çalış'        },
  { href: '/dashboard/review',   icon: '🔄', label: 'Tekrar'       },
  { href: '/dashboard/words',    icon: '📖', label: 'Kelimelerim'  },
  { href: '/dashboard/progress', icon: '📊', label: 'İlerleme'     },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Ayarlar'     },
]

export default function DashboardNav({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-20"
      style={{
        background: 'var(--wq-surface)',
        borderRight: '1px solid var(--wq-border)',
      }}>

      {/* Logo */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <span className="font-extrabold text-lg tracking-tight">WordQuest</span>
        </div>
      </div>

      {/* User card */}
      <div className="mx-4 mb-6 p-3 rounded-xl"
        style={{ background: 'var(--wq-surface-2)', border: '1px solid var(--wq-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--wq-primary-glow)', color: 'var(--wq-primary)' }}>
            {user?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user?.full_name ?? 'Kullanıcı'}</div>
            <div className="text-xs truncate" style={{ color: 'var(--wq-text-muted)' }}>
              ⚡ {user?.total_xp ?? 0} XP
            </div>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="mx-4 mb-6 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.2)' }}>
        <span>🔥</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--wq-gold)' }}>
          {user?.streak_count ?? 0} günlük seri
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background:  active ? 'var(--wq-primary-glow)' : 'transparent',
                color:       active ? 'var(--wq-primary)'      : 'var(--wq-text-muted)',
                borderLeft:  active ? '2px solid var(--wq-primary)' : '2px solid transparent',
              }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Level badge */}
      <div className="mx-4 mb-4">
        <div className={`px-3 py-2 rounded-xl text-center text-xs font-bold border level-${(user?.current_level ?? 'a1').toLowerCase()}`}>
          Seviye: {user?.current_level ?? 'A1'}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--wq-border)' }}>
        <button onClick={handleLogout}
          className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 flex items-center gap-3"
          style={{ color: 'var(--wq-text-muted)', background: 'var(--wq-surface-2)' }}>
          <span>🚪</span> Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
