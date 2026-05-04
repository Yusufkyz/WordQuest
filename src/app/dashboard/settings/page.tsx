'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Level } from '@/types'
import { LEVEL_ORDER } from '@/lib/utils'

export default function SettingsPage() {
  const supabase = createClient()

  const [profile, setProfile]   = useState<User | null>(null)
  const [name, setName]         = useState('')
  const [goal, setGoal]         = useState(10)
  const [level, setLevel]       = useState<Level>('A1')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setProfile(data)
            setName(data.full_name ?? '')
            setGoal(data.daily_goal ?? 10)
            setLevel(data.current_level ?? 'A1')
          }
        })
    })
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    await supabase.from('users').update({
      full_name:     name,
      daily_goal:    goal,
      current_level: level,
    }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64"
        style={{ color: 'var(--wq-text-muted)' }}>
        Yükleniyor…
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto wq-animate-in">
      <h1 className="text-2xl font-bold mb-8">Ayarlar</h1>

      <div className="rounded-2xl p-8 space-y-6"
        style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2"
            style={{ color: 'var(--wq-text-muted)' }}>Ad Soyad</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{
              background: 'var(--wq-surface-2)',
              border: '1px solid var(--wq-border)',
              color: 'var(--wq-text)',
            }}
          />
        </div>

        {/* Daily goal */}
        <div>
          <label className="block text-sm font-medium mb-2"
            style={{ color: 'var(--wq-text-muted)' }}>
            Günlük Hedef: <strong style={{ color: 'var(--wq-accent)' }}>{goal} kelime</strong>
          </label>
          <input
            type="range" min={5} max={50} step={5}
            value={goal}
            onChange={e => setGoal(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs mt-1"
            style={{ color: 'var(--wq-text-faint)' }}>
            <span>5</span><span>50</span>
          </div>
        </div>

        {/* Current level */}
        <div>
          <label className="block text-sm font-medium mb-2"
            style={{ color: 'var(--wq-text-muted)' }}>Çalışma Seviyesi</label>
          <div className="flex gap-2 flex-wrap">
            {LEVEL_ORDER.map(lvl => (
              <button key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all level-${lvl.toLowerCase()}`}
                style={{
                  opacity: level === lvl ? 1 : 0.4,
                  transform: level === lvl ? 'scale(1.05)' : 'scale(1)',
                }}>
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Stats (read-only) */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--wq-border)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--wq-text-muted)' }}>
            Hesap Bilgileri
          </h3>
          <div className="space-y-2 text-sm" style={{ color: 'var(--wq-text-faint)' }}>
            <div className="flex justify-between">
              <span>E-posta</span>
              <span style={{ color: 'var(--wq-text-muted)' }}>{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam XP</span>
              <span style={{ color: 'var(--wq-gold)' }}>⚡ {profile.total_xp}</span>
            </div>
            <div className="flex justify-between">
              <span>Günlük Seri</span>
              <span style={{ color: 'var(--wq-warn)' }}>🔥 {profile.streak_count} gün</span>
            </div>
            <div className="flex justify-between">
              <span>Üyelik Tarihi</span>
              <span>{new Date(profile.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: saved ? 'var(--wq-accent)' : 'var(--wq-primary)', color: '#fff' }}>
          {saving ? 'Kaydediliyor…' : saved ? '✓ Kaydedildi!' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
